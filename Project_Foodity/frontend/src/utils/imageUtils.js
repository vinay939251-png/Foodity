/**
 * Optimizes a Cloudinary image URL by appending transformation parameters.
 * Defaults to 400px width, auto quality, auto format (WebP/AVIF).
 */
export const getOptimizedImage = (url, width = 400, height = null) => {
  if (!url) return '';
  
  // Only optimize Cloudinary URLs
  if (typeof url === 'string' && url.includes('res.cloudinary.com')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      let transforms = `c_fill,w_${width},q_auto,f_auto`;
      if (height) transforms += `,h_${height}`;
      return `${parts[0]}/upload/${transforms}/${parts[1]}`;
    }
  }
  
  // Proxified media thumbnailer (handles local and remote)
  if (url.startsWith('http') && !url.includes('res.cloudinary.com')) {
     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
     const urlPath = url.includes('/media/') ? url.substring(url.indexOf('/media/')) : url;
     return `${API_BASE}/thumbnail/?path=${encodeURIComponent(urlPath)}&w=${width}`;
  }
  
  // Local media thumbnailer
  if (typeof url === 'string' && url.startsWith('/media/')) {
     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
     return `${API_BASE}/thumbnail/?path=${encodeURIComponent(url)}&w=${width}`;
  }
  
  return url;
};
