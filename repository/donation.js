const Donation = require("../models/donation.model");

exports.donations = async () => {
  const donations = await Donation.find();
  return donations;
};
exports.donationById = async (id) => {
  const donation = await Donation.findById(id);
  return donation;
};
exports.createdonation = async (payload) => {
  const newdonation = await Donation.create(payload);
  return newdonation;
};
exports.removedonation = async (id) => {
  const donation = await Donation.findByIdAndRemove(id);
  return donation;
};
