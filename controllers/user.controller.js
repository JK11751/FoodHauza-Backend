const asyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");
const User = require("../models/user.model");
const crypto = require("crypto");
const sendEmail = require("../config/SendEmail");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, profile_pic, role } = req.body;

  if (!email || !name || !password || !role) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = new Date(Date.now() + 1 * 60 * 1000);

  const user = await User.create({
    name,
    email,
    password,
    profile_pic,
    role,
    isVerified: false,
    otp,
    otpExpiry,
  });

  if (user) {
    await sendEmail({
      to: email,
      subject: "Verify your account",
      text: `Your OTP is ${otp}`,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: "OTP sent to email",
    });
  } else {
    res.status(400).json("Failed to create user");
    throw new Error("Failed to create the user");
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    res.status(400);
    throw new Error("Invalid user");
  }

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.status(200).json({
    message: "OTP verified successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_pic: user.profile_pic, // Optional, include if needed
      isVerified: user.isVerified,
    },
    token: generateToken(user._id),
  });
});

const resendOTP = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    res.status(400);
    throw new Error("Invalid user");
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error("User is already verified");
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = new Date(Date.now() + 1 * 60 * 1000); // 1 minute expiry

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Verify your account",
    text: `Your new OTP is ${otp}`,
  });

  res.status(200).json({
    message: "OTP resent successfully",
  });
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profile_pic: user.profile_pic,
      role: user.role,
      token: generateToken(user._id),
    });
    res.status(200);
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

// /api/user?search=janedoe
const allUsers = asyncHandler(async (req, res) => {
  try {
    if (req.query.search) {
      const keyword = req.query.search
        ? {
            $or: [
              { name: { $regex: req.query.search, $options: "i" } },
              { email: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};

      const users = await User.find(keyword).find({
        _id: { $ne: req.user._id },
      });
      res.send(users);
    }

    const users = await User.find({}, {}, { lean: true });
    res.status(200).json(users);
  } catch (error) {
    res.status(400);
    throw new Error(`${error}`);
  }
});
const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, email,profile_pic } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (name) user.name = name;
  if(profile_pic) user.profile_pic = profile_pic;
  if (email) user.email = email;
  //if (password) user.password = password; 

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    profile_pic: updatedUser.profile_pic, // Optional, include if needed
  });
});


module.exports = { registerUser, authUser, updateUser,allUsers, verifyOTP, resendOTP };
