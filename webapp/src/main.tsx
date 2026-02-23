import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://6130519f312d21103c2b234753860df2@o4510936111644672.ingest.us.sentry.io/4510936119050240",
  tracesSampleRate: 0.1,
});

import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
