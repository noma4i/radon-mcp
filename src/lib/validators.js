const UUID_REGEX = /^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/i;
const PATH_REGEX = /^[a-zA-Z0-9/_.\-~]+$/;
const MAX_REGEX_LENGTH = 100;
const MAX_README_LIMIT = 50000;

export function validateDeviceId(id) {
  if (!id || typeof id !== 'string') return { valid: false, error: 'Device ID required' };
  if (!UUID_REGEX.test(id)) return { valid: false, error: 'Invalid device ID format' };
  return { valid: true };
}

export function validatePath(path) {
  if (!path || typeof path !== 'string') return { valid: false, error: 'Path required' };
  if (!PATH_REGEX.test(path)) return { valid: false, error: 'Invalid path characters' };
  if (path.includes('..')) return { valid: false, error: 'Path traversal not allowed' };
  return { valid: true };
}

export function validateRegex(pattern) {
  if (!pattern) return { valid: true, regex: null };
  if (typeof pattern !== 'string') return { valid: false, error: 'Pattern must be a string' };
  if (pattern.length > MAX_REGEX_LENGTH) {
    return { valid: false, error: `Regex too long (max ${MAX_REGEX_LENGTH})` };
  }
  try {
    const regex = new RegExp(pattern, 'i');
    return { valid: true, regex };
  } catch (e) {
    return { valid: false, error: `Invalid regex: ${e.message}` };
  }
}

export function validateReadmeLimit(limit) {
  if (limit === undefined) return 5000;
  const n = Number(limit);
  if (isNaN(n) || n < 0) return 5000;
  return Math.min(n, MAX_README_LIMIT);
}

export function validateNpmPackageName(name) {
  if (!name || typeof name !== 'string') return { valid: false, error: 'Package name required' };
  if (name.length > 214) return { valid: false, error: 'Package name too long' };
  if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name)) {
    return { valid: false, error: 'Invalid npm package name' };
  }
  return { valid: true };
}
