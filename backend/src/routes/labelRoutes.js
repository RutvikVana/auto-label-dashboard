import express from "express";
import multer from "multer";
import csv from "csvtojson";
import OpenAI from "openai";
import DataModel from "../models/data.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/* ---------- Lazy Initialize OpenAI ---------- */
function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/* ---------- AI Label Function ---------- */
async function aiLabel(text) {
  try {
    const openai = getOpenAI();

    const prompt = `
You are an intelligent data labeling system.

Your task is to analyze the given text and generate the most appropriate high-level category label that best describes its main topic.

Guidelines:
- The label must be short (1–3 words maximum).
- Use clear, commonly understood category names (e.g., Sports, Finance, Healthcare, Education, Technology, Travel, Politics, Entertainment, Weather, Food, Business, Science, etc.).
- Choose the dominant topic if multiple topics appear.
- Do NOT return sentences or explanations.
- Do NOT include punctuation, emojis, or quotes.
- Return only the category label.

Text:
"${text}"
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }]
    });

    let label = response.choices[0].message.content.trim();

    // Safety cleanup (remove special chars)
    label = label.replace(/[^A-Za-z ]/g, "").trim();

    console.log("AI LABEL:", label);
    return label || "General";
  } catch (error) {
    console.warn("⚠️ OpenAI failed, using fallback labeling");
    return fallbackLabel(text);
  }
}
function fallbackLabel(text) {
  const t = (text || "").toLowerCase();
  if (t.includes("cricket") || t.includes("football") || t.includes("tennis") || t.includes("match") || t.includes("score")) return "Sports";
  if (t.includes("election") || t.includes("government") || t.includes("vote") || t.includes("policy")) return "Politics";
  if (t.includes("movie") || t.includes("music") || t.includes("celebrity") || t.includes("film")) return "Entertainment";
  if (t.includes("stock") || t.includes("market") || t.includes("finance") || t.includes("bank")) return "Finance";
  if (t.includes("app") || t.includes("software") || t.includes("ai") || t.includes("technology") || t.includes("computer")) return "Technology";
  if (t.includes("recipe") || t.includes("restaurant") || t.includes("food") || t.includes("cuisine")) return "Food";
  if (t.includes("health") || t.includes("doctor") || t.includes("medicine") || t.includes("covid")) return "Healthcare";
  if (t.includes("travel") || t.includes("flight") || t.includes("hotel") || t.includes("tour")) return "Travel";
  return "General";
}

/* ---------- Label Single Text ---------- */
router.post("/label", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const label = await aiLabel(text);

    const saved = await DataModel.create({ text, label });
    res.json(saved);
  } catch (err) {
    console.error("LABEL API ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const jsonArray = await csv().fromFile(req.file.path);

    const results = [];
    for (let item of jsonArray) {
      const label = await aiLabel(item.text);
      const saved = await DataModel.create({ text: item.text, label });
      results.push(saved);
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/data", async (req, res) => {
  try {
    const data = await DataModel.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    console.error("GET DATA ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
router.put("/data/:id", async (req, res) => {
  try {
    const updated = await DataModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Data not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("UPDATE DATA ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
router.get("/stats", async (req, res) => {
  try {
    const total = await DataModel.countDocuments();
    const pending = await DataModel.countDocuments({ status: "pending" });
    const approved = await DataModel.countDocuments({ status: "approved" });
    const edited = await DataModel.countDocuments({ status: "edited" });

    res.json({ total, pending, approved, edited });
  } catch (err) {
    console.error("STATS API ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
