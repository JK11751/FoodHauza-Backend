const asyncHandler = require("express-async-handler");
const Donation = require("../models/donation.model");
const Request = require("../models/request.model");

const createDonationRequest = asyncHandler(async (req, res) => {
  const {
    donation,
    requestor,
   status,
    requested_date,
  } = req.body;

  if (!donation || !requested_date || !requestor) {
    res.status(400);
    throw new Error("Please fill all fields");
  }

  // Check if there's already a request for this donation
  const existingRequest = await Request.findOne({ donation, cancelled: false });

  if (existingRequest) {
    return res
      .status(400)
      .json({ message: "This donation has already been requested" });
  }

  const newRequest = {
    donation,
    requestor,
    status,
    requested_date,
  };
  try {
    var request = await Request.create(newRequest);
    request = await request.populate("requestor", "name email profile_pic");

    // Update the donation's requested field to true
    await Donation.findByIdAndUpdate(
      donation,
      { requested: true },
      { new: true }
    );

    if (donation) {
      res.status(201).json({
        _id: request._id,
        donation: request.donation,
        requestor: request.requestor,
        status: request.status,
        
        requested_date: request.requested_date,
      });
    }
  } catch (error) {
    res.status(400);
    throw new Error("Failed to create the donation request");
  }
});

// /api/user?search=janedoe
const allDonationRequests = asyncHandler(async (req, res) => {
  try {
    await Request.find({ requestor: req.query.user_id })
      .populate("requestor", "name profile_pic email")
      .then(async (results) => {
        results = await Donation.populate(results, {
          path: "donation",
          select: "location foods",
        });

        console.log(results);
        res.status(200).json(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error("Failed to get the donation requests");
  }
});

const getDonationRequest = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    console.log("donation request id parameter not sent with request");
    return res.sendStatus(400);
  }
  try {
    var donation = await Request.findOne({ _id: req.params.id })
      .populate("requestor", "name email profile_pic")
      .populate("donation", "location foods");

    if (donation) {
      res.status(200).json(donation);
    } else {
      return res.status(404).send("cannot find donation request with that id");
    }
  } catch (error) {
    return res.status(500).send("cannot find donation request with that id");
  }
});

const deleteDonationRequest = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    console.log("donation request id parameter not sent with request");
    return res.sendStatus(400);
  }
  try {
    const donation = await Request.findByIdAndDelete({ _id: req.params.id });
    if (donation) {
      return res.status(200).json({
        message: "Donation request deleted",
        deletedRequest: donation,
      });
    } else {
      return res.status(400).json({
        message: "Something went wrong when deleting the donation request",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete the donation request", error });
  }
});

const updateDonationRequest = asyncHandler(async (req, res, next) => {
  try {
    const donation = await Request.findById({ _id: req.params.id });
    if (donation) {
      const willBeUpdated = await Request.findByIdAndUpdate(
        { _id: req.params.id },
        req.body,
        { lean: true, new: true }
      );
      if (willBeUpdated) {
        return res.status(201).json({
          message: "Donation updated",
        });
      } else {
        return res.status(400).json({
          message: "Something went wrong when updating the task",
        });
      }
    } else {
      return res.status(404).json({
        message: "No record found",
      });
    }
  } catch (error) {
    res.status(400);
    throw new Error("Failed to update the donation");
  }
});

// Handle accepting a donation request
const acceptDonationRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pickupDate, pickupTime, pickupLocation } = req.body;

  try {
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "Accepted";
    request.pickupDate = pickupDate;
    request.pickupTime = pickupTime;
    request.pickupLocation = pickupLocation;

    const updatedRequest = await request.save();
    res.status(200).json({ message: "Request accepted", updatedRequest });
  } catch (error) {
    res.status(500).json({ message: "Error accepting request", error });
  }
});

// Handle rejecting a donation request
const rejectDonationRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "Rejected";

    const updatedRequest = await request.save();
    res.status(200).json({ message: "Request rejected", updatedRequest });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting request", error });
  }
});

const checkUserRequest = asyncHandler(async (req, res) => {
  const { donation_id, requestor_id } = req.query;

  if (!donation_id || !requestor_id) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  try {
    const existingRequest = await Request.findOne({
      donation: donation_id,
      requestor: requestor_id,
    });

    if (existingRequest) {
      return res.status(200).json({ hasRequested: true });
    } else {
      return res.status(200).json({ hasRequested: false });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error checking request", error });
  }
});

module.exports = {
  createDonationRequest,
  allDonationRequests,
  deleteDonationRequest,
  updateDonationRequest,
  getDonationRequest,
  acceptDonationRequest,
  checkUserRequest,
  rejectDonationRequest,
};
