const mongoose = require("mongoose");
const validator = require("validator");
const Task = require("./task");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate: value => {
        if (!validator.isEmail(value)) {
          throw new Error("This form must be Email");
        }
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate: value => {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Do not contain password word in your password");
        }
      }
    },
    age: {
      type: Number,
      default: 0,
      validate: value => {
        if (value < 0) {
          throw new Error("Invalid Number");
        }
      }
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ],
    avatar: {
      type: Buffer
    }
  },
  {
    timestamps: true
  }
);

userSchema.virtual("userTasks", {
  ref: "tasks",
  localField: "_id",
  foreignField: "owner"
});

userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

userSchema.methods.genAuthToken = async function() {
  const user = this;
  try {
    const token = await jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_PRIVATE_KEY
    );

    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
  } catch (e) {
    console.log("error from user.js");
  }
};

userSchema.statics.checkit = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Not Found");
  }
  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    throw new Error("Unable to login");
  }
  return user;
};

userSchema.pre("save", async function(next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.pre("remove", async function(next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("user", userSchema);

module.exports = User;
