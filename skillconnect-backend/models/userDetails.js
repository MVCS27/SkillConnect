const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema(
  {
    username: String,
    mobile: String,
    email: { type: String, unique: true },
    password: String,
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
        documentType: String, // e.g. "nbi_clearance", "barangay_clearance", "government_id", "training_certificate"
        fileReference: String, // file path or filename
        status: String, // e.g. "uploaded"
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
  },
  {
    collection: "users",
  }
);

mongoose.model("users", UserDetailsSchema);
