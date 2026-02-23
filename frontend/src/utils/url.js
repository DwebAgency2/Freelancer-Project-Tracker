export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // Already a full URL (Cloudinary)

    // Fallback for local dev or legacy paths
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};
