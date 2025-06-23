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

app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000",
  "https://skill-connect-git-main-mark-vincents-projects.vercel.app",
  "https://skill-connect-epz1sxqg8-mark-vincents-projects.vercel.app",
  "https://skill-share-sand.vercel.app",
  "https://skill-connect-3yn7ulmbr-mark-vincents-projects.vercel.app" // <-- add this line
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: false,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

require("./models/userDetails");
require("./models/imageDetails");
require("./models/booking")

const User = mongoose.model("users");
const Images = mongoose.model("images")
const Booking = mongoose.model("booking")

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

        const _id = uuidv4();
        await User.create({
            _id,
            firstName,
            lastName,
            username: `${firstName} ${lastName}`,
            phoneNumber,
            email,
            hashedPassword,
            address,
            userType: "customer",
        });

        res.send({ status: "success", _id });
    } catch (error) {
        console.error("Registration error:", error);
        res.send({ status: "error", error });
    }
});

app.post("/updateUser", async (req, res) => {
    const { _id, firstName, lastName, phoneNumber, password, address } = req.body;
    try {
        const updateFields = {
            firstName,
            lastName,
            phoneNumber,
            address,
        };
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.hashedPassword = hashedPassword;
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

    const hashed = user.hashedPassword;
    if (!hashed) return res.status(400).json({ status: "error", error: "No password set for user" });

    const isPasswordValid = await bcrypt.compare(password, hashed);
    if (!isPasswordValid) return res.status(400).json({ status: "error", error: "Invalid Password" });

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "50m" });

    return res.status(201).json({
        status: "success",
        data: token,
        userType: user.userType,
        isVerifiedBusiness: user.isVerifiedBusiness
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

// Get all business providers
app.get("/providerList", async (req, res) => {
  try {
    const providers = await User.find({ userType: "business", isVerifiedBusiness: { $ne: false } }).select(
      "_id firstName lastName email phoneNumber address serviceCategory"
    );

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
      "_id firstName lastName email phoneNumber address serviceCategory governmentId"
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
      image: `/images/${provider.governmentId || "default.jpg"}`
    };

    res.json({ status: "ok", data: formatted });
  } catch (error) {
    console.error("Error fetching provider:", error);
    res.status(500).json({ status: "error", error: "Failed to fetch provider details" });
  }
});

///////////////////////////////////
// For booking
app.post("/book", async (req, res) => {
  const { customerId, providerId, serviceCategory, date, time } = req.body;

  try {
    const bookingId = uuidv4();
    const booking = await Booking.create({ _id: bookingId, customerId, providerId, serviceCategory, date, time });

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
      fileReference: files.nbiClearance?.[0]?.filename
        ? `/uploads/${files.nbiClearance[0].filename}`
        : "",
      status: files.nbiClearance?.[0] ? "uploaded" : "missing",
    },
    {
      documentType: "barangay_clearance",
      fileReference: files.barangayClearance?.[0]?.filename
        ? `/uploads/${files.barangayClearance[0].filename}`
        : "",
      status: files.barangayClearance?.[0] ? "uploaded" : "missing",
    },
    {
      documentType: "training_certificate",
      fileReference: files.certificate?.[0]?.filename
        ? `/uploads/${files.certificate[0].filename}`
        : "",
      status: files.certificate?.[0] ? "uploaded" : "missing",
    },
    {
      documentType: "government_id",
      fileReference: files.governmentId?.[0]?.filename
        ? `/uploads/${files.governmentId[0].filename}`
        : "",
      status: files.governmentId?.[0] ? "uploaded" : "missing",
    },
  ];

  try {
    const oldUser = await User.findOne({ email });
    if (oldUser) return res.send({ error: "Email already exists" });

    const oldPhone = await User.findOne({ phoneNumber });
    if (oldPhone) return res.send({ error: "Phone Number Already Exists" });

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
    const pending = allBusinesses.filter(biz => !biz.isVerifiedBusiness);
    const verified = allBusinesses.filter(biz => biz.isVerifiedBusiness);
    res.json({
      pending: pending.map(biz => ({
        id: biz._id, // frontend expects "id"
        ...biz._doc
      })),
      verified: verified.map(biz => ({
        id: biz._id, // frontend expects "id"
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
    const imageName = req.file.filename;
    const { userId } = req.body;
    try {
        await Images.create({ image: imageName, userId });
        res.json({ status: "ok", image: imageName });
    } catch (error) {
        res.json({ status: "error", error });
    }
});

app.get("/user-profile-image/:userId", async (req, res) => {
    try {
        const img = await Images.findOne({ userId: req.params.userId }).sort({ _id: -1 });
        if (!img) return res.json({ status: "not_found" });
        res.json({ status: "ok", image: img.image });
    } catch (error) {
        res.json({ status: "error", error });
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
      subject: "Personnel In-Charge Details",
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

// Retrieve user by _id (string)
app.get("/user/by-id/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id });
  if (!user) {
    return res.status(404).json({ status: "error", error: "User not found" });
  }
  res.json({ status: "ok", data: user });
});

app.get("/", (req, res) => {
  res.send("SkillConnect backend is running!");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
