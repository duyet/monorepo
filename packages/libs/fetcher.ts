import { NetworkError } from "./errors";

export const fetcher = async (url: string, options = {}) => {
  const res = await fetch(url, options);

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    let info: unknown;

    // Attach extra info to the error object for better debugging
    try {
      info = await res.json();
    } catch (_jsonError) {
      // If response body is not JSON, store the text
      try {
        const errorText = await res.text();
        info = { message: errorText };
      } catch (_textError) {
        info = { message: "Unable to parse error response" };
      }
    }

    throw new NetworkError(
      `HTTP ${res.status}: An error occurred while fetching the data from ${url}`,
      {
        status: res.status,
        statusText: res.statusText,
        url,
        info,
      }
    );
  }

  return res.json();
};

export default fetcher;
