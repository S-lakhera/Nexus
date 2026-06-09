import { Server } from 'socket.io'

let onlineUsers = [];

const initializeSocketServer = (httpServer) => {

    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    })

    io.on("connection", (socket) => {
        console.log("new User connected : ", socket.id);

        // 1. SETUP: User logs in and joins their personal room
        socket.on("setup", (userData) => {
            socket.join(userData._id);
            socket.emit("connected");

            // Add user to the ledger if they aren't already in it
            if (!onlineUsers.some(user => user.userId === userData._id)) {
                onlineUsers.push({ userId: userData._id, socketId: socket.id });
            }

            // Broadcast the updated array to ALL connected clients
            io.emit("get online users", onlineUsers);
            console.log("User joined personal room: ", userData._id);
        })

        // 2. JOIN CHAT: User clicks on a specific chat 
        socket.on("join chat", (room) => {
            socket.join(room);
            console.log("User joined chat room : ", room);
        })



        // 3. TYPING TNDICATORS: Broadcast to the specific chat room
        socket.on("typing", (room) => {
            socket.in(room).emit("typing")
        })
        socket.on("stop typing", (room) => {
            socket.in(room).emit("stop typing");
        })

        // 4. NEW MESSAGE: Fast reply 
        socket.on("new message", (newMessageReceived) => {
            let chat = newMessageReceived.chat;

            if (!chat.users) {
                console.log("chat.users not defined");
                return
            }

            chat.users.forEach(user => {
                if (user._id === newMessageReceived.sender._id) return;

                socket.in(user._id).emit("message received", newMessageReceived)
            });
        })

        // 5. READ RECEIPT: Notify the sender that their message is read
        socket.on("message read", (readData) => {
            let chat = readData.chat;

            if (!chat.users) return

            socket.in(readData.sender._id).emit("receipt updated", readData)
        })


        socket.on("disconnect", () => {
            onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
            io.emit("get online users", onlineUsers);
            console.log("User disconnected : ", socket.id);
        })
    })

    return io
}

export default initializeSocketServer;