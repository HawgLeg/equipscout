import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 1.0,
});

import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
