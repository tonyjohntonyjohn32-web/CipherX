export type JobStatus = 
  | 'queued'
  | 'preparing'
  | 'loading_model'
  | 'separating'
  | 'finalizing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface SeparationResults {
  vocals_url: string;
  instrumental_url: string;
  vocals_filename: string;
  instrumental_filename: string;
  zip_url: string;
  duration: number;
}

export interface SeparationJob {
  job_id: string;
  filename: string;
  filesize: number;
  duration?: number;
  status: JobStatus;
  stage_message: string;
  progress: number | null;
  created_at: string;
  completed_at?: string;
  error?: string;
  results?: SeparationResults;
}

export interface BackendHealth {
  status: string;
  device: string;
  model_ready: boolean;
  active_jobs: number;
  version: string;
}
