# 🚀 Agile Story Point Voting App - Technical Specification

> **Real-time collaborative story point voting for agile teams**

## 📋 Project Overview

The Agile Story Point Voting App is a modern, real-time collaborative application designed for agile development teams to conduct story point estimation sessions. Built with cutting-edge web technologies, it provides an intuitive interface for planning poker sessions with live updates, customizable timers, and comprehensive voting analytics.

## 🏗️ System Architecture

### Frontend Architecture
- **Framework**: Nuxt 3 (Vue 3 + Vite)
- **State Management**: Vue 3 Composition API with reactive refs
- **Real-time Communication**: WebSocket via custom composable
- **Styling**: Modern CSS with dark theme and responsive design
- **Routing**: File-based routing with dynamic session parameters

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Real-time Layer**: WebSocket server (ws library)
- **Data Persistence**: Redis for session storage
- **Session Management**: In-memory session tracking with Redis backup
- **Message Protocol**: JSON-based WebSocket messaging

### Infrastructure
- **Containerization**: Docker support for all components
- **Kubernetes**: Helm charts for production deployment
- **Scaling**: Stateless backend design for horizontal scaling
- **Environment**: Configurable via environment variables

## 🔧 Core Components

### 1. Session Management System
```typescript
// Core session data structures
interface Session {
  code: string;           // 4-character alphanumeric identifier
  title: string;          // Session description
  owner: string;          // Session creator/owner
  members: Set<string>;   // Active participants
  voting: VotingState;    // Current voting status
  votes: VoteRecord;      // Collected votes
}

interface VotingState {
  active: boolean;        // Whether voting is in progress
  seconds: number;        // Remaining time
  timer: NodeJS.Timeout;  // Countdown timer reference
}
```

**Key Features:**
- Automatic session code generation (4-char alphanumeric)
- Session ownership transfer and promotion
- Real-time member join/leave handling
- Automatic cleanup of abandoned sessions

### 2. WebSocket Communication Layer
**Message Types:**
- `create-session`: Initialize new voting session
- `join-session`: Add member to existing session
- `start-voting`: Begin voting round with custom timer
- `submit-vote`: Record individual story point votes
- `skip-timer`: Early termination of voting round
- `update-title`: Modify session description
- `promote-member`: Transfer session ownership

**Real-time Broadcasting:**
- Member list updates
- Voting state changes
- Vote submission confirmations
- Result revelations

### 3. Voting Engine
**Story Point Scale**: 1, 2, 3, 5, 8, 13, 21, ?
**Timer Configuration**: 5-120 seconds (configurable)
**Vote Collection**: Real-time aggregation with member tracking
**Result Calculation**: Distribution analysis with min/max highlighting

### 4. Frontend State Management
```typescript
// Core reactive state
const voting = ref({ active: false, seconds: 0 });
const members = ref([]);
const results = ref(null);
const vote = ref(null);
const votedMembers = ref(new Set());
```

**State Synchronization:**
- WebSocket message handlers update local state
- Reactive UI components reflect real-time changes
- Optimistic updates for better user experience

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Redis 7+
- npm or yarn package manager

### Development Setup

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd agile-app
npm install
cd backend && npm install
```

2. **Environment Configuration**
```bash
# Frontend (.env)
NUXT_PUBLIC_WS_URL=ws://localhost:4000
NUXT_PUBLIC_GOTO_BASE_URL=https://your-jira-instance.com/browse/

# Backend (.env)
PORT=4000
REDIS_URL=redis://localhost:6379
```

3. **Start Development Servers**
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
npm run dev
```

4. **Access Application**
- Frontend: http://localhost:3000
- Backend WebSocket: ws://localhost:4000
- Redis: localhost:6379

### Production Deployment

**Docker Compose:**
```bash
docker-compose up -d
```

**Kubernetes (Helm):**
```bash
helm install agile-voting ./charts
```

## 🔌 API Reference

### WebSocket Endpoints

#### Session Creation
```typescript
// Request
{
  type: 'create-session',
  title: string,
  userName: string
}

// Response
{
  type: 'session-created',
  code: string
}
```

#### Join Session
```typescript
// Request
{
  type: 'join-session',
  code: string,
  userName: string
}

// Response
{
  type: 'session-joined',
  code: string
}
```

#### Start Voting
```typescript
// Request
{
  type: 'start-voting',
  duration: number  // 5-120 seconds
}

// Response
{
  type: 'voting-state',
  active: true,
  seconds: number
}
```

#### Submit Vote
```typescript
// Request
{
  type: 'submit-vote',
  point: number | '?'
}

// Response
{
  type: 'vote-received'
}
```

### Real-time Events

#### Member Updates
```typescript
{
  type: 'members',
  members: string[]
}
```

#### Voting State Changes
```typescript
{
  type: 'voting-state',
  active: boolean,
  seconds: number
}
```

#### Vote Confirmations
```typescript
{
  type: 'voted',
  userName: string
}
```

#### Results Revelation
```typescript
{
  type: 'votes-revealed',
  votes: Record<string, number | '?'>,
  avg: number | null,
  distribution: Record<number, number>
}
```

## 🎨 UI Components

### 1. Session Header
- Session code display with copy functionality
- Share button for session invitation
- Editable session title (owner only)
- Jira integration link

### 2. Member Management
- Real-time member list with join/leave updates
- Owner identification and promotion controls
- Voting status indicators (pending/voted)

### 3. Voting Interface
- Configurable timer with increment/decrement controls
- Story point selection buttons (1, 2, 3, 5, 8, 13, 21, ?)
- Visual feedback for submitted votes
- Timer countdown with skip option

### 4. Results Visualization
- Vote distribution bar chart
- Individual vote display with min/max highlighting
- Statistical summary (average, distribution)

## 🔒 Security & Validation

### Input Validation
- Session code format: 4-character alphanumeric
- Username requirements: non-empty, unique per session
- Timer constraints: 5-120 seconds
- Vote validation: numeric or question mark only

### Access Control
- Session owner privileges for administrative actions
- Member promotion and ownership transfer
- Session title modification restrictions

### Data Integrity
- Redis persistence for session data
- WebSocket connection state validation
- Graceful handling of disconnections

## 🧪 Testing & Quality

### Frontend Testing
- Vue 3 Composition API testing
- WebSocket connection mocking
- Component state validation
- Responsive design testing

### Backend Testing
- WebSocket message handling
- Session state management
- Redis integration testing
- Error handling validation

### Integration Testing
- End-to-end voting workflows
- Multi-user session scenarios
- Network interruption handling
- Performance under load

## 🚀 Performance Considerations

### Frontend Optimization
- Reactive state management with Vue 3
- Efficient WebSocket message handling
- Minimal DOM updates during voting
- Optimized CSS animations

### Backend Optimization
- In-memory session tracking for speed
- Redis for persistent storage
- Efficient WebSocket broadcasting
- Timer optimization for multiple sessions

### Scalability Features
- Stateless backend design
- Redis clustering support
- Horizontal scaling capabilities
- Load balancing considerations

## 🔧 Configuration Options

### Environment Variables
```bash
# Frontend
NUXT_PUBLIC_WS_URL          # WebSocket server URL
NUXT_PUBLIC_GOTO_BASE_URL   # Jira/issue tracker base URL

# Backend
PORT                        # Server port (default: 4000)
REDIS_URL                   # Redis connection string
NODE_ENV                    # Environment mode
```

### Runtime Configuration
- Customizable voting timer range
- Configurable story point scales
- Session code generation options
- WebSocket reconnection settings

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failures**
   - Verify backend server is running
   - Check firewall/network configuration
   - Validate WebSocket URL configuration

2. **Redis Connection Issues**
   - Ensure Redis server is accessible
   - Verify connection string format
   - Check Redis authentication settings

3. **Voting Timer Problems**
   - Validate timer duration constraints
   - Check for multiple timer instances
   - Verify WebSocket message delivery

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` in backend environment.

## 🤝 Contributing

### Development Guidelines
- Follow Vue 3 Composition API patterns
- Maintain WebSocket message protocol consistency
- Add comprehensive error handling
- Include appropriate logging for debugging

### Code Structure
```
agile-app/
├── app/                    # Nuxt 3 frontend
│   ├── pages/            # Application routes
│   ├── composables/      # Reusable logic
│   └── assets/           # Static resources
├── backend/               # Node.js WebSocket server
│   ├── server.js         # Main server logic
│   ├── sessionManager.js # Session handling
│   └── redisClient.js    # Redis integration
├── charts/                # Kubernetes Helm charts
└── docs/                  # Documentation
```

## 📄 License

MIT License - See LICENSE file for details.

---

**Built with modern web technologies for agile teams who value real-time collaboration and efficient planning processes.**
