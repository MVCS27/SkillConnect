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

    // Business-only fields
    nbiClearance: {
      type: String, // File path or base64 string
      required: function () {
        return this.userType === 'business';
      },
    },
    barangayClearance: {
      type: String,
      required: function () {
        return this.userType === 'business';
      },
    },
    certificate: {
      type: String,
      required: function () {
        return this.userType === 'business';
      },
    },
    governmentId: {
      type: String,
      required: function () {
        return this.userType === 'business';
      },
    },
    serviceCategory: {
      type: String, // e.g., carpenter, electrician
      required: function () {
        return this.userType === 'business';
      },
    },
  },
  {
    collection: "users",
  }
);

mongoose.model("users", UserDetailsSchema);
