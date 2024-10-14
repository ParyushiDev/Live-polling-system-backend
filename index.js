import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import initSocket from "./socket.js";

dotenv.config();

const dbKey = process.env.DB_KEY;

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: "*",
    allowedHeaders: "*",
  },
});

initSocket(io, db);

app.use(cors());

app.get("/", (_, res) => {
  res.json({ msg: "hello" });
})

app.get("/getAll", async (req, res) => {
  const { data, error } = await db.from("past_polls").select();

  console.log(data, error);

  if (error) {
    res.status(500).json({error})
  } else {
    res.json(data);
  }
})

server.listen(5000, () =>
  console.log("Server Started at http://localhost:5000")
);
