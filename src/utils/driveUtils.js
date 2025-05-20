/**
 * Google Drive utility functions
 * 
 * These functions help extract file IDs from Google Drive links and generate playable URLs
 * using proxy services that maintain original quality
 */

/**
 * Extract the file ID from a Google Drive link
 * Supports various Google Drive link formats
 * 
 * @param {string} driveLink - The Google Drive link
 * @returns {string|null} - The file ID or null if not valid
 */
export const extractDriveFileId = (driveLink) => {
  if (!driveLink) return null;
  
  // Handle different Google Drive URL formats
  
  // Format: https://drive.google.com/file/d/{fileId}/view
  const fileRegex = /drive\.google\.com\/file\/d\/([^/]+)/;
  
  // Format: https://drive.google.com/open?id={fileId}
  const openRegex = /drive\.google\.com\/open\?id=([^&]+)/;
  
  // Format: https://docs.google.com/document/d/{fileId}/edit
  const docsRegex = /docs\.google\.com\/.+\/d\/([^/]+)/;
  
  // Format: https://drive.google.com/drive/folders/{fileId}
  const folderRegex = /drive\.google\.com\/drive\/folders\/([^?]+)/;
  
  // Try each regex pattern
  const fileMatch = driveLink.match(fileRegex);
  const openMatch = driveLink.match(openRegex);
  const docsMatch = driveLink.match(docsRegex);
  const folderMatch = driveLink.match(folderRegex);
  
  // Return the first match we find
  if (fileMatch) return fileMatch[1];
  if (openMatch) return openMatch[1];
  if (docsMatch) return docsMatch[1];
  if (folderMatch) return folderMatch[1];
  
  // Check if the input is already a file ID (alphanumeric characters, hyphens, underscores)
  if (/^[a-zA-Z0-9_-]+$/.test(driveLink)) {
    return driveLink;
  }
  
  return null;
};

/**
 * Generate streaming URLs for a Google Drive file using proxy services
 * to maintain original quality
 * 
 * @param {string} fileId - The Google Drive file ID
 * @returns {object} - Multiple URL options with proxied streaming as primary
 */
export const generateDriveProxyUrls = (fileId) => {
  if (!fileId) return { proxyUrl: '', directUrl: '', embedUrl: '' };
  
  return {
    // High-quality proxied stream via gdrive-proxy service (primary method)
    proxyUrl: `https://gdflix.top/video/${fileId}`,
    
    // Alternative proxy service (backup)
    alternateProxyUrl: `https://drive.serverse.workers.dev/file/${fileId}`,
    
    // Direct streaming URL (might encounter Google limitations)
    directUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    
    // Embed URL as fallback (lower quality but reliable)
    embedUrl: `https://drive.google.com/file/d/${fileId}/preview`
  };
};

/**
 * Check if a URL is a Google Drive link
 * 
 * @param {string} url - The URL to check
 * @returns {boolean} - Whether the URL is a Google Drive link
 */
export const isGoogleDriveLink = (url) => {
  if (!url) return false;
  
  return url.includes('drive.google.com') || 
         url.includes('docs.google.com') || 
         extractDriveFileId(url) !== null;
};

/**
 * Convert a Google Drive link to high-quality playable URLs via proxies
 * 
 * @param {string} driveLink - The Google Drive link
 * @returns {object|null} - Object with different proxy URL formats or null if invalid
 */
export const convertDriveLink = (driveLink) => {
  const fileId = extractDriveFileId(driveLink);
  if (!fileId) return null;
  
  return generateDriveProxyUrls(fileId);
}; 