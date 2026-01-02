import { GRAPHQL_URL } from "@/services/api";

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
    return `${baseUrl}${path}`;
  }
  
  return path;
}
