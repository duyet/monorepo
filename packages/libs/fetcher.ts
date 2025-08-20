export const fetcher = async (url: string, options = {}) => {
  const res = await fetch(url, options);

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}: An error occurred while fetching the data from ${url}`);
    
    // Attach extra info to the error object for better debugging
    try {
      const errorData = await res.json();
      (error as any).info = errorData;
    } catch (jsonError) {
      // If response body is not JSON, store the text
      try {
        const errorText = await res.text();
        (error as any).info = { message: errorText };
      } catch (textError) {
        (error as any).info = { message: 'Unable to parse error response' };
      }
    }
    
    (error as any).status = res.status;
    (error as any).statusText = res.statusText;
    (error as any).url = url;

    throw error;
  }

  return res.json();
};

export default fetcher;
