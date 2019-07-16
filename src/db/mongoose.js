const mongoose = require("mongoose");

const db = mongoose.connect(process.env.MONGOOSE_ADDRESS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});
