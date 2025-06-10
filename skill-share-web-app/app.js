const express = require("express");
const app = express();

const mongoose = require("mongoose");
const mongoUrl = "mongodb+srv://sagunmarkvincent:mrfBFQu9PjFwOlTt@users.cxjs7.mongodb.net/Users";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const JWT_SECRET = "qwertyuiop123567890asdfghjkl!@#$%^&*()_+zxcvbnm,./"

const cors = require("cors");

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

require("./src/models/userDetails");
require("./src/models/imageDetails");
require("./src/models/booking")

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
    if (!user) {
        return res.send({ error: "User Not Found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ status: "error", error: "Invalid Password" });
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
        expiresIn: "50m",
    });

    return res.status(201).json({ 
        status: "success!", 
        data: token, 
        userType: user.userType   // ✅ This line is what your frontend needs
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
      service: provider.serviceCategory || "Service Provider",
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

// For booking
app.post("/book", async (req, res) => {
  const { customerId, providerId, serviceCategory } = req.body;

  try {
    const booking = await Booking.create({ customerId, providerId, serviceCategory });

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
      address, // correctly parsed object
      serviceCategory,
      nbiClearance: files.nbiClearance?.[0].filename || "",
      barangayClearance: files.barangayClearance?.[0].filename || "",
      certificate: files.certificate?.[0].filename || "",
      governmentId: files.governmentId?.[0].filename || "",
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
    console.log(req.body);
    const imageName = req.file.filename;  

    try {
        await Images.create({image: imageName});
        res.json({ status: "ok"});
    } catch (error) {
        res.json({status: error});
    }
});

const path = require("path");

// Serve images from /src/images/
app.use('/images', express.static(path.join(__dirname, 'src/images')));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});