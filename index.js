import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import cors from "cors";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: "*",
    allowedHeaders: "*",
  },
});

const allStudents = new Map();
let question = {};
let answered = 0;

io.on("connection", (socket) => {
  console.log(socket.id);
  /*
    {
      question,
      options: [
        {value: "", correct: ""}
      ]
    }
  */
  socket.on("question", (data) => {
    question = {
      question: data.question,
      options: data.options.map(({ value }) => ({
        value, // option name
        count: 0, // number of people who have answered this option
      })),
    };

    io.emit("newQuestion", question);
  });

  // data => student name
  socket.on("newStudent", (name) => {
    allStudents.set(socket.id, name);
    console.log(allStudents);
  });

  // data = index of question answered
  socket.on("answer", (index) => {
    question.options[index].count++;
    answered++;

    console.log(JSON.stringify(question));

    io.emit("questionStatus", question);

    if (answered === allStudents.length) {
      io.emit("endQuestion");
    }
  });

  socket.on("disconnect", () => {
    allStudents.delete(socket.id);
  });
});

server.listen(5000, () =>
  console.log("Server Started at http://localhost:5000")
);
