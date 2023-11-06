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

router.route("/").post(createDonation).get(
  // protect,
   allDonations);

router.route("/:user_id").get(
  // protect,
  allUserDonations
);
router.route("/:id").post(updateDonation).get(getDonation).delete(deleteDonation);

module.exports = router;
