# Nexus ⚡

Nexus is a production-ready, real-time chat and communication platform built on the MERN stack (MongoDB, Express, React, Node.js) and Socket.io. It supports secure, session-managed user authentication, 1-on-1 private messaging, multi-user group chats, typing indicators, read receipts, and state management powered by Redux Toolkit.

---

## 🚀 Key Features

- **Real-Time Messaging:** Fully event-driven 1-on-1 and group chats powered by WebSockets (Socket.io).
- **Typing & Read Indicators:** Real-time feedback showing when a user is typing and when messages have been read.
- **Secure Session Auth:** JWT-based authentication featuring dynamic Access Token issuance and secure `HttpOnly` Refresh Token cookies.
- **State Management:** Fully synchronized client state using Redux Toolkit combined with React Contexts for Socket connectivity.
- **Modular Codebase:** Highly structured folder organization built around feature folders on the frontend and MVC controllers on the backend.

---

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (using Mongoose ODM)
- **Real-time Engine:** Socket.io (Server)
- **Security:** bcryptjs (password hashing), jsonwebtoken (auth tokens), cookie-parser

### Frontend

- **Build Tool:** Vite
- **Library:** React (v19)
- **State Management:** Redux Toolkit & React-Redux
- **Routing:** React Router (v7)
- **Styling:** Tailwind CSS & Lucide Icons
- **Real-time Client:** socket.io-client

---

## 📂 Folder Structure

The repository is split into two main sections: `server` (backend API & sockets) and `client` (React frontend SPA).

```text
Nexus/
├── client/                     # Frontend Application
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── app/
│   │   │   └── store.js        # Redux Toolkit store configurations
│   │   ├── assets/             # Images, vectors, and stylesheets
│   │   ├── context/            # React Contexts
│   │   │   ├── SocketContext.jsx # Socket.io connection provider & hooks
│   │   │   └── UIContext.jsx   # UI configuration context (font sizes, etc.)
│   │   ├── features/           # Feature-based modular structure
│   │   │   ├── auth/           # Authentication features
│   │   │   │   ├── api/        # Auth Axios requests (auth.api.js)
│   │   │   │   ├── hooks/      # Local hooks (if any)
│   │   │   │   ├── state/      # Redux auth slice (authSlice.js)
│   │   │   │   └── ui/         # Auth screens (LoginPage, SignupPage)
│   │   │   └── chat/           # Messaging and Chat features
│   │   │       ├── api/        # Chat & Message Axios requests (chat.api.js)
│   │   │       ├── hooks/      # Chat custom hooks
│   │   │       ├── state/      # Redux chat slice (chatSlice.js)
│   │   │       └── ui/         # Chat layout (ChatPage, ChatSidebar, ChatWindow)
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx   # Router definition and route guards
│   │   ├── services/
│   │   │   └── api.js          # Global Axios instance with token interceptors
│   │   ├── App.jsx             # Root component wrapping routes
│   │   ├── index.css           # Global CSS variables & Tailwind imports
│   │   └── main.jsx            # Application entry point & provider trees
│   ├── .env                    # Client environment settings
│   ├── index.html              # HTML entrypoint
│   ├── package.json            # Client dependencies and scripts
│   └── vite.config.js          # Vite configuration
│
└── server/                     # Backend API & Socket Server
    ├── src/
    │   ├── config/
    │   │   ├── database.js     # MongoDB database connection setup
    │   │   └── socket.js       # Socket.io connection handlers & namespaces
    │   ├── controllers/
    │   │   ├── auth.controller.js # Auth actions (login, register, search, refresh, logout)
    │   │   ├── chat.controller.js # Chat rooms actions (create 1v1, group, rename, add/remove member)
    │   │   └── message.controller.js # Messaging actions (send, fetch, read receipts)
    │   ├── middlewares/
    │   │   └── auth.middleware.js # JWT payload validation guard (protect)
    │   ├── models/
    │   │   ├── chat.model.js   # Chat Schema definition
    │   │   ├── message.model.js # Message Schema definition
    │   │   └── user.model.js   # User Schema definition
    │   ├── routes/
    │   │   ├── auth.route.js   # Routes under /api/auth
    │   │   ├── chat.route.js   # Routes under /api/chat
    │   │   ├── message.route.js # Routes under /api/message
    │   │   └── index.route.js  # Main router consolidating sub-routers
    │   ├── utils/
    │   │   └── generateToken.js # JWT signing helper utilities
    │   └── app.js              # Express app definition and base middleware setup
    ├── .env                    # Backend secrets and DB URI configurations
    ├── package.json            # Server dependencies and scripts
    └── server.js               # HTTP Server listener & socket binder
```

---

## 🗄️ Database Schemas

### 1. User Schema (`User`)

- `name` (String, Required): Display name of the user.
- `email` (String, Required, Unique): User's registration email.
- `password` (String, Required): Hashed password (using bcryptjs).
- `pic` (String): URL pointing to profile image (defaults to a system fallback vector).
- `timestamps`: Automatically handles `createdAt` and `updatedAt`.

### 2. Chat Schema (`Chat`)

- `chatName` (String, Trimmed): Name of the chat room (or group).
- `isGroupChat` (Boolean, Default: false): Indicates if the chat is a group.
- `users` (Array of ObjectIds, Ref: "User"): References to users participating in this chat room.
- `latestMessage` (ObjectId, Ref: "Message"): Reference to the last message sent in this room.
- `groupAdmin` (ObjectId, Ref: "User"): Reference to the creator/administrator of the group.
- `timestamps`: Track active status and ordering.

### 3. Message Schema (`Message`)

- `sender` (ObjectId, Ref: "User"): Reference to the author of the message.
- `content` (String, Trimmed): The text body of the message.
- `chat` (ObjectId, Ref: "Chat"): Reference to the chat room where this message belongs.
- `readBy` (Array of ObjectIds, Ref: "User"): References to users who have marked this message as read.
- `timestamps`: Tracking for delivery times.

---

## 🔌 API Endpoints (Routes)

All endpoints are prefixed with `/api` and are routed through `/server/src/app.js`.

### 🔑 Authentication (`/api/auth`)

| Method   | Endpoint             | Auth    | Description                          | Request Body                      | Response                                            |
| :------- | :------------------- | :------ | :----------------------------------- | :-------------------------------- | :-------------------------------------------------- |
| **POST** | `/api/auth/register` | Public  | Register a new user account          | `{ name, email, password, pic? }` | User document + `accessToken` + Set HttpOnly cookie |
| **POST** | `/api/auth/login`    | Public  | Login with email and password        | `{ email, password }`             | User document + `accessToken` + Set HttpOnly cookie |
| **POST** | `/api/auth/logout`   | Public  | Clear cookies & end session          | None                              | `{ message: "Logged out successfully" }`            |
| **POST** | `/api/auth/refresh`  | Public  | Request new short-lived access token | None (Reads cookie)               | `{ accessToken }`                                   |
| **GET**  | `/api/auth/search`   | Private | Search for other users to chat with  | Query: `?search=keyword`          | Array of User documents (excluding passwords)       |

### 💬 Chat Rooms (`/api/chat`)

| Method   | Endpoint                | Auth    | Description                     | Request Body             | Response                     |
| :------- | :---------------------- | :------ | :------------------------------ | :----------------------- | :--------------------------- |
| **POST** | `/api/chat/`            | Private | Access or create a 1-on-1 chat  | `{ userId }`             | Chat room document           |
| **GET**  | `/api/chat/`            | Private | Fetch all active chats for user | None                     | Array of Chat room documents |
| **POST** | `/api/chat/group`       | Private | Create a multi-user group chat  | `{ name, users: [...] }` | Created Group Chat document  |
| **PUT**  | `/api/chat/rename`      | Private | Change the name of a group chat | `{ chatId, chatName }`   | Updated Chat document        |
| **PUT**  | `/api/chat/groupadd`    | Private | Add a member to a group chat    | `{ chatId, userId }`     | Updated Chat document        |
| **PUT**  | `/api/chat/groupremove` | Private | Remove a member/leave group     | `{ chatId, userId }`     | Updated Chat document        |

### ✉️ Messaging (`/api/message`)

| Method   | Endpoint               | Auth    | Description                         | Request Body          | Response                   |
| :------- | :--------------------- | :------ | :---------------------------------- | :-------------------- | :------------------------- |
| **GET**  | `/api/message/:chatId` | Private | Get all messages in a specific chat | None                  | Array of Message documents |
| **POST** | `/api/message/`        | Private | Send a new message to a chat room   | `{ chatId, content }` | Created Message document   |
| **POST** | `/api/message/read`    | Private | Mark a message as read              | `{ messageId }`       | Updated Message document   |

---

## 📡 WebSockets (Socket.io) Event API

Nexus uses WebSockets on the server to support zero-latency message distribution and status tracking.

### Incoming Events (Listener on Server)

- **`setup`** - Payload: `userData`. Associates the connecting client's socket with their personal room (`userData._id`). Emits `connected` back to the client.
- **`join chat`** - Payload: `room` (chatId string). Places the client's socket into a dedicated room for that chat channel.
- **`typing`** - Payload: `room` (chatId string). Broadcasts a typing status indicator to everyone in the chat room except the sender.
- **`stop typing`** - Payload: `room` (chatId string). Broadcasts the removal of the typing indicator in the room.
- **`new message`** - Payload: `newMessageReceived`. Distributes the new message object to all chat participants' personal rooms (except the sender).
- **`message read`** - Payload: `readData`. Distributes updated read receipt information to the sender (`readData.sender._id`).

### Outgoing Events (Emitted to Clients)

- **`connected`** - Emitted to confirm setup room joining.
- **`typing`** - Transmitted to the active chat room when a participant is typing.
- **`stop typing`** - Transmitted to the active chat room when a participant stops typing.
- **`message received`** - Transmitted to individual user rooms to deliver a message in real-time.
- **`receipt updated`** - Transmitted to the original sender to update read status indicators in their view.

---

## 🛣️ Frontend Routing & Navigation

The frontend handles navigation using React Router v7 (`AppRoutes.jsx`). It divides screens into Public routes and Protected routes.

- **`/`** - Instantly redirects to `/login`.
- **`/login`** (Public Route) - Renders the Login page. Redirects to `/dashboard` if user session state exists.
- **`/register`** (Public Route) - Renders the Signup page. Redirects to `/dashboard` if user session state exists.
- **`/dashboard`** (Protected Route) - The core messaging environment. Loads components:
  - **`ChatSidebar`**: List of all conversations, user search, profile configurations, and group creators.
  - **`ChatWindow`**: Renders message log, handles input boxes, emits sockets, shows typing and read markers.
- **`*`** - Catch-all 404 handler page ("404 - Network Node Not Found").

---

## ⚙️ Environment Configuration

You need to establish `.env` files in both the client and server root directories.

### Backend Configurations (`/server/.env`)

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_access_secret_string
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret_string
```

### Frontend Configurations (`/client/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000/api
NODE_ENV=development
```

---

## 🛠️ Installation & Getting Started

### 📋 Prerequisites

- Install [Node.js](https://nodejs.org/) (v16+ recommended).
- Setup a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster or local MongoDB instance.

### 🏃 Setup & Run

1. **Clone the Repository**

   ```bash
   git clone <repository_url>
   cd Nexus
   ```

2. **Setup the Backend**

   ```bash
   cd server
   npm install
   # Create a .env file and fill in parameters
   npm run dev
   ```

   _The server will start, by default running on `http://localhost:3000`._

3. **Setup the Frontend**

   ```bash
   cd ../client
   npm install
   # Create a .env file and fill in parameters
   npm run dev
   ```

   _The client dev server will spin up on `http://localhost:5173`._

4. **Verify Deployment**
   - Open your browser and navigate to `http://localhost:5173`.
   - Register a user, invite a contact, and start exchanging instant messages!
