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

// Trigger state management
let triggerState = {
  triggered: false,
  lastTriggered: null
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
    
    // Activate trigger when data is updated
    activateTrigger();
    
    res.json({ success: true, data: appData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update data' });
  }
});

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

// Trigger endpoint - returns current trigger state
app.get('/api/trigger', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(triggerState.triggered ? 'True' : 'False');
});

// Function to activate trigger for 5 seconds
function activateTrigger() {
  triggerState.triggered = true;
  triggerState.lastTriggered = new Date().toISOString();
  
  // Reset trigger after 5 seconds
  setTimeout(() => {
    triggerState.triggered = false;
  }, 5000);
}

// AI Drawing Analysis endpoint
app.post('/api/analyze-drawing', async (req, res) => {
  try {
    const { image, title } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Remove data URL prefix to get just the base64 data
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const GEMINI_API_KEY = 'AIzaSyC-NYm0NhgvloYaiWJXvEj5otQLftxbL4U';
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Look at this drawing and respond with exactly ONE WORD that best describes what you see. Only return the single word, nothing else."
            },
            {
              inline_data: {
                mime_type: "image/png",
                data: base64Data
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'unknown';
    
    // Update the appData with the new message
    const currentTitle = title || 'Prediction';
    appData.message = `${currentTitle}\n${analysis}`;
    appData.timestamp = new Date().toISOString();

    // Activate trigger when drawing is analyzed
    activateTrigger();

    res.json({ 
      success: true, 
      analysis: analysis,
      message: appData.message,
      data: appData 
    });

  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze drawing' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Shortcuts can fetch data from: http://localhost:${PORT}/api/data`);
  console.log(`🌐 Web interface available at: http://localhost:${PORT}`);
});
