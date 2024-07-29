const express = require("express");
const {
  createDonationRequest,
  allDonationRequests,
  deleteDonationRequest,
  updateDonationRequest,
  getDonationRequest,
  checkUserRequest,
  acceptDonationRequest,
  rejectDonationRequest,
} = require("../controllers/request.controller");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").post(createDonationRequest).get(
  // protect,
  allDonationRequests
);
router.route("/check").get(checkUserRequest);

router
  .route("/:id")
  .post(updateDonationRequest)
  .get(getDonationRequest)
  .delete(deleteDonationRequest);

router.route("/accept/:id").put(acceptDonationRequest);
router.route("/reject/:id").put(rejectDonationRequest);
module.exports = router;
