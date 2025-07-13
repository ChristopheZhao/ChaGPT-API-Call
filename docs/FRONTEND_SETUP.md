# Frontend-Backend Separation Architecture

## Project Architecture

This project now adopts a frontend-backend separation architecture:

```
ChaGPT-API-Call/
├── backend/                    # Backend API service (Flask)
│   ├── manager.py             # Main server file
│   ├── web_api/               # API interfaces
│   ├── src/                   # Core logic
│   ├── config/                # Configuration files
│   └── tools/                 # Tool modules
├── frontend/                   # Frontend application (React + TypeScript)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API service layer
│   │   ├── stores/            # State management
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   └── package.json           # Dependency management
└── templates/                  # Original HTML templates (preserved)
```

## Technology Stack

### Backend
- **Flask**: Web framework
- **OpenAI API**: AI model interface
- **Multimodal Support**: Text, voice, and image processing
- **Streaming Response**: Real-time message streaming

### Frontend
- **React 18**: User interface framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Zustand**: State management
- **React Markdown**: Markdown rendering
- **Axios**: HTTP client

## Launch Instructions

### 1. Start Backend Server

```bash
# In project root directory
python manager.py
```

The backend server will run at `http://127.0.0.1:9200`

### 2. Start Frontend Development Server

```bash
# Switch to frontend directory
cd frontend

# Install dependencies (first run)
npm install

# Start development server
npm run dev
```

The frontend application will run at `http://localhost:5173`

## Main Features

### 🚀 Core Features
- **Multi-session Management**: Create, delete, rename sessions
- **Streaming Conversations**: Real-time response streaming
- **Multimodal Interaction**: Support for text, image, and voice input
- **Model Selection**: Support for multiple AI model switching
- **Message Operations**: Copy, delete, edit messages

### 🎯 Smart Features
- **Smart Routing**: Automatically select the most suitable API endpoint
- **Image Recognition**: Upload images for analysis
- **Speech-to-Text**: Voice recording to text input
- **Text-to-Speech**: Read AI responses aloud
- **Code Highlighting**: Support for multiple programming language syntax highlighting

### 💡 User Experience
- **Modern UI**: Glass morphism design style
- **Responsive Layout**: Adapt to various screen sizes
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for line break
- **Data Persistence**: Local storage for sessions and settings

## Development Instructions

### Frontend Development
```bash
cd frontend
npm run dev        # Development mode
npm run build      # Build production version
npm run preview    # Preview production version
```

### Backend Development
Backend maintains original structure, main API endpoints:
- `/request_openai` - Standard chat API
- `/request_smart` - Smart multimodal API
- `/speech_to_text` - Speech recognition
- `/text_to_speech` - Text-to-speech
- `/text_to_speech_stream` - Streaming TTS

### Configuration Instructions
- Backend configuration files located in `config/` directory
- Frontend API endpoint configuration in `frontend/src/services/api.ts`
- Default backend address: `http://127.0.0.1:9200`

## Deployment Instructions

### Development Environment
1. Start both frontend and backend servers simultaneously
2. Frontend automatically proxies API requests to backend
3. Support for hot reload and real-time debugging

### Production Environment
1. Build frontend project: `npm run build`
2. Configure backend server to serve static files
3. Or use Nginx for reverse proxy

## Project Advantages

### Improvements over Original Architecture
1. **Development Efficiency**: Frontend and backend can be developed in parallel
2. **Code Maintenance**: Modular, component-based development
3. **Performance Optimization**: Code splitting, lazy loading
4. **Scalability**: Easy to add new features and pages
5. **Team Collaboration**: Separation of frontend and backend responsibilities

### Future Expansion Directions
- Workflow automation
- Plugin system
- Knowledge base integration
- Multi-user support
- Mobile adaptation

## Common Issues

### Q: Frontend cannot connect to backend?
A: Ensure backend server is running at `http://127.0.0.1:9200`, check CORS settings.

### Q: How to add new API interfaces?
A: Add routes in backend, add corresponding service methods in frontend `services/api.ts`.

### Q: How to customize themes?
A: Modify CSS variables in `frontend/src/index.css`.

### Q: How to add new components?
A: Create new components in the appropriate directory under `frontend/src/components/`.

---

**Note**: The original `templates/index.html` file is still preserved and can be used as reference or fallback solution. 