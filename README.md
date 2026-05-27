# EchoScriptAI (Speech-to-Text Transcription App)

EchoScriptAI is an audio transcription web app with:

- **Authentication** (JWT)
- **Server-side STT** using **OpenAI Whisper** (and optional **Deepgram**)
- **Browser fallback** using the **Web Speech API**
- **Transcription management** (CRUD for the authenticated user)
- **AI text utilities** (summary, action items, analytics)

Frontend: **React + Vite**  
Backend: **Node + Express + MongoDB (Mongoose)**

---

## Live Deployment
- Frontend: see `DEPLOYMENT.md` / `VERCEL_DEPLOYMENT.md`
- Backend: `https://echoscriptai.onrender.com`

---

## Local Development

### 1) Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/echoscriptai
PORT=5000
JWT_SECRET=dev-secret-key
CORS_ORIGIN=http://localhost:5173

OPENAI_API_KEY=your_openai_key
DEEPGRAM_API_KEY=your_deepgram_key
DEFAULT_STT_PROVIDER=whisper
```

Start:
```bash
npm start
# or: node server.js
```

### 2) Frontend
```bash
npm install
npm run dev
```

Vite env (in your `.env` / `.env.local`):
```env
VITE_REACT_APP_API_URL=http://localhost:5000/api
```

---

## API Usage (Key Endpoints)

Backend base route: **`/api`**

### Auth (unauthenticated)
- `POST /api/auth/register`
  - Body: `{ "email": "...", "password": "...", "name": "..." }`
- `POST /api/auth/login`
  - Body: `{ "email": "...", "password": "..." }`

The backend returns a JWT token which the frontend stores in:
- `localStorage.echoscriptai_token`

### Upload / Transcription (authenticated via `Authorization: Bearer <token>`)
Backend route base: **`/api/upload`**

- `POST /api/upload/transcribe`
  - `multipart/form-data`
  - **Field name must be**: `audio`
  - Optional fields:
    - `provider` (`whisper`, `deepgram`, `auto`)
    - `language` (default `en-US`)

- `GET /api/upload/transcriptions`
- `GET /api/upload/transcription/:id`
- `PUT /api/upload/transcription/:id`
- `DELETE /api/upload/transcription/:id`

### Provider Status
- `GET /api/upload/provider-status`

### AI Text Utilities
Current implementation: AI utility routes are available under `/api/upload/ai/*`.

- `POST /api/upload/ai/summary` `{ "text": "..." }`
- `POST /api/upload/ai/action-items` `{ "text": "..." }`
- `POST /api/upload/ai/remove-fillers` `{ "text": "..." }`
- `POST /api/upload/ai/analytics` `{ "text": "...", "duration": 123 }`

---

## Deployment

### Render (Backend)
See: `DEPLOYMENT.md` (Render + MongoDB Atlas + env vars + CORS + verification steps)

### Vercel (Frontend)
See: `VERCEL_DEPLOYMENT.md` (Vite build + env var `VITE_REACT_APP_API_URL`)

---

## Troubleshooting

- **CORS errors**: ensure `CORS_ORIGIN` matches your frontend URL exactly.
- **Auth failures (401)**:
  - ensure `JWT_SECRET` is set on backend
  - ensure token is stored in `localStorage.echoscriptai_token`
- **Upload failures**:
  - ensure multer field name is `audio`
  - upload limit is **50MB**
  - check backend logs for multer/provider errors

---
