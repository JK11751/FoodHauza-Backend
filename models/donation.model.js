const mongoose = require("mongoose");

const donationItemSchema = mongoose.Schema(
  {
   food: {
      type: Array,
      required: true
   },
    description: {type: String, required: false},
    images: {
      type: Array,
      required: true,
      default:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8bWVkaWNpbmV8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
    },
    category: {
      type: String,
      required: true,
      default: "Raw Food",
    },
    amount: {type: Number, required: true, default: 0.0},
    unit: {type: String, required: true},
  }
);

const donationSchema = mongoose.Schema(
  {
    location: {type: String, required: true},
    //location: {type: Array, required: true},
    foods: [donationItemSchema],
    creator: [{ref: "User", type: mongoose.Schema.Types.ObjectId}],
    status: { type: String, required: true, default: "Pending" },
    requested: {type: Boolean, required: true, default: false},
  },
  {
    timestamps: true,
  }
);

const Donation = mongoose.model("DonationPack", donationSchema);

module.exports = Donation;
