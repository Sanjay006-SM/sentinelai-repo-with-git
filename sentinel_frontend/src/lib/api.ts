import { useGlobalStore } from './store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  async get(endpoint: string) {
    console.log(`[API GET Request]: ${BASE_URL}${endpoint}`);
    const workspaceId = useGlobalStore.getState().currentWorkspaceId;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    // Add auth token if exists in localStorage
    if (typeof window !== 'undefined') {
      const tokenStr = localStorage.getItem('auth-storage');
      if (tokenStr) {
        try {
          const tokenData = JSON.parse(tokenStr);
          if (tokenData.state && tokenData.state.token) {
            headers['Authorization'] = `Bearer ${tokenData.state.token}`;
          }
        } catch (e) {}
      }
    }
    
    if (workspaceId) {
      headers['X-Workspace-ID'] = workspaceId;
    }

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers,
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

  async post(endpoint: string, body: any, customHeaders: Record<string, string> = {}) {
    console.log(`[API POST Request]: ${BASE_URL}${endpoint}`);
    const isFormData = body instanceof FormData;
    
    const reqHeaders: Record<string, string> = { ...customHeaders };
    if (!isFormData && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }
    
    // Add auth token if exists in localStorage
    if (typeof window !== 'undefined') {
      const tokenStr = localStorage.getItem('auth-storage');
      if (tokenStr) {
        try {
          const tokenData = JSON.parse(tokenStr);
          if (tokenData.state && tokenData.state.token) {
            reqHeaders['Authorization'] = `Bearer ${tokenData.state.token}`;
          }
        } catch (e) {}
      }
    }

    const workspaceId = useGlobalStore.getState().currentWorkspaceId;
    if (workspaceId) {
      reqHeaders['X-Workspace-ID'] = workspaceId;
    }

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: reqHeaders,
        body: isFormData ? body : JSON.stringify(body),
      });
      console.log(`[API POST Response Status]: ${res.status} ${res.statusText}`);
      if (!res.ok) {
        let errorMsg = `API POST error: ${res.statusText}`;
        try {
          const errorData = await res.json();
          if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              errorMsg = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
              errorMsg = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
            } else {
              errorMsg = JSON.stringify(errorData.detail);
            }
          }
          else errorMsg = JSON.stringify(errorData);
        } catch (e) {}
        throw new Error(errorMsg);
      }
      const data = await res.json();
      console.log(`[API POST Response Data]:`, data);
      return data;
    } catch (e) {
      console.error(`[API POST Fetch Error]:`, e);
      throw e;
    }
  }

  async put(endpoint: string, body: any, customHeaders: Record<string, string> = {}) {
    console.log(`[API PUT Request]: ${BASE_URL}${endpoint}`);
    
    const reqHeaders: Record<string, string> = { ...customHeaders };
    if (!reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }
    
    if (typeof window !== 'undefined') {
      const tokenStr = localStorage.getItem('auth-storage');
      if (tokenStr) {
        try {
          const tokenData = JSON.parse(tokenStr);
          if (tokenData.state && tokenData.state.token) {
            reqHeaders['Authorization'] = `Bearer ${tokenData.state.token}`;
          }
        } catch (e) {}
      }
    }

    const workspaceId = useGlobalStore.getState().currentWorkspaceId;
    if (workspaceId) {
      reqHeaders['X-Workspace-ID'] = workspaceId;
    }

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: reqHeaders,
        body: JSON.stringify(body),
      });
      console.log(`[API PUT Response Status]: ${res.status} ${res.statusText}`);
      if (!res.ok) {
        let errorMsg = `API PUT error: ${res.statusText}`;
        try {
          const errorData = await res.json();
          if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              errorMsg = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
              errorMsg = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
            } else {
              errorMsg = JSON.stringify(errorData.detail);
            }
          }
          else errorMsg = JSON.stringify(errorData);
        } catch (e) {}
        throw new Error(errorMsg);
      }
      const data = await res.json();
      console.log(`[API PUT Response Data]:`, data);
      return data;
    } catch (e) {
      console.error(`[API PUT Fetch Error]:`, e);
      throw e;
    }
  }
  async download(endpoint: string, filename: string) {
    console.log(`[API DOWNLOAD Request]: ${BASE_URL}${endpoint}`);
    const workspaceId = useGlobalStore.getState().currentWorkspaceId;
    const headers: Record<string, string> = {};
    
    if (typeof window !== 'undefined') {
      const tokenStr = localStorage.getItem('auth-storage');
      if (tokenStr) {
        try {
          const tokenData = JSON.parse(tokenStr);
          if (tokenData.state && tokenData.state.token) {
            headers['Authorization'] = `Bearer ${tokenData.state.token}`;
          }
        } catch (e) {}
      }
    }
    
    if (workspaceId) {
      headers['X-Workspace-ID'] = workspaceId;
    }

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers,
      });
      console.log(`[API DOWNLOAD Response Status]: ${res.status} ${res.statusText}`);
      if (!res.ok) {
        let errorMsg = `API DOWNLOAD error: ${res.statusText}`;
        try {
          const text = await res.text();
          const errorData = JSON.parse(text);
          if (errorData.detail) {
            errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
          }
        } catch (e) {}
        throw new Error(errorMsg);
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error(`[API DOWNLOAD Fetch Error]:`, e);
      throw e;
    }
  }
}

const api = new ApiClient();
export default api;
