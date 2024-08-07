const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema(
  {
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profile_pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    role: {type: String, required: true},
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date }, 
  },
  {
    timestamps: true,
  }
)
//logic to match password to the one in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//next is a middleware
//logic to encrypt a password
userSchema.pre("save", async function (next) {
  // Ensure that the password is modified before hashing
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


const User = mongoose.model("User", userSchema);

module.exports = User;