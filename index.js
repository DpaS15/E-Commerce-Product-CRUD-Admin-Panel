const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Load environment variables from .env

const User = require("./userModel");
const Product = require("./productModel");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serve admin panel
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// GET products with optional filters: category, inStock
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

// POST - Add single or multiple products
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

// PUT - Update a product by ID
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

// DELETE - Remove a product by ID
app.delete("/products/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).send("Product not found");
    res.send("Product deleted successfully");
  } catch (error) {
    res.status(500).send("Delete failed: " + error.message);
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});