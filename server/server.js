import app from "./src/app.js";
import dotenv from "dotenv"
import connectDB from "./src/config/database.js";
dotenv.config()

connectDB();
let port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server is running at ${port}`);
    
})