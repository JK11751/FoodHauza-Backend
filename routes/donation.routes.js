const express = require("express");
const {
  createDonation,
  allDonations,
  allUserDonations,
  updateDonation,
  getDonation,
  deleteDonation,
} = require("../controllers/donation.controller");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").post(createDonation).get(allDonations);

// Adjusted route for user-specific donations
router.route("/user/:user_id").get(allUserDonations);

// Kept the same for single donation operations
router.route("/:id").post(updateDonation).get(getDonation).delete(deleteDonation);

module.exports = router;