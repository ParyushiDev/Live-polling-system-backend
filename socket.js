const allStudents = new Map();
let studentsForCurrQuestion = new Map();
let question = {};
let answered = 0;

export default function initSocket(io, db) {
  io.on("connection", (socket) => {
    console.log(socket.id);

    /*
      {
      question,
      options: [
      {value: "", correct: ""}
      ],
      time
      }
    */
    socket.on("question", (data) => {
      question = {
        question: data.question,
        options: data.options.map(({ value }) => ({
          value, // option name
          count: 0, // number of people who have answered this option
        })),
        time: data.time
      };

      answered = 0;
      console.log(allStudents);
      studentsForCurrQuestion = new Map(allStudents);
      console.log(studentsForCurrQuestion);

      io.emit("newQuestion", question);
    });

    // data => student name
    socket.on("newStudent", (name) => {
      allStudents.set(socket.id, name);
    });

    // data = index of question answered
    socket.on("answer", async (index) => {
      if (index >= 0) {
        question.options[index].count++;
        io.emit("questionStatus", question);
      }
      
      answered++;
      
      if (answered === studentsForCurrQuestion.size) {
        console.log("emitting end question");
        io.emit("endQuestion");
        const {error} = await db
          .from("past_polls")
          .insert({
            question: question.question,
            options: question.options
          });
        console.log("error in posting poll to db", error);
      }
    });

    socket.on("disconnect", () => {
      allStudents.delete(socket.id);

      if (studentsForCurrQuestion.has(socket.id)) {
        answered++;
        studentsForCurrQuestion.delete(socket.id);
      }
    });
  });
}
