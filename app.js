require("dotenv").config();
require("express-async-errors");

const cors = require("cors");

const connectDB = require("./db/connect");
const express = require("express");
const app = express();
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const regRouter = require("./routes/auth");

app.use(cors());

// middleware
app.use(express.static('./public'))
app.use(express.json());

//route
app.get("/hello", (req, res) => {
  res.send("Welcome to markme");
});

app.use("/api/v1", regRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT ||4000 ;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`listening on port ${port}....`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
