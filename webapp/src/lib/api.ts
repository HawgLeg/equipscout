const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

class ApiError extends Error {
  constructor(message: string, public status: number, public data?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

// Response envelope type - all app routes return { data: T }
interface ApiResponse<T> {
  data: T;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const json = await response.json().catch(() => null);
    throw new ApiError(
      // Try app-route format first, fallback to generic message (Better Auth uses this)
      json?.error?.message || json?.message || `Request failed with status ${response.status}`,
      response.status,
      json?.error || json
    );
  }

  // 1. Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  // 2. JSON responses: parse and unwrap { data }
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const json: ApiResponse<T> = await response.json();
    return json.data;
  }

  // 3. Non-JSON: return undefined (caller should use api.raw() for these)
  return undefined as T;
}

// Raw request for non-JSON endpoints (uploads, downloads, streams)
async function rawRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
    },
    credentials: "include",
  };
  return fetch(url, config);
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  // Escape hatch for non-JSON endpoints
  raw: rawRequest,
};

// Sample endpoint types (extend as needed)
export interface SampleResponse {
  message: string;
  timestamp: string;
}

// Contact event logging types
export type ContactEventType = "CALL" | "TEXT" | "EMAIL" | "WEBSITE" | "REQUEST";

export interface LogContactEventParams {
  vendorId: string;
  equipmentId?: string;
  eventType: ContactEventType;
  searchLocationText?: string;
  searchRadius?: number;
  needDate?: string;
  referrer?: string;
}

export interface LogContactEventResponse {
  ok: boolean;
  billable: boolean;
  eventId?: string;
  sessionId?: string;
  reason?: string;
}

// Session ID storage key
const SESSION_ID_KEY = "equipscout_session_id";

// Get or create session ID
function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

// Sample API functions
export const sampleApi = {
  getSample: () => api.get<SampleResponse>("/api/sample"),
};

// Contact event logging API
export const trackingApi = {
  logContactEvent: async (params: LogContactEventParams): Promise<LogContactEventResponse> => {
    const sessionId = getSessionId();
    const referrer = document.referrer || window.location.href;

    try {
      const response = await api.post<LogContactEventResponse>("/api/contact-events/log", {
        ...params,
        sessionId,
        referrer,
      });
      return response;
    } catch {
      // Don't block user actions on tracking failures
      console.error("Failed to log contact event");
      return { ok: false, billable: false };
    }
  },
};

export { ApiError };
