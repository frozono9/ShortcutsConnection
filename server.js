const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage (you can replace this with a database)
let appData = {
  message: "Prediction\nJohnny",
  timestamp: new Date().toISOString()
};

// Routes

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for iPhone Shortcuts to fetch data
app.get('/api/data', (req, res) => {
  res.json(appData);
});

// API endpoint to get specific field (useful for Shortcuts)
app.get('/api/data/:field', (req, res) => {
  const field = req.params.field;
  if (appData.hasOwnProperty(field)) {
    res.json({ [field]: appData[field] });
  } else {
    res.status(404).json({ error: 'Field not found' });
  }
});

// Simple text endpoints for easier Shortcuts integration (returns plain text)
app.get('/api/message', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(String(appData.message || 'No message set'));
});

app.get('/api/command', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(String(appData.secretCommand || 'No command set'));
});

app.get('/api/value', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(String(appData.customValue || '0'));
});

// API endpoint to update data from web interface
app.post('/api/data', (req, res) => {
  try {
    // Update fields that were provided
    Object.keys(req.body).forEach(key => {
      if (key !== 'timestamp') { // Don't allow manual timestamp override
        appData[key] = req.body[key];
      }
    });
    
    // Always update timestamp when data changes
    appData.timestamp = new Date().toISOString();
    
    res.json({ success: true, data: appData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// API endpoint for drawing analysis with Gemini AI
app.post('/api/analyze-drawing', async (req, res) => {
  try {
    const { image, title } = req.body;
    
    // Remove the data URL prefix to get just the base64 image
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Call Gemini API to analyze the drawing
    const interpretation = await analyzeImageWithGemini(base64Image);
    
    // Update the message with the interpretation
    const message = `${title || 'Drawing'}\n${interpretation}`;
    appData.message = message;
    appData.timestamp = new Date().toISOString();
    
    res.json({ 
      success: true, 
      interpretation: interpretation,
      message: message 
    });
    
  } catch (error) {
    console.error('Drawing analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze drawing' 
    });
  }
});

// Function to analyze image with Gemini API
async function analyzeImageWithGemini(base64Image) {
  try {
    // Using provided Gemini API key
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyC-NYm0NhgvloYaiWJXvEj5otQLftxbL4U';
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Look at this drawing and respond with just ONE WORD that best describes what you see. Only respond with a single word, nothing else."
            },
            {
              inline_data: {
                mime_type: "image/png",
                data: base64Image
              }
            }
          ]
        }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const interpretation = data.candidates[0].content.parts[0].text.trim().toLowerCase();
      return interpretation;
    } else {
      throw new Error('No interpretation received from Gemini');
    }
    
  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback responses
    return getRandomFallbackWord();
  }
}

// Fallback function for when Gemini API is not available
function getRandomFallbackWord() {
  const fallbackWords = ['drawing', 'sketch', 'doodle', 'art', 'creation', 'image', 'picture'];
  return fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
}

// API endpoint for Shortcuts to update data via GET (useful for simple updates)
app.get('/api/update', (req, res) => {
  try {
    // Update fields from query parameters
    Object.keys(req.query).forEach(key => {
      if (key !== 'timestamp') {
        appData[key] = req.query[key];
      }
    });
    
    appData.timestamp = new Date().toISOString();
    
    res.json({ success: true, data: appData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Shortcuts can fetch data from: http://localhost:${PORT}/api/data`);
  console.log(`🌐 Web interface available at: http://localhost:${PORT}`);
});
