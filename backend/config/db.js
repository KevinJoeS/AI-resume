import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");
  } catch (error) {
    console.warn("====================================================================");
    console.warn("WARNING: MongoDB Connection Failed! IP Whitelist or connection issue.");
    console.warn("Falling back to local file database (local_db.json) in backend folder.");
    console.warn("Error message:", error.message);
    console.warn("====================================================================");
    // Do not call process.exit(1); let server run in fallback mode.
  }
};

export default connectDB;