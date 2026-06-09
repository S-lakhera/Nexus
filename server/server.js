import app from "./src/app.js";
import dotenv from "dotenv"
import connectDB from "./src/config/database.js";
import http from 'http'
import initializeSocketServer from "./src/config/socket.js";
dotenv.config()
connectDB();

let port = process.env.PORT || 4000;

let httpServer = http.createServer(app)

initializeSocketServer(httpServer)

httpServer.listen(3000, () => {
    console.log(`Server is running at ${port}`);
    
})