const express = require("express");
const app = express();

const mongoose = require("mongoose");
const mongoUrl = "mongodb+srv://sagunmarkvincent:mrfBFQu9PjFwOlTt@users.cxjs7.mongodb.net/Users";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const JWT_SECRET = "qwertyuiop123567890asdfghjkl!@#$%^&*()_+zxcvbnm,./"

const cors = require("cors");
const nodemailer = require("nodemailer");

app.use(express.json());

app.use(cors());
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: false,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

mongoose.connect(mongoUrl,{
    useNewUrlParser:true
    })
        .then(() => {console.log("Connected to database");
    })
        .catch((e) => console.log(e));

require("./models/userDetails");
require("./models/imageDetails");
require("./models/booking")

//Clien Schema
const User = mongoose.model("users");
//Image Schema
const Images = mongoose.model("images")
//Booking Schema
const Booking = mongoose.model("booking")

//Customer Registry
app.post("/register", async (req, res) => {
    const { firstName, lastName, mobile, email, password, address  } = req.body;

    //const username = `${firstName} ${lastName}`.trim(); // Combine firstName and lastName
    const encryptedPassword = await bcrypt.hash(password, 10);

    try {
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.send({ error: "Email Already Exists" });
        }

        await User.create({
            firstName,
            lastName,
            username: `${firstName} ${lastName}`,
            mobile,
            email,
            password: encryptedPassword,
            address,
            userType: "customer",
        });

        res.send({ status: "success!" });
    } catch (error) {
        console.error("Registration error:", error);
        res.send({ status: "error", error });
    }
});

app.post("/updateUser", async (req, res) => {
    const {id, firstName, lastName, mobile } = req.body;
    try {
        await User.updateOne({ _id: id}, {
            $set: {
                firstName: firstName,
                lastName: lastName,
                mobile: mobile,
            }
        })
        return res.json({status: "ok", data: "updated"})
    } catch (error) {
         return res.json({status: "error", data: "error"})
    }
})

// User Login
app.post("/loginUser", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.send({ error: "User Not Found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ status: "error", error: "Invalid Password" });

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "50m" });

    return res.status(201).json({
        status: "success!",
        data: token,
        userType: user.userType,
        isVerifiedBusiness: user.isVerifiedBusiness // <-- add this
    });
});

// Token
app.post("/userData", async (req, res) => {
  const { token } = req.body;

  try {
    const user = jwt.verify(token, JWT_SECRET); // ✅ no callback here
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
    const providers = await User.find({ userType: "business" }).select(
      "_id firstName lastName email mobile address serviceCategory"
    );

    const formatted = providers.map((provider) => ({
      _id: provider._id,
      firstName: provider.firstName,
      lastName: provider.lastName,
      serviceCategory: provider.serviceCategory || "Service Provider", // <-- FIXED
      email: provider.email,
      mobile: provider.mobile,
      address: provider.address,
      distance: Math.floor(Math.random() * 5) + 1,
      image: `/images/${provider.governmentId || "default.jpg"}`,
    }));

    res.json({ status: "ok", data: formatted });
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ status: "error", error: "Failed to fetch providers" });
  }
});

// Get specific business details from id
app.get("/provider/:id", async (req, res) => {
  try {
    const provider = await User.findById(req.params.id).select(
      "_id firstName lastName email mobile address serviceCategory governmentId"
    );
    if (!provider) {
      return res.status(404).json({ status: "error", error: "Provider not found" });
    }

    const formatted = {
      _id: provider._id, // ✅ Include _id so frontend can book correctly
      firstName: provider.firstName,
      lastName: provider.lastName,
      email: provider.email,
      mobile: provider.mobile,
      serviceCategory: provider.serviceCategory || "Service Provider",
      address: provider.address,
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
    const booking = await Booking.create({ customerId, providerId, serviceCategory, date, time });

    // Properly populate after creation
    const populatedBooking = await Booking.findById(booking._id)
      .populate("providerId", "firstName lastName")
      .populate("customerId", "firstName lastName");

    res.json({ status: "ok", data: populatedBooking });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ status: "error", error: "Booking failed" });
  }
});

app.get("/bookings/customer/:id", async (req, res) => {
  const bookings = await Booking.find({ customerId: req.params.id }).populate("providerId", "firstName lastName");
  res.json({ status: "ok", data: bookings });
});

app.get("/bookings/provider/:id", async (req, res) => {
  try {
    const bookings = await Booking.find({ providerId: req.params.id })
      .populate("customerId", "firstName lastName"); // <-- make sure this line exists
    res.json({ status: "ok", data: bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ status: "error", error: "Failed to get bookings" });
  }
});

app.post("/bookings/update", async (req, res) => {
  const { bookingId, status } = req.body;

  try {
    await Booking.findByIdAndUpdate(bookingId, { status });
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to update status" });
  }
});

// For Callendar Booking
// app.js (backend route)

// For Calendar Booking - FIXED (only one version remains)
app.post("/provider/set-unavailable", async (req, res) => {
  const { providerId, date, times } = req.body;
  try {
    const user = await User.findById(providerId);
    const slot = user.unavailableSlots.find(s => s.date === date);

    if (slot) {
      if (times.length === 0) {
        // Remove the slot for this date if no times left
        await User.updateOne(
          { _id: providerId },
          { $pull: { unavailableSlots: { date } } }
        );
      } else {
        // Update the times for this date (replace with new times)
        await User.updateOne(
          { _id: providerId, "unavailableSlots.date": date },
          { $set: { "unavailableSlots.$.times": times } }
        );
      }
    } else if (times.length > 0) {
      // Add new date with times if not existing
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
    const provider = await User.findById(req.params.id).select("unavailableSlots");
    res.json({ status: "ok", data: provider.unavailableSlots || [] });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to fetch unavailable slots" });
  }
});


///////////////////////////////////////////////////////////////////////////////////////////////

const multer  = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/images/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage });

const businessUpload = upload.fields([
  { name: "nbiClearance", maxCount: 1 },
  { name: "barangayClearance", maxCount: 1 },
  { name: "certificate", maxCount: 1 },
  { name: "governmentId", maxCount: 1 },
]);

app.post("/register-business", businessUpload, async (req, res) => {
  const {
    firstName,
    lastName,
    mobile,
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

  const encryptedPassword = await bcrypt.hash(password, 10);
  const files = req.files;

  // Prepare verificationDocuments array with correct documentType and fileReference
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

    await User.create({
      firstName,
      lastName,
      username: `${firstName} ${lastName}`,
      mobile,
      email,
      password: encryptedPassword,
      userType: "business",
      address,
      serviceCategory,
      verificationDocuments,
      isVerifiedBusiness: false, // Always false for new business
      // nbiClearance, barangayClearance, certificate, governmentId REMOVED
    });

    res.send({ status: "success" });
  } catch (err) {
    console.error(err);
    res.send({ status: "error", error: err });
  }
});


// Image upload endpoint
app.get("/get-images", async (req, res) => {
    try {
        await Images.find({}).then(data => {
            res.send ({ status: "ok", data: data})
        })
    } catch (error) {
        res.json({status: error});
    }
})

app.post("/upload-image", upload.single("image"), async (req, res) => {
    const imageName = req.file.filename;
    const { userId } = req.body; // <-- get userId

    try {
        await Images.create({ image: imageName, userId }); // <-- store userId
        res.json({ status: "ok", image: imageName });
    } catch (error) {
        res.json({ status: "error", error });
    }
});

const path = require("path");

// Serve images from /src/images/
app.use('/images', express.static(path.join(__dirname, 'src/images')));

app.get("/user-profile-image/:userId", async (req, res) => {
    try {
        const img = await Images.findOne({ userId: req.params.userId }).sort({ _id: -1 });
        if (!img) return res.json({ status: "not_found" });
        res.json({ status: "ok", image: img.image });
    } catch (error) {
        res.json({ status: "error", error });
    }
});

///////////////////////////////////
//Admin
app.post("/send-admin-password", async (req, res) => {
  const { password } = req.body;
  try {
    // Configure your email transport
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sagunmarkvincent@@gmail.com", // replace with your Gmail
        pass: "oibx hpfb elmo riae" // use an App Password, not your Gmail password
      }
    });

    await transporter.sendMail({
      from: '"SkillShare Admin" <your_gmail@gmail.com>',
      to: "sagunmarkvincent@gmail.com",
      subject: "Your Admin Login Password",
      text: `Your admin login password is: ${password}`,
    });

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Failed to send admin password:", error);
    res.json({ status: "error" });
  }
});

app.post("/admin/verify-business", async (req, res) => {
  const { businessId } = req.body;
  try {
    await User.updateOne({ _id: businessId }, { $set: { isVerifiedBusiness: true } });
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to verify business" });
  }
});

app.get("/businesses", async (req, res) => {
  const pending = await User.find({ userType: "business", isVerifiedBusiness: false });
  const verified = await User.find({ userType: "business", isVerifiedBusiness: true });
  res.json({ pending, verified });
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
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sagunmarkvincent@gmail.com",
        pass: "oibx hpfb elmo riae"
      }
    });

    await transporter.sendMail({
      from: '"SkillShare Admin" <sagunmarkvincent@gmail.com>',
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});