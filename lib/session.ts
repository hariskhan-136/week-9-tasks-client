export type SessionUser = {
  id: number;
  email: string;
};

const TOKEN_KEY = "access_token";

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUserFromToken(token: string): SessionUser | null {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as {
      sub?: number;
      email?: string;
    };

    if (typeof decoded.sub !== "number" || typeof decoded.email !== "string") {
      return null;
    }

    return {
      id: decoded.sub,
      email: decoded.email,
    };
  } catch {
    return null;
  }
}
