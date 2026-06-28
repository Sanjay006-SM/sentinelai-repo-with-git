const BASE_URL = 'http://127.0.0.1:8000/api/v1';

class ApiClient {
  async get(endpoint: string) {
    console.log(`[API GET Request]: ${BASE_URL}${endpoint}`);
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log(`[API GET Response Status]: ${res.status} ${res.statusText}`);
      if (!res.ok) throw new Error(`API GET error: ${res.statusText}`);
      const data = await res.json();
      console.log(`[API GET Response Data]:`, data);
      return data;
    } catch (e) {
      console.error(`[API GET Fetch Error]:`, e);
      throw e;
    }
  }

  async post(endpoint: string, body: any, headers: Record<string, string> = {}) {
    console.log(`[API POST Request]: ${BASE_URL}${endpoint}`);
    // If it's FormData, let the browser set the Content-Type automatically
    const isFormData = body instanceof FormData;
    
    const reqHeaders: Record<string, string> = { ...headers };
    if (!isFormData && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: reqHeaders,
        body: isFormData ? body : JSON.stringify(body),
      });
      console.log(`[API POST Response Status]: ${res.status} ${res.statusText}`);
      if (!res.ok) throw new Error(`API POST error: ${res.statusText}`);
      const data = await res.json();
      console.log(`[API POST Response Data]:`, data);
      return data;
    } catch (e) {
      console.error(`[API POST Fetch Error]:`, e);
      throw e;
    }
  }
}

const api = new ApiClient();
export default api;
