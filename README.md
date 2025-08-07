# Shortcuts Connection Backend - Dual UI with AI Drawing Analysis

A dynamic web interface that supports both Google-style search and AI-powered drawing analysis for iPhone Shortcuts integration.

## Features

### 🔍 Google Search Interface
- Clean Google-like search interface
- Real Google search redirection
- Background data capture for iPhone Shortcuts

### 🎨 Drawing Canvas Interface
- Touch and mouse drawing support
- Color picker with 6 preset colors
- AI analysis with Gemini 2.5 Flash
- One-word interpretation of drawings

### ⚙️ Settings Panel
- Switch between Google and Drawing interfaces
- Configure default title for data
- Persistent settings via cookies

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Gemini AI (Optional)
To enable AI drawing analysis, get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey):

#### For Railway Deployment:
1. Go to your Railway project dashboard
2. Add environment variable: `GEMINI_API_KEY=your-api-key-here`

#### For Local Development:
```bash
export GEMINI_API_KEY=your-api-key-here
npm start
```

*Note: Without an API key, the drawing analysis will use fallback words for demo purposes.*

### 3. Deploy to Railway
```bash
git add .
git commit -m "Added dual UI with drawing analysis"
git push
```

## Usage

### iPhone Shortcuts Integration
Fetch data from any of these endpoints:
- `GET /api/data` - Full JSON data
- `GET /api/message` - Plain text message

### Google Search Mode
1. Open Settings → Select "Google Search"
2. Set your desired title (e.g., "Search Query")
3. Search normally - data is captured as `Title\nSearchTerm`

### Drawing Mode
1. Open Settings → Select "Drawing Canvas" 
2. Set your desired title (e.g., "Prediction")
3. Draw something on the canvas
4. Click the ✏️ button to analyze and clear
5. AI returns one word (e.g., "flower") 
6. Data becomes `Title\nAIResult`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/data` | GET | Get all data as JSON |
| `/api/message` | GET | Get message as plain text |
| `/api/data` | POST | Update data from web interface |
| `/api/analyze-drawing` | POST | Analyze drawing with AI |

## Data Format

Both interfaces update the same data structure:
```json
{
  "message": "Title\nContent",
  "timestamp": "2025-01-07T11:44:00.000Z"
}
```

Examples:
- Google: "Search\nhow to cook pasta"
- Drawing: "Prediction\nflower"

## Architecture

```
iPhone Shortcut → Railway Backend → Web Interface
      ↑                ↓
   Fetch Data      Edit Data
```

## API Endpoints

### For iPhone Shortcuts:

1. **Get All Data**: `GET /api/data`
   - Returns all stored data as JSON
   - Perfect for complex Shortcuts that need multiple values

2. **Get Specific Field**: `GET /api/data/{field}`
   - Returns a specific field (e.g., `/api/data/message`)
   - Ideal for simple Shortcuts that need just one value

3. **Update via URL**: `GET /api/update?field=value&field2=value2`
   - Updates data via GET request with query parameters
   - Useful for Shortcuts that need to update data

4. **Update via POST**: `POST /api/data`
   - Updates data via POST request with JSON body
   - More secure for sensitive updates

## Deployment to Railway

### Option 1: Deploy from GitHub (Recommended)

1. Push this code to a GitHub repository
2. Go to [Railway](https://railway.app)
3. Connect your GitHub account
4. Deploy your repository
5. Railway will automatically detect and deploy your Node.js app

### Option 2: Deploy via Railway CLI

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize and deploy:
   ```bash
   railway init
   railway up
   ```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open http://localhost:3000 in your browser

## iPhone Shortcuts Setup

### Basic Data Fetching Shortcut:

1. Add "Get Contents of URL" action
2. Set URL to: `https://your-app.railway.app/api/data`
3. Add "Get Dictionary from JSON" action
4. Use "Get Dictionary Value" to extract specific fields

### Example Shortcut for Getting Message:

1. **Get Contents of URL**: `https://your-app.railway.app/api/data/message`
2. **Get Dictionary from JSON**
3. **Get Dictionary Value** for key "message"
4. **Show Result** or use in automation

### Example Shortcut for Updating Data:

1. **Get Contents of URL**: `https://your-app.railway.app/api/update?message=Hello%20World&customValue=42`
2. **Show Result** (optional, to confirm update)

## Data Structure

The default data structure includes:

```json
{
  "message": "Your custom message",
  "timestamp": "2025-08-06T18:20:00.000Z",
  "secretCommand": "launch_mode_active",
  "customValue": 42
}
```

You can add any additional fields through the web interface.

## Use Cases

- **Dynamic App Launcher**: Store app names or URLs to launch
- **Secret Commands**: Hidden automation triggers
- **Status Updates**: Current mode, status, or state information
- **Configuration**: Dynamic settings for your automations
- **Messages**: Daily quotes, reminders, or notes
- **Toggles**: Boolean flags for conditional automation

## Security Notes

- This is a simple prototype without authentication
- For production use, consider adding API keys or authentication
- Be careful with sensitive data as it's stored in memory (resets on server restart)
- For persistent storage, consider adding a database

## Extending the System

### Adding Database Storage:

Replace the in-memory storage with a database like:
- Railway PostgreSQL
- MongoDB Atlas
- Supabase
- Firebase Firestore

### Adding Authentication:

- API keys for Shortcuts access
- Web authentication for the admin interface
- Rate limiting to prevent abuse

### Adding More Endpoints:

- Webhook endpoints for external integrations
- Scheduled updates via cron jobs
- Multiple data collections/namespaces

## Troubleshooting

### Shortcuts Not Getting Data:
- Check the URL is correct
- Ensure the Railway app is running
- Test the API endpoint in a browser first

### Web Interface Not Loading:
- Check Railway deployment logs
- Ensure all dependencies are installed
- Verify the `package.json` is correct

### Data Not Persisting:
- Remember that data is stored in memory and resets on deployment
- Consider adding database storage for persistence
