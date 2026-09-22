// Chapter 4: HTTP — vanilla replacement for axios

export async function get(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
  return res.json();
}

export async function post(url, body, options = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: JSON.stringify(body),
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
  return res.json();
}

export function createClient(baseURL, defaultHeaders = {}) {
  return async function request(path, options = {}) {
    const res = await fetch(`${baseURL}${path}`, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
    });
    if (!res.ok) {
      const error = new Error(`Request failed: ${res.status}`);
      error.status = res.status;
      error.response = res;
      throw error;
    }
    return res.json();
  };
}

export async function fetchWithRetry(url, options = {}, retries = 3, delay = 500) {
  try {
    return await get(url, options);
  } catch (err) {
    if (retries === 0) throw err;
    await new Promise(r => setTimeout(r, delay));
    return fetchWithRetry(url, options, retries - 1, delay * 2);
  }
}
