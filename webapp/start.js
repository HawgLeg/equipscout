import { spawn } from "child_process";

const port = process.env.PORT || 8080;
console.log("Starting static server on port:", port);

spawn(
  "npx",
  ["serve", "-s", "dist", "-l", `${port}`],
  { stdio: "inherit", shell: true }
);
