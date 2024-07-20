const asyncHandler = require("express-async-handler");
const Donation = require("../models/donation.model");
const Request = require("../models/request.model");

const createDonationRequest = asyncHandler(async (req, res) => {
  const {
    donation,
    requestor,
    accepted,
    delivered,
    cancelled,
    requested_date,
    delivered_date,
  } = req.body;

  if (!donation || !requested_date || !requestor) {
    res.status(400);
    throw new Error("Please fill all fields");
  }

  const newRequest = {
    donation,
    requestor,
    accepted,
    delivered,
    cancelled,
    requested_date,
    delivered_date,
  };
  try {
    var request = await Request.create(newRequest);
    request = await request.populate("requestor", "name email profile_pic");
    if (donation) {
      res.status(201).json({
        _id: request._id,
        donation: request.donation,
        requestor: request.requestor,
        accepted: request.accepted,
        delivered: request.delivered,
        cancelled: request.cancelled,
        requested_date: request.requested_date,
        delivered_date: request.delivered_date,
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
    await Request.find({requestor: req.query.user_id}).populate("requestor", "name profile_pic email").then(async (results) => {
        results = await Donation.populate(results, {
          path: "donation",
          select: "location foods",
        })
        
        console.log(results);
        res.status(200).json(results);
      })
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
    var donation = await Request.findOne({_id: req.params.id})
      .populate("requestor", "name email profile_pic")
      .populate("donation",
      "location foods");

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
    console.log("donation id parameter not sent with request");
    return res.sendStatus(400);
  }
  try {
    const donation = await Request.findByIdAndDelete({_id: req.params.id});
    if (donation) {
      return res.status(201).json({
        message: "Donation deleted",
      });
    } else {
      return res.status(400).json({
        message: "Something went wrong when deleting the donation",
      });
    }
  } catch (error) {
    res.status(400);
    throw new Error("Failed to delete the donation");
  }
});

const updateDonationRequest = asyncHandler(async (req, res, next) => {
  try {
    const donation = await Request.findById({_id: req.params.id});
    if (donation) {
      const willBeUpdated = await Request.findByIdAndUpdate(
        {_id: req.params.id},
        req.body,
        {lean: true, new: true}
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

const getRequestsForDonor = asyncHandler(async (req, res) => {
  try {
    const donations = await Donation.find({ creator: req.user._id }).select('_id');
    const requests = await Request.find({ donation: { $in: donations.map(d => d._id) } })
      .populate('requestor', 'name profile_pic email')
      .populate('donation', 'location foods');
    
    res.status(200).json(requests);
  } catch (error) {
    res.status(400);
    throw new Error('Failed to get requests for the donor');
  }
});


module.exports = {
  createDonationRequest,
  allDonationRequests,
  deleteDonationRequest,
  updateDonationRequest,
  getDonationRequest,
  getRequestsForDonor,
};
