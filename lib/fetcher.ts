const fetcher = async (url: string, options = {}) => {
  const res = await fetch(url, options);

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    // error.info = await res.json()
    // error.status = res.status

    throw error;
  }

  return res.json();
};

export default fetcher;
