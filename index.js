const express = require("express");
const mongoose = require("mongoose");
const PORT = 3000;
const app = express();
const DB = "mongodb+srv://kelvin:kelvin180497@cluster0.dqsj5lf.mongodb.net/AmazonCloneTurtorial?retryWrites=true&w=majority";

//middleware
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");
//connection
//user:kelvin , password:kelvin180497
mongoose
  .connect(DB)
  .then(() => {
    console.log("connection successfully");
  })
  .catch((e) => {
    console.log(e);
  });
app.use(express.json());
app.use(authRouter);
app.use(adminRouter);
app.use(productRouter);
app.use(userRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`connected at PORT ${PORT}`);
});
