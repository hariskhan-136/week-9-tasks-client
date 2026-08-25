import { api } from "@/lib/api";
import { setToken, clearToken } from "@/lib/session";
import { lastRequest, mockFetchOnce } from "./helpers/mockFetch";

describe("api Authorization header", () => {
  it("attaches Authorization header when a session exists", async () => {
    setToken("test-token");

    mockFetchOnce(200, { success: true });

    await api<{ success: boolean }>("/tasks");

    const { init } = lastRequest();
    const headers = new Headers(init.headers);

    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("does not attach Authorization header when signed out", async () => {
    clearToken();

    mockFetchOnce(200, { success: true });

    await api<{ success: boolean }>("/tasks");

    const { init } = lastRequest();
    const headers = new Headers(init.headers);

    expect(headers.get("Authorization")).toBeNull();
  });
});
