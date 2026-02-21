import { createAuthClient } from "better-auth/react";

const baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || undefined;

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { useSession, signOut } = authClient;
