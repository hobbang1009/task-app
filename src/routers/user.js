const express = require("express");
const User = require("../models/user");
const { welcomeMessage, goodbyeMessage } = require("../emails/account");
const sharp = require("sharp");
const upload = require("../middlewares/multer");
const midAuth = require("../middlewares/auth");
const router = express.Router();

router.post("/user", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    welcomeMessage(user.email, user.name);
    const token = await user.genAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const userInfo = await User.checkit(req.body.email, req.body.password);

    const token = await userInfo.genAuthToken();
    res.status(200).send({ userInfo, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/user/logout", midAuth, async (req, res) => {
  try {
    const token = req.token;
    req.user.tokens = req.user.tokens.filter(value => {
      return value.token !== token;
    });

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(400).send();
  }
});

router.post("/user/logoutAll", midAuth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});

router.get("/user/me", midAuth, async (req, res) => {
  try {
    const user = req.user;
    const token = req.token;
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/users/:id/avatar", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || !user.avatar) {
    res.status(404).send("Not Found");
  }
  res.set("Content-Type", "image/png");
  res.send(user.avatar);
});

router.post(
  "/users/me/avatar",
  midAuth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize(250, 250)
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send(error.message);
  }
);

router.delete("/users/me/avatar", midAuth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});

router.patch("/user/me", midAuth, async (req, res) => {
  const reqKeys = Object.keys(req.body);
  const keyArray = ["name", "email", "password", "age", "tokens"];

  const allowed = reqKeys.every(value => {
    return keyArray.includes(value);
  });

  if (!allowed) {
    res.status(400).send("Not valid");
  }

  try {
    reqKeys.forEach(value => {
      return (req.user[value] = req.body[value]);
    });

    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/user/me", midAuth, async (req, res) => {
  try {
    await req.user.remove();
    goodbyeMessage(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
