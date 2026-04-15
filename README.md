# AI Todo — Frontend

React frontend for AI Todo. Lets users set goals, generate AI-powered task lists, and chat with Claude for more details on any task.

## Setup

```bash
npm install
npm start
```

App runs at `http://localhost:3000`. Make sure the backend is running at `http://localhost:8000` first.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Run in development mode |
| `npm run build` | Build for production |
| `npm test` | Run tests |

## Pages

- **Login / Register** — user auth
- **My Goals** — view and manage goals
- **Add Goal** — create a new goal and trigger AI task generation

## Notes

By default the app points to the backend at `http://localhost:8000`. To change this, update the API base URL in your fetch calls or add a proxy entry to `package.json`.
