const mongoose = require("mongoose");

const connectDB = async () => {
  const uri =
    process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URI;
  if (!uri) {
    throw new Error(
      "MONGO_URI is not set in environment variables. Check backend/.env or Atlas configuration.",
    );
  }

  mongoose.set("strictQuery", false);

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connection established.");
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB connection lost.");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  try {
    const conn = await mongoose.connect(uri.trim(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error(
      "If you are using MongoDB Atlas, confirm that your current IP address is whitelisted or use 0.0.0.0/0 for development access.",
    );
    throw error;
  }
};

module.exports = connectDB;
