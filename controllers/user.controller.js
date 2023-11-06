const asyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");
const User = require("../models/user.model");

const registerUser = asyncHandler(async (req, res) => {
  const {name, email, password, profile_pic, role} = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please enter your name");
  }

  if (!name) {
    res.status(400);
    throw new Error("Please enter your email");
  }

  if (!password) {
    res.status(400);
    throw new Error("Please enter your password");
  }

  if (!role) {
    res.status(400);
    throw new Error("Please enter your role");
  }
  const userExists = await User.findOne({email});

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    profile_pic,
    role,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profile_pic: user.profile_pic,
      role: role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json("failed to create user");
    throw new Error("Failed to create the user");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const {email, password} = req.body;

  const user = await User.findOne({email});

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profile_pic: user.profile_pic,
      role: user.role,
      token: generateToken(user._id),
    });
    res.status(200)
  } else {
    res.status(401)
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
              {name: {$regex: req.query.search, $options: "i"}},
              {email: {$regex: req.query.search, $options: "i"}},
            ],
          }
        : {};

      const users = await User.find(keyword).find({
        _id: {$ne: req.user._id},
      });
      res.send(users);
    }

    const users = await User.find({}, {}, {lean: true});
    res.status(200).json(users);
  } catch (error) {
    res.status(400);
    throw new Error(`${error}`);
  }
});

module.exports = {registerUser, authUser, allUsers};
