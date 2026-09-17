import { useState, useCallback } from "react";

export const useHttp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (url, method = "GET", body = null, headers = null) => {
      setLoading(true);

      try {
        const finalHeaders = { ...(headers || {}) };
        // Content-Type нужен только для запросов с телом (POST/PUT/...).
        // Для GET без тела не отправляем лишние заголовки, чтобы запрос
        // оставался «простым» (simple) и не требовал CORS preflight.
        if (body && !finalHeaders["Content-Type"]) {
          finalHeaders["Content-Type"] = "application/json";
        }

        const response = await fetch(url, { method, body, headers: finalHeaders });

        if (!response.ok) {
          throw new Error(`Could not fetch ${url}, status: ${response.status}`);
        }

        const data = await response.json();

        setLoading(false);
        return data;
      } catch (e) {
        setLoading(false);
        setError(e.message);
        throw e;
      }
    },
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  return { loading, request, error, clearError };
};
