// Avtomatik environment aniqlash: Local kompyuterda localhost:3001 ga, Vercelda esa Railway'ga ulanadi
const isProdUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE_URL = isProdUrl ? 'https://asra-production.up.railway.app' : 'http://localhost:3001';

/**
 * Normalizes API URL ensuring it's absolute in production
 * @param {string} path - The API path (e.g. '/api/products')
 * @returns {string} - The absolute URL
 */
export const getApiUrl = (path) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    // If it's already an absolute URL, return as is
    if (cleanPath.startsWith('http')) return cleanPath;
    
    return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Normalizes image URL, handling relative /uploads/ paths
 * @param {string} path - The image path
 * @returns {string} - The absolute image URL
 */
export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
};

export default {
    getApiUrl,
    getImageUrl,
    baseUrl: API_BASE_URL
};
