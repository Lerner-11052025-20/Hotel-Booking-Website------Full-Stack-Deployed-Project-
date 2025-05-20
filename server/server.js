import express from "express"
import "dotenv/config"
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js";

connectDB()

const app = express()
app.use(cors()) // enables us to vross-origin resorce sharing


//middelware
app.use(express.json())
app.use(clerkMiddleware())

//API for clerk webhook
app.use("/api/clerk", clerkWebhooks)

app.get('/', (req, res) => res.send("API is working GOOD!!"))

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));