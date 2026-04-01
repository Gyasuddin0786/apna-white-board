# WhiteBoard - Real-Time Collaborative Whiteboard

A professional real-time collaborative whiteboard app built with the MERN stack.

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS v4, Material UI, Zustand, Konva.js, Socket.io-client
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, Socket.io, JWT

## Features

- 🎨 Canvas drawing: pencil, eraser, shapes, arrows, text, sticky notes
- 👥 Real-time collaboration with live cursors via WebSockets
- 🔐 JWT authentication (login/signup)
- 💾 Auto-save + version history
- 📤 Export PNG, PDF, JSON / Import JSON
- 🌙 Dark/Light mode
- ⌨️ Keyboard shortcuts (V, P, E, R, C, T, L, Ctrl+Z/Y, Delete)
- 📐 Grid with snap-to-grid
- 🗂️ Layer management
- 🔗 Room-based sharing via URL

## Setup

### Prerequisites
- Node.js >= 18
- MongoDB running locally on port 27017

### Backend

```bash
cd server
npm install
# Edit .env if needed (MONGO_URI, JWT_SECRET, etc.)
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

App runs at: http://localhost:5173  
API runs at: http://localhost:5000

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| V | Select tool |
| P | Pencil |
| E | Eraser |
| R | Rectangle |
| C | Circle |
| T | Text |
| L | Line |
| Ctrl+Z | Undo |
| Ctrl+Y / Ctrl+Shift+Z | Redo |
| Delete / Backspace | Delete selected |
| Escape | Back to select |

## API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Boards
- `GET /api/boards` - Get all user boards
- `POST /api/boards` - Create board
- `GET /api/boards/:id` - Get board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/:id/collaborators` - Add collaborator
- `GET /api/boards/:id/versions` - Get version history

## Environment Variables

### Server `.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/whiteboard
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```
