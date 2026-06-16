# DevPulse Backend

Express + MongoDB Atlas backend for the DevPulse developer productivity dashboard.

## Tech Stack

- **Node.js** with ES Modules
- **Express.js** web framework
- **Mongoose** ODM for MongoDB
- **MongoDB Atlas** cloud database

## Project Structure

```
backend/
├── server.js              # Express app entry point
├── package.json           # Dependencies
├── .env.example           # Environment template
├── models/
│   ├── Project.js         # Project schema
│   ├── Session.js         # Time session schema
│   ├── Log.js             # Daily log schema
│   └── Snippet.js         # Code snippet schema
├── routes/
│   ├── projects.js        # Project CRUD endpoints
│   ├── sessions.js        # Session + stats endpoints
│   ├── logs.js            # Daily log endpoints
│   └── snippets.js        # Snippet + search endpoints
├── scripts/
│   └── seed.js            # Database seeding script
└── MONGODB_ATLAS_SETUP.md # Detailed setup guide
```

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string

# Start development server
npm run dev

# Seed database with sample data
npm run seed
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | development/production |
| `FRONTEND_URL` | Frontend URL for CORS |

## API Endpoints

### Health
- `GET /api/health` - Server health check

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Sessions
- `GET /api/sessions` - List sessions
- `GET /api/sessions/stats` - Statistics
- `GET /api/sessions/active` - Active session
- `POST /api/sessions` - Start session
- `PUT /api/sessions/:id/stop` - Stop session
- `DELETE /api/sessions/:id` - Delete session

### Logs
- `GET /api/logs` - List daily logs
- `POST /api/logs` - Create log
- `PUT /api/logs/:id` - Update log
- `DELETE /api/logs/:id` - Delete log

### Snippets
- `GET /api/snippets` - List snippets
- `POST /api/snippets` - Create snippet
- `PUT /api/snippets/:id` - Update snippet
- `DELETE /api/snippets/:id` - Delete snippet

## MongoDB Atlas Configuration

See [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md) for complete setup instructions.

## Frontend Integration

Set `USE_API = true` in `src/lib/mongodb-client.ts` to connect to this backend.
