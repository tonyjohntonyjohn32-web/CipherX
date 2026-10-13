import type { BackendHealth, SeparationJob } from '../types';

const API_BASE = '/api';

export const apiService = {
  async getHealth(): Promise<BackendHealth> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) {
      throw new Error(`Health check failed: ${res.statusText}`);
    }
    return res.json();
  },

  async startSeparation(
    file: File, 
    onUploadProgress?: (pct: number) => void
  ): Promise<SeparationJob> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      if (onUploadProgress && xhr.upload) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100);
            onUploadProgress(pct);
          }
        };
      }

      xhr.open('POST', `${API_BASE}/separations`);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch {
            reject(new Error('Invalid JSON response from server'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.detail || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      xhr.send(formData);
    });
  },

  async getJob(jobId: string): Promise<SeparationJob> {
    const res = await fetch(`${API_BASE}/separations/${jobId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Failed to fetch job: ${res.statusText}`);
    }
    return res.json();
  },

  async cancelJob(jobId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/separations/${jobId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Failed to cancel job: ${res.statusText}`);
    }
  },

  getPreviewUrl(jobId: string, stem: 'vocals' | 'instrumental'): string {
    return `${API_BASE}/separations/${jobId}/preview/${stem}`;
  },

  getDownloadUrl(jobId: string, stem: 'vocals' | 'instrumental', format: 'wav' | 'mp3' = 'wav'): string {
    return `${API_BASE}/separations/${jobId}/download/${stem}?format=${format}`;
  },

  getZipUrl(jobId: string): string {
    return `${API_BASE}/separations/${jobId}/download-all`;
  },
};
