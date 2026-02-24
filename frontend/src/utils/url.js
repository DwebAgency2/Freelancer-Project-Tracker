export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // Already a full URL (Cloudinary)

    // In production, use relative paths to leverage the vercel.json proxy
    if (import.meta.env.PROD) {
        return path.startsWith('/') ? path : `/${path}`;
    }

    // Fallback for local dev
    const baseUrl = 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};
