import { ApiResponse } from "../../shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const skin = localStorage.getItem('tkd_attendance_skin');
  const userId = localStorage.getItem('tkd_attendance_userid');
  const verifiedHash = localStorage.getItem('tkd_instructor_hash');
  const isVerified = localStorage.getItem('tkd_instructor_verified') === 'true';
  if (skin === 'instructor' && isVerified && userId && verifiedHash) {
    headers.set('X-Instructor-Id', userId);
    headers.set('X-Instructor-Pin', verifiedHash);
  } else if (skin === 'instructor' && !isVerified) {
    // During login or registration, we might not have the hash yet
    // No special headers for unverified sessions except the standard ones
  }
  const res = await fetch(path, { ...init, headers })
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok || !json.success || json.data === undefined) {
    const errorMsg = json.error || 'Request failed';
    // If we get an auth error, clear local storage verification
    if (res.status === 400 && errorMsg.toLowerCase().includes('pin')) {
      localStorage.removeItem('tkd_instructor_verified');
      localStorage.removeItem('tkd_instructor_hash');
    }
    throw new Error(errorMsg)
  }
  return json.data
}