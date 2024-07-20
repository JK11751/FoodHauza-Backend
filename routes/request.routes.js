const express = require("express");
const {
  createDonationRequest,
  allDonationRequests,
  deleteDonationRequest,
  updateDonationRequest,
  getDonationRequest,
  getRequestsForDonor,
} = require("../controllers/request.controller");
const {protect} = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").post(createDonationRequest).get(
  // protect,
  allDonationRequests
);
router.route("/donor").get(protect, getRequestsForDonor);
router
  .route("/:id")
  .post(updateDonationRequest)
  .get(getDonationRequest)
  .delete(deleteDonationRequest);

module.exports = router;
