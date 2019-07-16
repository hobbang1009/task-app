require("./db/mongoose");
const express = require("express");
const taskRouter = require("./routers/task");
const userRouter = require("../src/routers/user");

const app = express();

const port = process.env.PORT;

//Uses
app.use(express.json());

app.use(taskRouter);
app.use(userRouter);

app.listen(port, () => {
  console.log(`Listening port :${port}`);
});
