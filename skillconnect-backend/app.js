const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const mongoUrl = process.env.MONGO_URL;
mongoose.connect(mongoUrl)
        .then(() => {console.log("Connected to database");})
        .catch((e) => console.log(e));

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const cors = require("cors");

const nodemailer = require("nodemailer");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v4: uuidv4 } = require('uuid');
const geocodeAddress = require("./utils/geocode");
const path = require("path");

const verificationCodes = {}; // In-memory; use DB for production


app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const allowedOrigins = [
  "http://localhost:3000",
  "https://skill-share-sand.vercel.app",
  "https://skill-connect-git-main-mark-vincents-projects.vercel.app",
  "https://skill-connect-epz1sxqg8-mark-vincents-projects.vercel.app",
  // add your main production domains here
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Allow all Vercel preview domains
    if (/^https:\/\/skill-connect-[a-z0-9]+-mark-vincents-projects\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Allow whitelisted domains
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Otherwise, block
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: false,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

require("./models/userDetails");
require("./models/imageDetails");
require("./models/booking");
require("./models/ratingsComments");

const User = mongoose.model("users");
const Images = mongoose.model("images");
const Booking = mongoose.model("booking");
const RatingsComments = mongoose.model("ratingsComments");

// Cloudinary config using .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillconnect_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
  },
});

const upload = require('multer')({ storage: storage });

const businessUpload = upload.fields([
  { name: "nbiClearance", maxCount: 1 },
  { name: "barangayClearance", maxCount: 1 },
  { name: "certificate", maxCount: 1 },
  { name: "governmentId", maxCount: 1 },
]);

// Registration (add _id generation)
app.post("/register", async (req, res) => {
  const { firstName, lastName, phoneNumber, email, password, address } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.send({ error: "Email Already Exists" });
    }

    const oldPhone = await User.findOne({ phoneNumber });
    if (oldPhone) {
      return res.send({ error: "Phone Number Already Exists" });
    }

    // Geocode address
    const fullAddress = `${address.street}, ${address.barangay}, ${address.cityMunicipality}, ${address.province}, ${address.zipCode || ""}`;
    const geo = await geocodeAddress(fullAddress);

    const _id = uuidv4();
    await User.create({
      _id,
      firstName,
      lastName,
      username: `${firstName} ${lastName}`,
      phoneNumber,
      email,
      hashedPassword,
      userType: "customer",
      address,
      location: geo
    });

    res.send({ status: "success", _id });
  } catch (error) {
    console.error("Registration error:", error);
    res.send({ status: "error", error });
  }
});

app.post("/updateUser", async (req, res) => {
    const { _id, firstName, lastName, phoneNumber, password, address, rateAmount, rateUnit } = req.body;
    try {
        const updateFields = {
            firstName,
            lastName,
            phoneNumber,
            address,
            rateAmount, // <-- add this
            rateUnit,   // <-- add this
        };
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.hashedPassword = hashedPassword;
        }
        // Geocode address if present
        if (address) {
            const fullAddress = `${address.street}, ${address.barangay}, ${address.cityMunicipality}, ${address.province}, ${address.zipCode || ""}`;
            const geo = await geocodeAddress(fullAddress);
            updateFields.location = geo;
        }
        const result = await User.updateOne({ _id }, { $set: updateFields });
        if (result.matchedCount === 0 && result.n === 0) {
            return res.json({ status: "error", data: "User not found" });
        }
        return res.json({ status: "ok", data: "updated" });
    } catch (error) {
        return res.json({ status: "error", data: "error" });
    }
})

// User Login
app.post("/loginUser", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.send({ error: "User Not Found" });

    // --- Suspension/rejection checks ---
    if (user.userType === "business") {
      if (user.isSuspended) {
        return res.status(403).json({ status: "suspended", error: "Your business account is suspended. Please contact support." });
      }
      if (user.isRejected) {
        return res.status(403).json({ status: "rejected", error: "Your business account was rejected." });
      }
    }
    // --- End checks ---

    const hashed = user.hashedPassword;
    if (!hashed) return res.status(400).json({ status: "error", error: "No password set for user" });

    const isPasswordValid = await bcrypt.compare(password, hashed);
    if (!isPasswordValid) return res.status(400).json({ status: "error", error: "Invalid Password" });

    // --- Issue token ---
    let token;
    if (user.userType === "admin") {
      // No expiration for admin
      token = jwt.sign({ email: user.email }, JWT_SECRET);
    } else {
      // 50m expiration for others
      token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "50m" });
    }

    return res.status(201).json({
        status: "success",
        data: token,
        userType: user.userType,
        isVerifiedBusiness: user.isVerifiedBusiness,
        user: { _id: user._id } // <-- add this line
    });
});

// Token
app.post("/userData", async (req, res) => {
  const { token } = req.body;

  try {
    const user = jwt.verify(token, JWT_SECRET);
    const userEmail = user.email;

    const userData = await User.findOne({ email: userEmail });

    res.send({ status: "ok", data: userData });

  } catch (err) {
    console.error("Token verification failed:", err);
    return res.send({ status: "error", data: "token expired" });
  }
});

app.post("/user/update-address", async (req, res) => {
  const { userId, address } = req.body;
  const fullAddress = `${address.street}, ${address.barangay}, ${address.cityMunicipality}, ${address.province}, ${address.zipCode || ""}`;
  const geo = await geocodeAddress(fullAddress);

  const updated = await User.findByIdAndUpdate(userId, {
    address,
    location: geo
  }, { new: true });

  res.json({ status: "ok", user: updated });
});

// Get all business providers
app.get("/providerList", async (req, res) => {
  try {
    const providers = await User.find({ userType: "business", isVerifiedBusiness: { $ne: false } }).select(
      "_id firstName lastName email phoneNumber address serviceCategory rateAmount rateUnit"
    ); // <-- add rateAmount rateUnit here

    const formatted = providers.map((provider) => ({
      _id: provider._id,
      firstName: provider.firstName || "",
      lastName: provider.lastName || "",
      serviceCategory: provider.serviceCategory || "Service Provider",
      email: provider.email || "",
      phoneNumber: provider.phoneNumber || "",
      address: provider.address || {},
      distance: Math.floor(Math.random() * 5) + 1,
      image: `/images/${provider.governmentId || "default.jpg"}`,
      rateAmount: provider.rateAmount || "", // <-- add this
      rateUnit: provider.rateUnit || "",     // <-- add this
    }));

    res.json({ status: "ok", data: formatted });
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ status: "error", error: "Failed to fetch providers" });
  }
});

app.get("/provider/:id", async (req, res) => {
  try {
    const provider = await User.findOne({ _id: req.params.id }).select(
      "_id firstName lastName email phoneNumber address serviceCategory governmentId rateAmount rateUnit"
    );
    if (!provider) {
      return res.status(404).json({ status: "error", error: "Provider not found" });
    }

    const formatted = {
      _id: provider._id,
      firstName: provider.firstName || "",
      lastName: provider.lastName || "",
      email: provider.email || "",
      phoneNumber: provider.phoneNumber || "",
      serviceCategory: provider.serviceCategory || "Service Provider",
      address: provider.address || {},
      image: `/images/${provider.governmentId || "default.jpg"}`,
      rateAmount: provider.rateAmount || "",
      rateUnit: provider.rateUnit || "",
    };

    res.json({ status: "ok", data: formatted });
  } catch (error) {
    console.error("Error fetching provider:", error);
    res.status(500).json({ status: "error", error: "Failed to fetch provider details" });
  }
});

///////////////////////////////////////////////////
// Search Filter
app.get("/providers/nearby", async (req, res) => {
  const { lat, lng, maxDistance = 10 } = req.query; // maxDistance in kilometers
  if (!lat || !lng) return res.status(400).json({ status: "error", error: "Missing coordinates" });

  // Get all providers with location
  const providers = await User.find({ userType: "business", location: { $exists: true } });

  // Calculate distance using Haversine formula
  function getDistance(lat1, lng1, lat2, lng2) {
    function toRad(x) { return x * Math.PI / 180; }
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  const nearby = providers.filter(p => {
    if (!p.location || typeof p.location.lat !== "number" || typeof p.location.lng !== "number") return false;
    const dist = getDistance(Number(lat), Number(lng), p.location.lat, p.location.lng);
    return dist <= maxDistance;
  });

  res.json({ status: "ok", data: nearby });
});

///////////////////////////////////
// For booking
app.post("/book", async (req, res) => {
  const { customerId, providerId, serviceCategory, date, time, agreedAmount, agreedUnit } = req.body; // <-- add agreedAmount, agreedUnit

  try {
    const bookingId = uuidv4();
    const booking = await Booking.create({
      _id: bookingId,
      customerId,
      providerId,
      serviceCategory,
      date,
      time,
      agreedAmount, // <-- add this
      agreedUnit    // <-- add this
    });

    // Mark the time as unavailable for the provider
    const user = await User.findOne({ _id: providerId });
    const slot = user.unavailableSlots.find(s => s.date === date);

    if (slot) {
      await User.updateOne(
        { _id: providerId, "unavailableSlots.date": date },
        { $addToSet: { "unavailableSlots.$.times": time } }
      );
    } else {
      await User.updateOne(
        { _id: providerId },
        { $push: { unavailableSlots: { date, times: [time] } } }
      );
    }

    // --- EMAIL NOTIFICATION LOGIC STARTS HERE ---
    // Fetch customer and provider info
    const customer = await User.findOne({ _id: customerId });
    const provider = await User.findOne({ _id: providerId });

    if (customer && provider && customer.email && provider.email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: [customer.email, provider.email],
        subject: "SkillConnect Booking Confirmation",
        text: `A new booking has been made!

Service(s): ${serviceCategory}
Date: ${date}
Time: ${time}
Agreed Payment: ₱${agreedAmount || "N/A"} ${agreedUnit || ""}

Customer: ${customer.firstName} ${customer.lastName} (${customer.email})
Provider: ${provider.firstName} ${provider.lastName} (${provider.email})

Thank you for using SkillConnect!`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Failed to send booking email:", err);
        }
      });
    }
    // --- EMAIL NOTIFICATION LOGIC ENDS HERE ---

    res.json({ status: "ok", data: booking });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ status: "error", error: "Booking failed" });
  }
});

app.get("/bookings/customer/:id", async (req, res) => {
  const bookings = await Booking.find({ customerId: req.params.id })
    .populate("providerId", "firstName lastName email phoneNumber serviceCategory");
  res.json({ status: "ok", data: bookings });
});

app.get("/bookings/provider/:id", async (req, res) => {
  try {
    const bookings = await Booking.find({ providerId: req.params.id })
      .populate("customerId", "firstName lastName email phoneNumber");
    res.json({ status: "ok", data: bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ status: "error", error: "Failed to get bookings" });
  }
});

app.post("/bookings/update", async (req, res) => {
  const { bookingId, status } = req.body;

  try {
    // Find the booking
    const booking = await Booking.findOne({ _id: bookingId });
    if (!booking) {
      return res.status(404).json({ status: "error", error: "Booking not found" });
    }

    // If canceling, remove the time from provider's unavailableSlots
    if (status === "cancelled") {
      const provider = await User.findOne({ _id: booking.providerId });
      if (provider) {
        const slot = provider.unavailableSlots.find(s => s.date === booking.date);
        if (slot) {
          // Remove the time from the slot
          slot.times = slot.times.filter(t => t !== booking.time);
          // If no times left for that date, remove the slot entirely
          if (slot.times.length === 0) {
            provider.unavailableSlots = provider.unavailableSlots.filter(s => s.date !== booking.date);
          }
          await provider.save();
        }
      }
    }

    // Update booking status
    await Booking.updateOne({ _id: bookingId }, { status });
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to update status" });
  }
});

// For Calendar Booking
app.post("/provider/set-unavailable", async (req, res) => {
  const { providerId, date, times } = req.body;
  try {
    const user = await User.findOne({ _id: providerId });
    const slot = user.unavailableSlots.find(s => s.date === date);

    if (slot) {
      if (times.length === 0) {
        await User.updateOne(
          { _id: providerId },
          { $pull: { unavailableSlots: { date } } }
        );
      } else {
        await User.updateOne(
          { _id: providerId, "unavailableSlots.date": date },
          { $addToSet: { "unavailableSlots.$.times": { $each: times } } }
        );
      }
    } else if (times.length > 0) {
      await User.updateOne(
        { _id: providerId },
        { $push: { unavailableSlots: { date, times } } }
      );
    }
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to set unavailable slots" });
  }
});

app.get("/provider/:id/unavailable", async (req, res) => {
  try {
    const provider = await User.findOne({ _id: req.params.id }).select("unavailableSlots");
    res.json({ status: "ok", data: provider.unavailableSlots || [] });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to fetch unavailable slots" });
  }
});

// Update provider skills
app.post("/provider/:id/skills", async (req, res) => {
  const { id } = req.params;
  const { skills } = req.body;
  if (!Array.isArray(skills)) {
    return res.status(400).json({ status: "error", error: "Skills must be an array" });
  }
  try {
    await User.updateOne({ _id: id }, { $set: { skills } });
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to update skills" });
  }
});

// Get provider skills
app.get("/provider/:id/skills", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id, userType: "business" }).select("skills");
    if (!user) return res.status(404).json({ status: "error", error: "Provider not found" });
    res.json({ status: "ok", skills: user.skills || [] });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to fetch skills" });
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////

// Registration for business (add _id generation)
app.post("/register-business", businessUpload, async (req, res) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    email,
    password,
    address: addressStr,
    serviceCategory,
    rateAmount,
    rateUnit,
  } = req.body;

  let address = {};
  try {
    address = JSON.parse(addressStr);
  } catch (err) {
    return res.send({ status: "error", error: "Invalid address format" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const files = req.files;

  const verificationDocuments = [
    {
      documentType: "nbi_clearance",
      fileReference: files.nbiClearance?.[0]?.path
        ? files.nbiClearance[0].path
        : "",
      status: files.nbiClearance?.[0] ? "uploaded" : "missing",
    },
    {
      documentType: "barangay_clearance",
      fileReference: files.barangayClearance?.[0]?.path
        ? files.barangayClearance[0].path
        : "",
      status: files.barangayClearance?.[0] ? "uploaded" : "missing",
    },
    {
      documentType: "training_certificate",
      fileReference: files.certificate?.[0]?.path
        ? files.certificate[0].path
        : "",
      status: files.certificate?.[0] ? "uploaded" : "missing",
    },
    {
      documentType: "government_id",
      fileReference: files.governmentId?.[0]?.path
        ? files.governmentId[0].path
        : "",
      status: files.governmentId?.[0] ? "uploaded" : "missing",
    },
  ];

  try {
    const oldUser = await User.findOne({ email });
    if (oldUser) return res.send({ error: "Email already exists" });

    const oldPhone = await User.findOne({ phoneNumber });
    if (oldPhone) return res.send({ error: "Phone Number Already Exists" });

    // Geocode address
    const fullAddress = `${address.street}, ${address.barangay}, ${address.cityMunicipality}, ${address.province}, ${address.zipCode || ""}`;
    const geo = await geocodeAddress(fullAddress);

    const _id = uuidv4();
    await User.create({
      _id,
      firstName,
      lastName,
      username: `${firstName} ${lastName}`,
      phoneNumber,
      email,
      hashedPassword,
      userType: "business",
      address,
      serviceCategory,
      verificationDocuments,
      isVerifiedBusiness: false,
      location: geo,
      rateAmount,
      rateUnit,
    });

    res.send({ status: "success", _id });
  } catch (err) {
    console.error(err);
    res.send({ status: "error", error: err });
  }
});

// Admin endpoints
app.post("/admin/verify-business", async (req, res) => {
  const { businessId } = req.body;
  try {
    await User.updateOne({ _id: businessId }, { $set: { isVerifiedBusiness: true } });
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to verify business" });
  }
});

// Suspend business
app.post("/admin/suspend-business", async (req, res) => {
  const { businessId, reason } = req.body;
  try {
    const user = await User.findById(businessId);
    if (!user) return res.status(404).json({ status: "error", error: "Business not found" });

    // Send suspension email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "SkillConnect Business Account Suspended",
      text: `Your business account has been suspended for the following reason:\n\n${reason}\n\nPlease contact support for more information.`,
    });

    user.isSuspended = true;
    await user.save();
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to suspend business" });
  }
});

// Unsuspend business
app.post("/admin/unsuspend-business", async (req, res) => {
  const { businessId } = req.body;
  try {
    const user = await User.findById(businessId);
    if (!user) return res.status(404).json({ status: "error", error: "Business not found" });

    user.isSuspended = false;
    await user.save();

    // Send unsuspension email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "SkillConnect Business Account Unsuspended",
      text: `Your business account has been unsuspended. You may now log in and continue using SkillConnect.`,
    });

    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to unsuspend business" });
  }
});

// Reject business
app.post("/admin/reject-business", async (req, res) => {
  const { businessId, reason } = req.body;
  try {
    const user = await User.findById(businessId);
    if (!user) return res.status(404).json({ status: "error", error: "Business not found" });

    user.isRejected = true;
    await user.save();

    // Send rejection email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "SkillConnect Business Account Rejected",
      text: `Your business account has been rejected for the following reason:\n\n${reason}\n\nYou may reapply or contact support for more information.`,
    });

    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to reject business" });
  }
});

// Delete user except username
app.post("/admin/delete-rejected-user", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).json({ status: "error", error: "User not found" });
    if (!user.isRejected) return res.status(400).json({ status: "error", error: "User is not rejected" });

    // Keep username, delete all other fields
    await User.updateOne({ _id: userId }, {
      $set: { 
        phoneNumber: null,
        email: null,
        hashedPassword: null,
        userType: null,
        firstName: null,
        lastName: null,
        address: {},
        isVerifiedBusiness: null,
        verificationDocuments: [],
        serviceCategory: null,
        unavailableSlots: [],
        location: {},
        skills: [],
        isSuspended: null,
        isRejected: null
      }
    });
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to delete user data" });
  }
});


// Get all customers (users with userType "customer")
app.get("/admin/customers", async (req, res) => {
  try {
    const customers = await User.find({ userType: "customer" });
    res.json({ status: "ok", data: customers });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to fetch customers" });
  }
});

// Get all businesses (pending and verified)
app.get("/businesses", async (req, res) => {
  try {
    const allBusinesses = await User.find({ userType: "business" });

    // Split businesses into categories
    const pending = allBusinesses.filter(biz => !biz.isVerifiedBusiness && !biz.isRejected && !biz.isSuspended);
    const verified = allBusinesses.filter(biz => biz.isVerifiedBusiness && !biz.isSuspended && !biz.isRejected);
    const suspended = allBusinesses.filter(biz => biz.isSuspended && !biz.isRejected);
    const rejected = allBusinesses.filter(biz => biz.isRejected);

    res.json({
      pending: pending.map(biz => ({
        id: biz._id,
        ...biz._doc
      })),
      verified: verified.map(biz => ({
        id: biz._id,
        ...biz._doc
      })),
      suspended: suspended.map(biz => ({
        id: biz._id,
        ...biz._doc
      })),
      rejected: rejected.map(biz => ({
        id: biz._id,
        ...biz._doc
      }))
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to fetch businesses" });
  }
});

// Get all bookings
app.get("/admin/bookings", async (req, res) => {
  try {
    // Populate customer and provider info for display
    const bookings = await Booking.find()
      .populate("customerId", "firstName lastName")
      .populate("providerId", "firstName lastName");
    res.json({ status: "ok", data: bookings });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to fetch bookings" });
  }
});

app.post("/send-admin-password", async (req, res) => {
  const { password } = req.body;

  // Use .env credentials
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Use admin email from .env
    subject: "SkillConnect Admin Login Password",
    text: `Your admin login password is: ${password}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Failed to send admin password:", error);
    res.status(500).json({ status: "error", error: "Failed to send email" });
  }
});

app.post("/admin/send-verification-email", async (req, res) => {
  const { email, status } = req.body;
  let subject, text;
  if (status === "success") {
    subject = "Business Verification Approved";
    text = "Congratulations! Your business account has been verified. You can now log in and access your business profile.";
  } else {
    subject = "Business Verification Failed";
    text = "We're sorry, but your business verification was not approved. Please check your documents and try again.";
  }

  try {
    let transporter = getTransporter();

    await transporter.sendMail({
      from: '"SkillShare Admin" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject,
      text,
    });

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    res.json({ status: "error" });
  }
});

// Images
app.post("/upload-image", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            console.error("No file uploaded:", req.file);
            return res.status(400).json({ status: "error", error: "No file uploaded" });
        }
        const imageUrl = req.file.path; // Cloudinary URL
        const { userId, type } = req.body;
        if (!userId) {
            console.error("No userId provided in upload-image");
            return res.status(400).json({ status: "error", error: "No userId provided" });
        }
        await Images.create({ _id: uuidv4(), image: imageUrl, userId, type: type || "gallery" });
        res.json({ status: "ok", image: imageUrl });
    } catch (error) {
        console.error("Upload image error:", error);
        res.status(500).json({ status: "error", error: error.message || error });
    }
});

app.get("/user-profile-image/:userId", async (req, res) => {
    try {
        const img = await Images.findOne({ userId: req.params.userId, type: "profile" }).sort({ _id: -1 });
        if (!img) return res.json({ status: "not_found" });
        res.json({ status: "ok", image: img.image });
    } catch (error) {
        res.json({ status: "error", error });
    }
});

// Get all gallery images for a provider
app.get("/provider/:id/gallery", async (req, res) => {
  try {
    const Images = mongoose.model("images");
    const images = await Images.find({ userId: req.params.id, type: "gallery" }).sort({ _id: -1 });
    res.json({ status: "ok", data: images });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to fetch gallery images" });
  }
});

// Update /send-personel-incharge to use Cloudinary storage
app.post("/send-personel-incharge", upload.single("image"), async (req, res) => {
  const { description, bookingId } = req.body;
  const imagePath = req.file ? req.file.path : null;

  try {
    // 1. Find the booking, customer, and provider
    const booking = await Booking.findById(bookingId)
      .populate("customerId", "email firstName lastName")
      .populate("providerId", "email firstName lastName");
    if (!booking || !booking.customerId || !booking.customerId.email || !booking.providerId || !booking.providerId.email) {
      return res.status(404).json({ status: "error", error: "Booking, customer, or provider not found" });
    }
    const customerEmail = booking.customerId.email;
    const providerEmail = booking.providerId.email;

    // 2. Prepare email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: '"SkillConnect" <' + process.env.EMAIL_USER + '>',
      to: [customerEmail, providerEmail],
      subject: "Personnel in-charge Details",
      text: `Dear ${booking.customerId.firstName || "Customer"},\n\nPersonnel in-charge details:\n${description}`,
      html: `<p>Dear ${booking.customerId.firstName || "Customer"},</p>
             <p><b>Personnel in-charge details:</b></p>
             <p>${description}</p>
             ${imagePath ? `<img src="cid:personelphoto" style="max-width:300px; border-radius:8px;" />` : ""}`
    };

    // 3. Attach image if present
    if (imagePath) {
      mailOptions.attachments = [{
        filename: req.file.originalname,
        path: imagePath,
        cid: "personelphoto"
      }];
    }

    // 4. Send email
    await transporter.sendMail(mailOptions);

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Failed to send personnel in-charge email:", error);
    res.status(500).json({ status: "error", error: "Failed to send email" });
  }
});

app.post("/booking/confirm-complete", async (req, res) => {
  const { bookingId, userType } = req.body;
  const update = {};
  if (userType === "customer") update.customerConfirmed = true;
  if (userType === "provider") update.providerConfirmed = true;

  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { $set: update },
    { new: true }
  );

  if (!booking) return res.status(404).json({ status: "error", error: "Booking not found" });

  // If both confirmed, mark as complete and send email
  let bothConfirmed = false;
  if (booking.customerConfirmed && booking.providerConfirmed) {
    booking.status = "complete";
    await booking.save();

    // Send email to both
    const customer = await User.findById(booking.customerId);
    const provider = await User.findById(booking.providerId);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // --- RECEIPT EMAIL ---
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: [customer.email, provider.email],
      subject: "Booking Completed - Receipt",
      text: `Your booking for ${booking.serviceCategory} is now marked as complete.

Booking Details:
Service: ${booking.serviceCategory}
Date: ${booking.date}
Time: ${booking.time}
Agreed Payment: ₱${booking.agreedAmount || "N/A"} ${booking.agreedUnit || ""}
Customer: ${customer.firstName} ${customer.lastName} (${customer.email})
Provider: ${provider.firstName} ${provider.lastName} (${provider.email})

Thank you for using SkillConnect!`,
    };

    await transporter.sendMail(mailOptions);
    bothConfirmed = true;
  }

  res.json({ status: "ok", bothConfirmed });
});

app.get("/booking/confirmation-status/:bookingId", async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) return res.status(404).json({ status: "error", error: "Booking not found" });
  res.json({
    status: "ok",
    confirmed: {
      customer: !!booking.customerConfirmed,
      provider: !!booking.providerConfirmed,
    }
  });
});

// Send new password email change notification
app.post("/send-password-changed-email", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user || !user.email) {
      return res.status(404).json({ status: "error", error: "User not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your SkillConnect Password Was Changed",
      text: `Hello ${user.firstName || ""},\n\nYour password was changed. If this wasn't you, please contact the admin immediately.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Failed to send password changed email:", error);
    res.status(500).json({ status: "error", error: "Failed to send email" });
  }
});

// Submit a rating/comment
app.post("/provider/rate", async (req, res) => {
  const { providerId, customerId, userName, rating, comment } = req.body;
  try {
    await RatingsComments.create({ providerId, customerId, userName, rating, comment });
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to submit rating" });
  }
});

// Get all ratings/comments for a provider
app.get("/provider/:id/ratings", async (req, res) => {
  try {
    const ratings = await RatingsComments.find({ providerId: req.params.id }).sort({ createdAt: -1 });
    res.json({ status: "ok", data: ratings });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to fetch ratings" });
  }
});

// Get average rating for a provider
app.get("/provider/:id/average-rating", async (req, res) => {
  try {
    const ratings = await RatingsComments.find({ providerId: req.params.id });
    if (ratings.length === 0) return res.json({ status: "ok", average: 0 });
    const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    res.json({ status: "ok", average: avg.toFixed(2) });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to fetch average rating" });
  }
});

// Retrieve user by _id (string)
app.get("/user/by-id/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id });
  if (!user) {
    return res.status(404).json({ status: "error", error: "User not found" });
  }
  res.json({ status: "ok", data: user });
});

// Retrieve user by email
app.get("/user/by-email/:email", async (req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ status: "error", error: "User not found" });
  }
  res.json({ status: "ok", data: user });
});

// Retrieve user by username
app.get("/user/by-username/:username", async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username: username });
  if (!user) {
    return res.status(404).json({ status: "error", error: "User not found" });
  }
  res.json({ status: "ok", data: user });
});

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(toEmail, code) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"SkillConnect" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'SkillConnect Email Verification Code',
    text: `Your verification code is: ${code}`,
  });
}

app.post('/send-code', async (req, res) => {
  const { email } = req.body;
  const code = generateCode();
  verificationCodes[email] = code;

  try {
    await sendVerificationEmail(email, code);
    res.json({ success: true, message: 'Verification code sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Email failed to send.' });
  }
});

app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  if (verificationCodes[email] === code) {
    delete verificationCodes[email];
    res.json({ success: true, message: 'Email verified.' });
  } else {
    res.status(400).json({ success: false, message: 'Incorrect code.' });
  }
});

app.get("/", (req, res) => {
  res.send("SkillConnect backend is running!");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

app.delete("/provider/:providerId/gallery/:imageId", async (req, res) => {
  try {
    const { providerId, imageId } = req.params;
    const image = await Images.findOne({ _id: imageId, userId: providerId });
    if (!image) return res.status(404).json({ status: "error", error: "Image not found" });

    // Optionally: delete from Cloudinary as well (if you want)
    const publicId = image.image.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);

    await Images.deleteOne({ _id: imageId });
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to delete image" });
  }
});
