import axios from "axios";
import User from "../models/User.js";

export const getWeather = async (req, res) => {
  try {
    const { city } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    const weatherData = {
      city: response.data.name,
      temp: response.data.main.temp,
      condition: response.data.weather[0].description,
    };

    // Save search history for logged-in user
    const user = await User.findById(req.user.id);
    user.searchHistory.push(weatherData);
    await user.save();

    res.json(weatherData);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
};

export const getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.searchHistory);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

export const clearHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.searchHistory = [];
    await user.save();
    res.json({ msg: "History cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear history" });
  }
};
