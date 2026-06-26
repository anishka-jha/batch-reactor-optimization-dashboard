const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const simulationSchema = new mongoose.Schema({
  reactionOrder: String,
  k: Number,
  effectiveK: Number,
  ca0: Number,
  time: Number,
  temperature: Number,
  activationEnergy: Number,
  frequencyFactor: Number,
  finalConcentration: Number,
  conversion: Number,
});

const Simulation = mongoose.model("Simulation", simulationSchema);

app.get("/", (req, res) => {
  res.send("Backend Running");
});

function calculateFinalConcentration(order, ca0, k, time) {
  let finalConcentration;

  if (order === "zero") {
    finalConcentration = ca0 - k * time;
  } else if (order === "first") {
    finalConcentration = ca0 * Math.exp(-k * time);
  } else {
    finalConcentration = 1 / (1 / ca0 + k * time);
  }

  if (finalConcentration < 0) {
    finalConcentration = 0;
  }

  return finalConcentration;
}

app.post("/simulate", async (req, res) => {
  try {
    const {
      reactionOrder,
      k,
      ca0,
      time,
      temperature,
      activationEnergy,
      frequencyFactor,
    } = req.body;

    let effectiveK = Number(k);

    if (temperature && activationEnergy && frequencyFactor) {
      const R = 8.314;
      effectiveK =
        Number(frequencyFactor) *
        Math.exp(-Number(activationEnergy) / (R * Number(temperature)));
    }

    const finalConcentration = calculateFinalConcentration(
      reactionOrder,
      Number(ca0),
      effectiveK,
      Number(time)
    );

    const conversion =
      ((Number(ca0) - finalConcentration) / Number(ca0)) * 100;

    await Simulation.create({
      reactionOrder,
      k: Number(k),
      effectiveK,
      ca0: Number(ca0),
      time: Number(time),
      temperature: temperature ? Number(temperature) : null,
      activationEnergy: activationEnergy ? Number(activationEnergy) : null,
      frequencyFactor: frequencyFactor ? Number(frequencyFactor) : null,
      finalConcentration,
      conversion,
    });

    res.json({
      effectiveK: effectiveK.toFixed(6),
      finalConcentration: finalConcentration.toFixed(3),
      conversion: conversion.toFixed(2),
    });
  } catch (err) {
    console.log("SIMULATION ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/history", async (req, res) => {
  try {
    const data = await Simulation.find({}).sort({ _id: -1 });
    res.json(data);
  } catch (err) {
    console.log("HISTORY ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.delete("/history/:id", async (req, res) => {
  try {
    await Simulation.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Simulation deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });

    console.log("MongoDB Connected");
    console.log("Ready State:", mongoose.connection.readyState);

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  } catch (err) {
    console.log("MongoDB Connection Failed:", err);
  }
}

startServer();