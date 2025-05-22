const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const User = require("./userModel");
const Product = require("./productModel");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serve admin panel
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// GET products with filters
app.get("/products", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = { $regex: new RegExp(req.query.category, "i") };
    }
    if (req.query.inStock !== undefined) {
      filter.stock = req.query.inStock === "true" ? { $gt: 0 } : 0;
    }

    const products = await Product.find(filter).exec();
    res.json(products);
  } catch (error) {
    res.status(500).send("Error fetching products: " + error.message);
  }
});

// POST add product(s)
app.post("/products", async (req, res) => {
  try {
    const productData = req.body;

    if (Array.isArray(productData)) {
      for (const item of productData) {
        if (!item.title || item.price == null || item.stock == null) {
          return res.status(400).send("Each product must have title, price, and stock");
        }
      }
      await Product.insertMany(productData);
      return res.status(201).send("Multiple products inserted successfully");
    }

    const { title, price, stock } = productData;
    if (!title || price == null || stock == null) {
      return res.status(400).send("Missing required product fields");
    }

    const product = new Product(productData);
    await product.save();
    res.status(201).send("Product inserted successfully");
  } catch (error) {
    res.status(500).send("Insert failed: " + error.message);
  }
});

// PUT update product
app.put("/products/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedProduct) return res.status(404).send("Product not found");
    res.send("Product updated successfully");
  } catch (error) {
    res.status(500).send("Update failed: " + error.message);
  }
});

// DELETE product
app.delete("/products/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).send("Product not found");
    res.send("Product deleted successfully");
  } catch (error) {
    res.status(500).send("Delete failed: " + error.message);
  }
});

// Connect DB and start server
mongoose.connect("mongodb://localhost:27017/e-commerce_product_data")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});