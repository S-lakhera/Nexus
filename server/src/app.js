import express from 'express'
import cookieParser from 'cookie-parser'
import indexRoutes from './routes/index.route.js'
import cors from 'cors'


let app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials : true,
}))

app.use("/api", indexRoutes)

app.use((req, res, next) => {
    res.status(404).json({
        message: "Route not found"
    })
})

app.get("/", (req, res) => {
    res.send("I am server")
})

export default app;