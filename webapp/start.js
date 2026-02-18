import { spawn } from "child_process";

const port = process.env.PORT || 8080;
console.log("Starting static server on port:", port);
console.log("Binding to 0.0.0.0:" + port);

spawn(
  "npx",
  ["serve", "-s", "dist", "-l", `tcp://0.0.0.0:${port}`],
  { stdio: "inherit" }
);
