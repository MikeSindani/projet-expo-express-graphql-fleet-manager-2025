import { GRAPHQL_URL } from "@/config/graphql-url";

/**
 * Normalizes a legacy path to the current format.
 * Handles old paths like:
 *  - /media/image/vehicle/... → /media/vehicule/...
 *  - /media/image/vehicule/... → /media/vehicule/...
 *  - /media/image/rapport/... → /media/rapport/...
 *  - /media/image/profil/... → /media/profil/...
 *  - /media/image/chauffeur/... → /media/chauffeur/...
 *  - /media/image/permis/... → /media/permis/...
 */
function normalizePath(path: string): string {
  // Remove /media/image/ prefix (legacy format)
  let normalized = path.replace(/^\/media\/image\//, '/media/');
  // Convert English 'vehicle' folder to French 'vehicule'
  normalized = normalized.replace(/^\/media\/vehicle\//, '/media/vehicule/');
  // Handle non-standard uploads folder
  normalized = normalized.replace(/^\/media\/uploads\//, '/media/');
  return normalized;
}

/**
 * Normalizes an image path to a full URL if needed.
 * If the path starts with /media, it prepends the base server URL.
 * If it's already a full URL or Base64, it returns it as is.
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  
  if (path.startsWith("data:") || path.startsWith("http") || path.startsWith("file://")) {
    return path;
  }
  
  if (path.startsWith("/media")) {
    const baseUrl = GRAPHQL_URL.replace("/graphql", "");
    const normalizedPath = normalizePath(path);
    return `${baseUrl}${normalizedPath}`;
  }
  
  return path;
}
