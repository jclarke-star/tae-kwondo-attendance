import { ApiResponse } from "../../shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  // Check if we are in instructor mode and verified
  const skin = localStorage.getItem('tkd_attendance_skin');
  const verified = localStorage.getItem('tkd_instructor_verified') === 'true';
  if (skin === 'instructor' && verified) {
    // Hardcoded for Phase 10 as requested
    headers.set('X-Instructor-Pin', '1234');
  }
  const res = await fetch(path, { ...init, headers })
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error || 'Request failed')
  }
  return json.data
}