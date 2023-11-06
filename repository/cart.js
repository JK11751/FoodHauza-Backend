// const Cart = require("../models/cart.model");

// exports.cart = async () => {
//   const carts = await Cart.find().populate({
//     path: "items.productId",
//     select: "title price total images",
//   });
//   return carts[0];
// };

// exports.addItem = async (payload) => {
//   const newItem = await Cart.create(payload);
//   return newItem;
// };
