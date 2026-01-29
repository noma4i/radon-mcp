import { execSync } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { readFileSync, unlinkSync } from 'fs';
import { validateDeviceId, validatePath } from './validators.js';

export async function captureScreenshot(deviceId, deviceSet) {
  const idCheck = validateDeviceId(deviceId);
  if (!idCheck.valid) return { success: false, error: idCheck.error };

  const pathCheck = validatePath(deviceSet);
  if (!pathCheck.valid) return { success: false, error: pathCheck.error };

  const screenshotPath = join(tmpdir(), `radon-screenshot-${Date.now()}.png`);
  const jpegPath = join(tmpdir(), `radon-screenshot-${Date.now()}.jpg`);

  try {
    execSync(
      `xcrun simctl --set "${deviceSet}" io "${deviceId}" screenshot "${screenshotPath}"`,
      { encoding: 'utf-8', timeout: 10000 }
    );

    execSync(
      `sips -Z 800 -s format jpeg -s formatOptions 60 "${screenshotPath}" --out "${jpegPath}"`,
      { encoding: 'utf-8', timeout: 10000 }
    );

    const imageData = readFileSync(jpegPath);
    const base64 = imageData.toString('base64');

    return {
      success: true,
      base64,
      mimeType: 'image/jpeg',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  } finally {
    try { unlinkSync(screenshotPath); } catch { /* ignore */ }
    try { unlinkSync(jpegPath); } catch { /* ignore */ }
  }
}

export function reloadApp(deviceId, deviceSet, method = 'reloadJs') {
  const idCheck = validateDeviceId(deviceId);
  if (!idCheck.valid) return { success: false, error: idCheck.error };

  const pathCheck = validatePath(deviceSet);
  if (!pathCheck.valid) return { success: false, error: pathCheck.error };

  try {
    if (method === 'reloadJs') {
      execSync(
        `xcrun simctl --set "${deviceSet}" spawn "${deviceId}" notifyutil -p com.apple.mobile.keybag.userAuthenticated`,
        { encoding: 'utf-8', timeout: 5000 }
      );
      return { success: true, method: 'reloadJs' };
    }

    return { success: true, method: 'fullRestart', note: 'Use Metro reload for full restart' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function listBootedDevices(deviceSet) {
  const pathCheck = validatePath(deviceSet);
  if (!pathCheck.valid) return { devices: {}, error: pathCheck.error };

  try {
    const output = execSync(
      `xcrun simctl --set "${deviceSet}" list devices booted -j`,
      { encoding: 'utf-8', timeout: 5000 }
    );
    return JSON.parse(output);
  } catch {
    return { devices: {} };
  }
}

export function openUrl(deviceId, deviceSet, url) {
  const idCheck = validateDeviceId(deviceId);
  if (!idCheck.valid) return { success: false, error: idCheck.error };

  const pathCheck = validatePath(deviceSet);
  if (!pathCheck.valid) return { success: false, error: pathCheck.error };

  if (!url || typeof url !== 'string') {
    return { success: false, error: 'URL is required' };
  }

  try {
    execSync(
      `xcrun simctl --set "${deviceSet}" openurl "${deviceId}" "${url}"`,
      { encoding: 'utf-8', timeout: 10000 }
    );
    return { success: true, url };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function setAppearance(deviceId, deviceSet, mode) {
  const idCheck = validateDeviceId(deviceId);
  if (!idCheck.valid) return { success: false, error: idCheck.error };

  const pathCheck = validatePath(deviceSet);
  if (!pathCheck.valid) return { success: false, error: pathCheck.error };

  if (!['dark', 'light'].includes(mode)) {
    return { success: false, error: 'Mode must be "dark" or "light"' };
  }

  try {
    execSync(
      `xcrun simctl --set "${deviceSet}" ui "${deviceId}" appearance ${mode}`,
      { encoding: 'utf-8', timeout: 5000 }
    );
    return { success: true, mode };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function setStatusBar(deviceId, deviceSet, options = {}) {
  const idCheck = validateDeviceId(deviceId);
  if (!idCheck.valid) return { success: false, error: idCheck.error };

  const pathCheck = validatePath(deviceSet);
  if (!pathCheck.valid) return { success: false, error: pathCheck.error };

  const args = [];
  if (options.time) args.push(`--time "${options.time}"`);
  if (options.batteryLevel !== undefined) args.push(`--batteryLevel ${options.batteryLevel}`);
  if (options.cellularBars !== undefined) args.push(`--cellularBars ${options.cellularBars}`);
  if (options.wifiBars !== undefined) args.push(`--wifiBars ${options.wifiBars}`);

  if (args.length === 0) {
    return { success: false, error: 'At least one status bar option is required' };
  }

  try {
    execSync(
      `xcrun simctl --set "${deviceSet}" status_bar "${deviceId}" override ${args.join(' ')}`,
      { encoding: 'utf-8', timeout: 5000 }
    );
    return { success: true, options };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function clearStatusBar(deviceId, deviceSet) {
  const idCheck = validateDeviceId(deviceId);
  if (!idCheck.valid) return { success: false, error: idCheck.error };

  const pathCheck = validatePath(deviceSet);
  if (!pathCheck.valid) return { success: false, error: pathCheck.error };

  try {
    execSync(
      `xcrun simctl --set "${deviceSet}" status_bar "${deviceId}" clear`,
      { encoding: 'utf-8', timeout: 5000 }
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function setPrivacy(deviceId, deviceSet, action, service, bundleId) {
  const idCheck = validateDeviceId(deviceId);
  if (!idCheck.valid) return { success: false, error: idCheck.error };

  const pathCheck = validatePath(deviceSet);
  if (!pathCheck.valid) return { success: false, error: pathCheck.error };

  if (!['grant', 'revoke', 'reset'].includes(action)) {
    return { success: false, error: 'Action must be "grant", "revoke", or "reset"' };
  }

  const validServices = [
    'all', 'calendar', 'contacts-limited', 'contacts', 'location',
    'location-always', 'photos-add', 'photos', 'media-library',
    'microphone', 'motion', 'reminders', 'siri', 'camera'
  ];

  if (!validServices.includes(service)) {
    return { success: false, error: `Invalid service. Valid: ${validServices.join(', ')}` };
  }

  if (!bundleId || typeof bundleId !== 'string') {
    return { success: false, error: 'Bundle ID is required' };
  }

  try {
    execSync(
      `xcrun simctl --set "${deviceSet}" privacy "${deviceId}" ${action} ${service} ${bundleId}`,
      { encoding: 'utf-8', timeout: 5000 }
    );
    return { success: true, action, service, bundleId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function getDeviceInfo(deviceId, deviceSet) {
  const idCheck = validateDeviceId(deviceId);
  if (!idCheck.valid) return { success: false, error: idCheck.error };

  const pathCheck = validatePath(deviceSet);
  if (!pathCheck.valid) return { success: false, error: pathCheck.error };

  try {
    const output = execSync(
      `xcrun simctl --set "${deviceSet}" list devices -j`,
      { encoding: 'utf-8', timeout: 5000 }
    );
    const data = JSON.parse(output);

    for (const [runtime, devices] of Object.entries(data.devices || {})) {
      const device = devices.find(d => d.udid === deviceId);
      if (device) {
        return {
          success: true,
          device: {
            ...device,
            runtime: runtime.replace('com.apple.CoreSimulator.SimRuntime.', ''),
          },
        };
      }
    }

    return { success: false, error: 'Device not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
