
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET: Show all products
router.get("/", async (req, res) => {
  try {
    const [products] = await db.query(
      "SELECT * FROM santhiya_products ORDER BY id DESC"
    );

    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load products"
    });
  }
});

// POST: Add new product to MySQL
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category,
      image_url
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      price === "" ||
      price === undefined ||
      stock === "" ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter product name, price and stock"
      });
    }

    const productPrice = Number(price);
    const productStock = Number(stock);

    if (
      !Number.isFinite(productPrice) ||
      productPrice < 0 ||
      productPrice > 99999999.99 ||
      !Number.isInteger(productStock) ||
      productStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid price and stock quantity"
      });
    }

    const productDescription = description || "";
    const productCategory = category || "";
    const productImage = image_url || "";

    if (
      typeof productDescription !== "string" ||
      typeof productCategory !== "string" ||
      typeof productImage !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product details"
      });
    }

    if (
      productImage &&
      !/^https?:\/\/\S+$/i.test(productImage)
    ) {
      return res.status(400).json({
        success: false,
        message: "Image URL must start with http:// or https://"
      });
    }

    const [result] = await db.query(
      `INSERT INTO santhiya_products
       (name, description, price, stock, category, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        productDescription.trim(),
        productPrice,
        productStock,
        productCategory.trim(),
        productImage.trim()
      ]
    );

    res.status(201).json({
      success: true,
      message: "Product added successfully!",
      productId: result.insertId
    });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to save product"
    });
  }
});

module.exports = router;
