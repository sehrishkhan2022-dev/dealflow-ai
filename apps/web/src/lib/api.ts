export async function api(path: string, options: RequestInit = {}) {
  if (options.method && options.method !== "GET")
    await fetch("/api/v1/csrf", { credentials: "include" });
  const token = document.cookie
    .split("; ")
    .find((v) => v.startsWith("XSRF-TOKEN="))
    ?.split("=")
    .slice(1)
    .join("=");
  const response = await fetch(`/api/v1${path}`, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { "X-XSRF-TOKEN": decodeURIComponent(token) } : {}),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.error?.message ||
        data.message ||
        "Something went wrong. Please try again.",
    );
  return data;
}
export type Workspace = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  region: string;
  is_demo: boolean;
  pivot?: { role: string };
};
export type Identity = {
  user: { name: string; email: string; email_verified_at: string | null };
  workspaces: Workspace[];
};
