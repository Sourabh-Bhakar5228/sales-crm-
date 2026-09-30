const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
  body?: BodyInit | null;
}

export const api = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};
