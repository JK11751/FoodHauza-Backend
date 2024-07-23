const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  verifyOTP,
  resendOTP,
  updateUser ,
} = require("../controllers/user.controller");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(protect, allUsers);
router.route("/register").post(registerUser)
router.post("/login", authUser);
router.post("/verify", verifyOTP);
router.post("/resend-otp", resendOTP);
router.put("/user/:userId", updateUser);

module.exports = router;
