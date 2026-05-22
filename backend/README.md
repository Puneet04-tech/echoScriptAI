# EchoScriptAI Backend

Backend server for the EchoScriptAI audio transcription application.

## Features

- Express.js server with REST API
- File upload handling using Multer
- Support for single and multiple audio file uploads
- Audio file validation (MP3, WAV, OGG, WebM, etc.)
- CORS enabled for frontend integration
- Environment variable configuration

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```
PORT=5000
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 5000 (or the port specified in .env).

## API Endpoints

### Health Check
- **GET** `/`
- Returns server status message

### Upload Single Audio File
- **POST** `/api/upload`
- Content-Type: `multipart/form-data`
- Body: `audio` (file)
- Returns: Uploaded file information

### Upload Multiple Audio Files
- **POST** `/api/upload/multiple`
- Content-Type: `multipart/form-data`
- Body: `audios` (files, max 5)
- Returns: Array of uploaded file information

## Supported Audio Formats

- MP3 (audio/mpeg, audio/mp3)
- WAV (audio/wav, audio/wave)
- OGG (audio/ogg)
- WebM (audio/webm)
- M4A (audio/x-m4a)
- AAC (audio/aac)

## File Size Limit

Maximum file size: 50MB per file

## Project Structure

```
backend/
├── routes/
│   └── upload.js       # Upload routes
├── uploads/            # Temporary file storage
├── server.js           # Main server file
├── package.json        # Dependencies
├── .env                # Environment variables
└── .gitignore          # Git ignore rules
```

## Dependencies

- express: Web framework
- multer: File upload handling
- cors: Cross-origin resource sharing
- dotenv: Environment variable management
- nodemon: Development server auto-reload (dev dependency)

## Next Steps

- Connect to MongoDB database
- Implement OpenAI Whisper API integration
- Add authentication
- Add transcription history endpoints
