import { getAuth } from 'firebase/auth';
import app from './firebaseConfig';

const API_BASE = 'https://metron-api.duckdns.org';

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const user = getAuth(app).currentUser;
    if (!user) throw new Error('Please sign in first');

    const token = await user.getIdToken();
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return fetch(`${API_BASE}${path}`, { ...options, headers });
}
