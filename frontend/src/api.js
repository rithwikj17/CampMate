// Central API base URL
// In dev: Vite proxy routes /api → http://localhost:5000
// In production (Vercel): VITE_API_URL must be set to the Render backend URL
const API_BASE = import.meta.env.VITE_API_URL || '';

export default API_BASE;
