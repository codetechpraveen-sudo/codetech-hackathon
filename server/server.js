require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map(url => url.trim())
}));

app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  res.send("CodeTech Crafters LLP API is running.");
});

app.use("/api/auth", require("./routes/auth"));

async function startServer() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    throw new Error("Configure MONGO_URI and JWT_SECRET.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const port = process.env.PORT || 5000;

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(error => {
  console.error(error.message);
  process.exit(1);
});