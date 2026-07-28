import express from "express";
import fetch from "node-fetch";
import History from "../models/History.js";

const router = express.Router();

// ✅ Fetch weather for a city and save to history
router.get("/:city", async (req, res) => {
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
      icon: data.weather[0].icon
    };

    // ✅ Save search to MongoDB
    await History.create(weatherData);

    res.json(weatherData);
  } catch (err) {
    console.error("❌ Error calling Weather API:", err);
    res.status(500).json({ error: "❌ Failed to connect to Weather API" });
  }
});

// ✅ Get recent search history
router.get("/", async (req, res) => {
  try {
    const history = await History.find().sort({ searchedAt: -1 }).limit(10);
    res.json(history);
  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ error: "❌ Failed to fetch history" });
  }
});

export default router;
