const DotEnv = require("dotenv");
DotEnv.config();

import Secret from "./secret";

if (process.argv.length === 3) {
  console.log(`Your secret is: ${Secret.get(process.argv[2])}`);
} else {
  console.error("Please run it as \"npm run secret -- <serviceName>\"");
}
