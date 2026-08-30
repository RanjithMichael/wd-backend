import express from "express";
import fetch from "node-fetch";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

//Fetch weather for a city and save to logged-in user's history
router.get("/:city", auth(["user", "admin"]), async (req, res) => {
  const { city } = req.params;

  if (!city || city.trim().length === 0) {
    return res.status(400).json({ error: "❌ City name required" });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_KEY}&units=metric`
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Weather API error:", errText);
      return res.status(500).json({ error: "❌ Weather request failed" });
    }

    const data = await response.json();

    const weatherData = {
      city: data.name,
      temp: data.main.temp,
      humidity: data.main.humidity,
      condition: data.weather[0].description,
      icon: data.weather[0].icon,
      date: new Date()
    };

    //Save search to logged-in user's history
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "❌ User not found" });
    }

    if (!user.searchHistory) user.searchHistory = [];
    console.log("Before push:", user.searchHistory);
    user.searchHistory.push(weatherData);
    await user.save();
    console.log("After push:", user.searchHistory);
    res.json(weatherData);
  } catch (err) {
    console.error("❌ Error calling Weather API:", err);
    res.status(500).json({ error: "❌ Failed to connect to Weather API" });
  }
});

//Get logged-in user's search history
router.get("/history/all", auth(["user", "admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    console.log("❌ User not found for ID:", req.user.id);
    if (!user) return res.status(404).json({ error: "❌ User not found" });
    res.json(user.searchHistory);
  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ error: "❌ Failed to fetch history" });
  }
});

//Clear logged-in user's search history
router.delete("/history/clear", auth(["user", "admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "❌ User not found" });
    user.searchHistory = [];
    await user.save();
    res.json({ msg: "✅ History cleared" });
  } catch (err) {
    console.error("❌ Error clearing history:", err);
    res.status(500).json({ error: "❌ Failed to clear history" });
  }
});

export default router;


