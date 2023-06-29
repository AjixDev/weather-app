import express from 'express';
import axios from 'axios';
import { Schema, model, connect } from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

// Create an Express application
const app = express();
const port = 3000;

// MongoDB connection URL
const mongoURL = process.env.MONGODB_CONNECTION_STRING;

// Define the schema for city data
const citySchema = new Schema({
  name: String,
  weather: Object,
});

// Define the schema for forecast data
const forecastSchema = new Schema({
  name: String,
  forecast: Object,
});

// Create the City model
const City = model('City', citySchema);

// Create the Forecast model
const Forecast = model('Forecast', forecastSchema);

// List of cities
const cities = [
  'London', 'Tel Aviv', 'New York', 'Brussels', 'Barcelona', 'Paris', 'Tokyo', 'Beijing', 'Sydney',
  'Buenos Aires', 'Miami', 'Vancouver', 'Moscow', 'Bangkok', 'Johannesburg', 'Tunis', 'Manila'
];

// OpenWeatherMap API configuration
const apiKey = process.env.API_KEY;
const baseUrl = 'http://api.openweathermap.org/data/2.5/';

// Connect to MongoDB
connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');

    // Fetch and store current weather data for each city
    cities.forEach((city) => {
      const currentWeatherUrl = `${baseUrl}weather?q=${city}&appid=${apiKey}`;
      axios.get(currentWeatherUrl)
        .then((response) => {
          const currentWeatherData = response.data;
          const newCity = new City({
            name: city,
            weather: currentWeatherData,
          });
          newCity.save();
          console.log(`Saved current weather data for ${city}`);
        })
        .catch((error) => {
          console.error(`Error fetching current weather data for ${city}:`, error);
        });
    });

    // Fetch and store forecast data for each city
    cities.forEach((city) => {
      const forecastUrl = `${baseUrl}forecast?q=${city}&appid=${apiKey}`;
      axios.get(forecastUrl)
        .then((response) => {
          const forecastData = response.data;
          const newForecast = new Forecast({
            name: city,
            forecast: forecastData,
          });
          newForecast.save();
          console.log(`Saved forecast data for ${city}`);
        })
        .catch((error) => {
          console.error(`Error fetching forecast data for ${city}:`, error);
        });
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
