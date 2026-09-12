const Scan = require('../models/Scan');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');


const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

console.log("Groq key exists:", !!process.env.GROQ_API_KEY);
console.log("Groq key prefix:", process.env.GROQ_API_KEY?.substring(0, 8));


// @desc    Create new scan
// @route   POST /api/scan
// @access  Private
exports.createScan = async (req, res) => {
  try {
    const scanData = { ...req.body, userId: req.user._id };
    const scan = await Scan.create(scanData);
    res.status(201).json({ success: true, scan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get user scans
// @route   GET /api/scan
// @access  Private
exports.getScans = async (req, res) => {
  try {
    const scans = await Scan.find({ userId: req.user._id })
      .populate('animalId', 'name tagId type')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, count: scans.length, scans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single scan
// @route   GET /api/scan/:id
// @access  Private
exports.getScan = async (req, res) => {
  try {
    const scan = await Scan.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('animalId', 'name tagId type');

    if (!scan) return res.status(404).json({ success: false, message: 'Scan not found' });
    res.status(200).json({ success: true, scan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete scan
// @route   DELETE /api/scan/:id
// @access  Private
exports.deleteScan = async (req, res) => {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!scan) return res.status(404).json({ success: false, message: 'Scan not found' });
    await scan.deleteOne();
    res.status(200).json({ success: true, message: 'Scan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Analyze image with Groq Vision
// @route   POST /api/scan/analyze
// @access  Private

exports.analyzeImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    // Read image and convert to base64
    const imageData = fs.readFileSync(file.path);
    const base64Image = imageData.toString('base64');
    const mimeType = file.mimetype;

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    const prompt = `You are an expert veterinarian AI assistant specializing in livestock health analysis.

Analyze this image of livestock and provide a detailed health assessment. Return your response as a valid JSON object with exactly this structure:

{
  "livestock": "species and breed if identifiable",
  "confidence": 0.0 to 1.0,
  "healthStatus": "Healthy" or "Moderate Concern" or "Critical",
  "condition": "primary condition or diagnosis",
  "severity": "Low" or "Medium" or "High",
  // "vetConsultRequired": true or false,
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "recommendations": [
    {
      "type": "Immediate Action",
      "items": ["action 1", "action 2"]
    },
    {
      "type": "Medication",
      "items": ["medication 1", "medication 2"]
    },
    {
      "type": "Nutrition",
      "items": ["nutrition tip 1", "nutrition tip 2"]
    },
    {
      "type": "Monitoring",
      "items": ["monitoring tip 1", "monitoring tip 2"]
    }
  ]
}

If the image does not show livestock, set healthStatus to "Unable to Analyze" and condition to "No livestock detected in image". Only return the JSON object, no other text.`;

        const response = await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
      reasoning_format: "hidden"
    });
    console.log("File:", file.originalname);
    console.log("Mime:", mimeType);
    console.log("Size:", imageData.length);

    const responseText = response.choices[0]?.message?.content?.trim();

    if (!responseText) {
      return res.status(500).json({ success: false, message: 'No response from AI' });
    }

    // Clean markdown code blocks if present
    const cleanJson = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let analysis;
    try {
      analysis = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', responseText);
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response'
      });
    }

    res.status(200).json({ success: true, analysis });
  } catch (error) {
  console.error("========== GROQ ERROR ==========");
  console.error("Message:", error.message);
  console.error("Status:", error.status);
  console.error("Response:", error.response?.data);
  console.error("Stack:", error.stack);
  console.error(error);
  console.error("================================");

  res.status(500).json({
    success: false,
    message: error.message,
  });
}
};