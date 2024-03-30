const express = require("express");
const admin = require("../middlewares/admin");
const { Product } = require("../models/product");
const Order = require("../models/order");

const adminRouter = express.Router();

// add product

adminRouter.post("/admin/add-product", admin, async (req, res) => {
  try {
    const { name, description, images, quantity, price, category } = req.body;
    let product = new Product({
      name,
      description,
      images,
      quantity,
      price,
      category,
    });
    product = await product.save();
    res.json(product);
    console.log(product);
  } catch (error) {
    res.status(500).json({ error: e.message });
  }
});

//get all the products

// /admin/get-products

adminRouter.get("/admin/get-products", admin, async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// delete the product
adminRouter.post("/admin/delete-product", admin, async (req, res) => {
  try {
    const { id } = req.body;
    let product = await Product.findByIdAndDelete(id);
    res.json(product);
    console.log("product delete : ", product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//logout admin
adminRouter.delete("/admin/logout", admin, async (req, res) => {
  try {
    // Xóa thông tin xác thực của admin khỏi yêu cầu
    req.token = null;

    res.json({ msg: "Admin logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all order product
adminRouter.get("/admin/get-orders", admin, async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
    console.log("Tất cả đơn hàng : ", orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// change order status  product
adminRouter.post("/admin/change-order-status", admin, async (req, res) => {
  try {
    const { id, status } = req.body;
    let order = await Order.findById(id);
    order.status = status;
    order = await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//thong ke
adminRouter.get("/admin/analytics", admin, async (req, res) => {
  try {
    const orders = await Order.find({});
    let totalEarnings = 0;

    for (let i = 0; i < orders.length; i++) {
      for (let j = 0; j < orders[i].products.length; j++) {
        totalEarnings +=
          orders[i].products[j].quantity * orders[i].products[j].product.price;
      }
    }
    // CATEGORY WISE ORDER FETCHING
    let mobileEarnings = await fetchCategoryWiseProduct("Mobiles");
    let computerEarnings = await fetchCategoryWiseProduct("Computers");
    let electronicsEarnings = await fetchCategoryWiseProduct("Electronics");
    let booksEarnings = await fetchCategoryWiseProduct("Books");
    let fashionEarnings = await fetchCategoryWiseProduct("Fashion");

    let earnings = {
      totalEarnings,
      mobileEarnings,
      computerEarnings,
      electronicsEarnings,
      booksEarnings,
      fashionEarnings,
    };

    res.json(earnings);
    console.log(earnings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

async function fetchCategoryWiseProduct(category) {
  let earnings = 0;
  let categoryOrders = await Order.find({
    "products.product.category": category,
  });

  for (const order of categoryOrders) {
    for (const product of order.products) {
      // Kiểm tra xem sản phẩm thuộc danh mục cụ thể hay không
      if (product.product.category === category) {
        earnings += product.quantity * product.product.price;
      }
    }
  }
  return earnings;
}

module.exports = adminRouter;
