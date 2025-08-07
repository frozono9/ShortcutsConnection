# Shortcuts Connection Backend

A dynamic data backend for iPhone Shortcuts that allows you to edit data in a web browser and fetch it from iOS Shortcuts.

## Features

- 🌐 Web interface to edit data in real-time
- 📱 REST API endpoints optimized for iPhone Shortcuts
- ☁️ Hosted on Railway for 24/7 availability
- 🔄 Real-time data updates
- 📊 Multiple data fields support

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
