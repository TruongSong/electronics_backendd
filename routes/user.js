const express = require("express");
const auth = require("../middlewares/auth");
const { Product } = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const userRouter = express.Router();

userRouter.post("/api/add-to-cart", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    if (user.cart.length == 0) {
      user.cart.push({ product, quantity: 1 });
    } else {
      let isProductFound = false;
      for (let i = 0; i < user.cart.length; i++) {
        if (user.cart[i].product._id.equals(product._id)) {
          isProductFound = true;
        }
      }

      if (isProductFound) {
        let producttt = user.cart.find((productt) =>
          productt.product._id.equals(product._id)
        );
        producttt.quantity += 1;
      } else {
        user.cart.push({ product, quantity: 1 });
      }
    }
    user = await user.save();
    res.json(user);
    console.log(user);
  } catch (error) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.delete("/api/remove-from-cart/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    for (let i = 0; i < user.cart.length; i++) {
      if (user.cart[i].product._id.equals(product._id)) {
        if (user.cart[i].quantity == 1) {
          user.cart.splice(i, 1);
        } else {
          user.cart[i].quantity -= 1;
        }
      }
    }

    user = await user.save();
    res.json(user);
    console.log(user);
  } catch (error) {
    res.status(500).json({ error: e.message });
  }
});

//save user address
userRouter.post("/api/save-user-address", auth, async (req, res) => {
  try {
    const { address } = req.body;
    let user = await User.findById(req.user);
    user.address = address;
    user = await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: e.message });
  }
});

//edit user data
userRouter.post("/api/edit-user", auth, async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const userId = req.user;

    // Lấy thông tin người dùng hiện tại
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Kiểm tra xem email mới cập nhật có trùng với email của người dùng khác không
    if (email !== currentUser.email) {
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return res
          .status(400)
          .json({ msg: "Email already exists in the system" });
      }
    }

    // Cập nhật thông tin người dùng
    currentUser.name = name;
    currentUser.email = email;
    currentUser.address = address;

    // Lưu người dùng đã cập nhật
    const updatedUser = await currentUser.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// delete user data

userRouter.delete("/api/delete-user", auth, async (req, res) => {
  try {
    const userId = req.user;

    // Tìm và xóa người dùng
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(400).json({ msg: "User not found" });
    }

    res.json({ msg: "User deleted successfully" });
    console.log("User deleted:", deletedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// order product
userRouter.post("/api/order", auth, async (req, res) => {
  try {
    const { cart, totalPrice, address } = req.body;
    let products = [];

    for (let i = 0; i < cart.length; i++) {
      let product = await Product.findById(cart[i].product._id);
      if (product.quantity >= cart[i].quantity) {
        product.quantity -= cart[i].quantity;
        products.push({ product, quantity: cart[i].quantity });
        await product.save();
      } else {
        return res
          .status(400)
          .json({ msg: `${product.name} is out of stock!` });
      }
    }

    let user = await User.findById(req.user);
    user.cart = [];
    user = await user.save();

    let order = new Order({
      products,
      totalPrice,
      address,
      userId: req.user,
      orderedAt: new Date().getTime(),
    });
    order = await order.save();
    res.json(order);
    console.log(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.get("/api/orders/me", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = userRouter;
