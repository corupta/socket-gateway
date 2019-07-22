import DotEnv from "dotenv";

DotEnv.config();

const app = require("./app");

const port = process.env.PORT || 4000;
const server = app.listen(port, () =>
  console.log(`Socket Gateway server started on ${port}`));

const socket = require("./socket");

socket(server);

