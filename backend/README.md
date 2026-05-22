# EchoScriptAI Backend

Backend server for the EchoScriptAI audio transcription application.

## Features

- Express.js server with REST API
- MongoDB database with Mongoose ODM
- File upload handling using Multer
- Support for single and multiple audio file uploads
- Audio file validation (MP3, WAV, OGG, WebM, etc.)
- CORS enabled for frontend integration
- Environment variable configuration
- Transcription schema for storing audio and text data
- OpenAI Whisper API integration
- Deepgram API integration
- Automatic transcription with database storage

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up MongoDB:
   - Create a MongoDB Atlas cluster (or use local MongoDB)
   - Get your connection string

3. Set up Speech-to-Text provider (choose one or both):

   **Option A: OpenAI Whisper**
   - Create an OpenAI account at https://platform.openai.com/
   - Generate an API key from https://platform.openai.com/api-keys
   - Set `OPENAI_API_KEY` in .env

   **Option B: Deepgram**
   - Create a Deepgram account at https://console.deepgram.com/
   - Generate an API key from the console
   - Set `DEEPGRAM_API_KEY` in .env

4. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

5. Update the `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/echoscriptai?retryWrites=true&w=majority
DEFAULT_STT_PROVIDER=whisper
OPENAI_API_KEY=your_openai_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
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

### Transcribe Audio File
- **POST** `/api/upload/transcribe`
- Content-Type: `multipart/form-data`
- Body: `audio` (file), `provider` (optional: 'whisper' or 'deepgram'), `language` (optional, default: 'en')
- Returns: Transcription record with text and metadata

### Get Transcription by ID
- **GET** `/api/upload/transcription/:id`
- Returns: Single transcription record

### Get All Transcriptions
- **GET** `/api/upload/transcriptions`
- Query params: `status` (filter by status), `language` (filter by language)
- Returns: Array of transcription records

### Delete Transcription
- **DELETE** `/api/upload/transcription/:id`
- Returns: Deleted transcription record

### Get Provider Status
- **GET** `/api/upload/provider-status`
- Returns: Status of configured speech-to-text providers

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
├── config/
│   └── db.js              # Database configuration
├── models/
│   └── Transcription.js   # Mongoose schema for transcriptions
├── controllers/
│   └── transcriptionController.js # Transcription logic
├── services/
│   ├── whisper.js         # OpenAI Whisper service
│   └── deepgram.js        # Deepgram service
├── routes/
│   └── upload.js         # Upload and transcription routes
├── uploads/              # Temporary file storage
├── server.js             # Main server file
├── package.json          # Dependencies
├── .env.example          # Environment variables template
├── .env                  # Environment variables (not in git)
└── .gitignore            # Git ignore rules
```

## Dependencies

- express: Web framework
- mongoose: MongoDB object modeling
- multer: File upload handling
- cors: Cross-origin resource sharing
- dotenv: Environment variable management
- openai: OpenAI API client
- @deepgram/sdk: Deepgram API client
- nodemon: Development server auto-reload (dev dependency)

## Next Steps

- Add authentication
- Implement audio recording functionality in frontend
- Add user-specific transcription history
- Implement real-time transcription streaming
- Add transcription editing capabilities
- Export transcriptions to different formats (TXT, SRT, VTT)
