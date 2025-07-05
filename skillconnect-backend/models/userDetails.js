const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // string _id as primary key
    username: String,
    phoneNumber: { type: String, unique: true },
    email: { type: String, unique: true },
    hashedPassword: String,
    userType: {
      type: String,
      enum: ['customer', 'business'],
      default: 'customer',
    },
    firstName: String,
    lastName: String,
    address: {
      street: String,
      barangay: String,
      cityMunicipality: String,
      province: String,
      zipCode: String,
    },

    // Verification
    isVerifiedBusiness: {
      type: Boolean,
      default: function () {
        return this.userType === 'customer' ? true : false;
      }
    },
    verificationDocuments: [
      {
        documentType: String,
        fileReference: String,
        status: String,
      }
    ],

    serviceCategory: {
      type: String,
      required: function () { return this.userType === 'business'; },
    },
    unavailableSlots: [
      {
        date: String,
        times: [String],
      }
    ],
    location: {
      lat: Number,
      lng: Number
    },
    skills: {
      type: [String],
      default: [],
    },
    isSuspended: { type: Boolean, default: false },
    isRejected: { type: Boolean, default: false },
    rateAmount: { type: Number },
    rateUnit: { type: String },
    avatar: { type: String, default: "" },
  },
  {
    collection: "users",
  }
);

mongoose.model("users", UserDetailsSchema);
