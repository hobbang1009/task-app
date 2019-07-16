const express = require("express");
const Task = require("../models/task");
const User = require("../models/user");
const midAuth = require("../middlewares/auth");
const router = new express.Router();

router.post("/task", midAuth, async (req, res) => {
  try {
    const task = new Task({
      description: req.body.description,
      completed: req.body.completed,
      owner: req.user._id
    });
    await task.populate("owner").execPopulate();

    await task.save();
    res.status(200).send(task);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/tasks", midAuth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    const tasks = await req.user
      .populate({
        path: "userTasks",
        match: match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        }
      })
      .execPopulate();
    res.send(tasks.userTasks);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/task/:id", midAuth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!task) {
      res.status(400).res.send("Not Found");
    }
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch("/task/:id", midAuth, async (req, res) => {
  const reqKeys = Object.keys(req.body);
  const keyArrays = ["completed", "description"];
  const isValid = reqKeys.every(value => {
    return keyArrays.includes(value);
  });
  if (!isValid) {
    res.status(400).send("Error!");
  }
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    reqKeys.forEach(value => {
      task[value] = req.body[value];
    });
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/task/:id", midAuth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!task) {
      res.status(400).send("Not Found");
    }
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
