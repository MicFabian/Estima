export function parseToken(token: any): any {
  if (!token || typeof token !== 'string') {
    return {}; // Return an empty object for invalid input
  }

  try {
    const payload = token.split('.')[1]; // Extract the payload part of the JWT
    if (!payload) {
      return {}; // Return an empty object if payload is missing
    }
    const decoded = atob(payload); // Decode base64 payload
    return JSON.parse(decoded); // Parse JSON and return
  } catch (error) {
    console.error('Failed to parse token:', error);
    return {}; // Return an empty object on any parsing error
  }
}

export function isTokenValid(token: string): boolean {
  const payload = parseToken(token);
  if (!payload || !payload.exp) {
    return false; // Invalid token
  }

  const currentTime = Math.floor(new Date().getTime() / 1000); // Current time in seconds
  return payload.exp > currentTime; // Token is valid if expiration time is in the future
}
