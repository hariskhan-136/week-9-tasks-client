import { clearToken, getToken } from "@/lib/session";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type ApiErrorResponse = {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
};

export class ApiError extends Error {
  status: number;
  error: string;
  messages: string[];

  constructor(
    status: number,
    message: string,
    error: string,
    messages: string[] = [],
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.error = error;
    this.messages = messages;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const body = (await response.json()) as ApiErrorResponse;

    const messages = Array.isArray(body.message)
      ? body.message
      : [body.message];

    const isLoginRequest = path === "/auth/login";

    if (response.status === 401 && !isLoginRequest) {
      clearToken();

      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }

    throw new ApiError(
      body.statusCode,
      messages.join(", "),
      body.error,
      messages,
    );
  }

  return (await response.json()) as T;
}
