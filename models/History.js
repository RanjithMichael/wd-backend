import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  city: { type: String, required: true },
  temp: Number,
  humidity: Number,
  condition: String,
  icon: String,
  searchedAt: { type: Date, default: Date.now }
});

export default mongoose.model("History", historySchema);
