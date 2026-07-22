// When running on the website, a relative path works fine because the
// frontend and the Express backend are served from the same origin.
//
// When the app is packaged into an Android APK (via Capacitor), there is no
// local backend inside the app — so relative "/api/..." calls have nothing
// to reach. VITE_API_BASE_URL lets the build point those calls at the
// live, hosted website instead, so the AI and Khatma-sync features keep
// working inside the APK whenever the device has an internet connection.
//
// Set VITE_API_BASE_URL to the full URL of the deployed website
// (e.g. https://kun-mohammadan.example.com) — with NO trailing slash —
// as a build-time environment variable. Leave it empty for normal website
// builds.
// Live backend for the AI (Gemini) and Khatma-sync features. This is the
// Cloud Run deployment where the actual server (server.ts) runs with the
// Gemini API key configured. If it ever changes, update this URL or set
// VITE_API_BASE_URL at build time to override it.
const LIVE_BACKEND_URL = 'https://service-700838468324.europe-west2.run.app';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || LIVE_BACKEND_URL).replace(/\/$/, '');

export function apiUrl(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`;
  return `${API_BASE}${path}`;
}
