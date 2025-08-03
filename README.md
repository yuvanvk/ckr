# CKR - Real-time Chat Application

A real-time chat application built with Next.js, Socket.IO, and TypeScript.

## Features

- **Real-time messaging**: Instant message delivery using Socket.IO
- **Room-based chat**: Join specific rooms to chat with other users
- **User management**: Track active users and their room participation
- **Modern UI**: Clean and responsive interface built with shadcn/ui components
- **TypeScript**: Full type safety across the entire application

## Architecture

- **Frontend**: Next.js 15 with TypeScript
- **Backend**: Socket.IO server with Express
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: React hooks with Socket.IO events

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

1. Start the WebSocket server:
   ```bash
   cd apps/ws
   pnpm build
   node dist/index.js
   ```
   The server will run on `http://localhost:8080`

2. In a new terminal, start the web application:
   ```bash
   cd apps/web
   pnpm dev
   ```
   The web app will run on `http://localhost:3000`

### Usage

1. Open `http://localhost:3000` in your browser
2. Click "Create Room" to start
3. Enter your username and room name
4. Join the room and start chatting!
5. Open multiple browser tabs/windows to test with multiple users

## Socket.IO Events

### Client to Server
- `join_room`: Join a specific room
- `send_message`: Send a message to the room
- `leave_room`: Leave the current room
- `get_room_participants`: Get list of participants in a room

### Server to Client
- `receive_message`: Receive a message from another user
- `user_joined`: Notification when a user joins the room
- `user_left`: Notification when a user leaves the room
- `room_participants`: Updated list of room participants

## Project Structure

```
ckr/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   └── lib/           # Utilities (socket config)
│   └── ws/                # Socket.IO backend
│       └── src/           # Server source code
├── packages/
│   └── ui/               # Shared UI components
└── README.md
```

## Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Socket.IO, Express, Node.js
- **UI**: shadcn/ui, Tailwind CSS, Lucide React icons
- **Build Tool**: Turborepo with pnpm workspaces
