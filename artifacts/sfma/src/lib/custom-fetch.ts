export const customFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem("sfma_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};
