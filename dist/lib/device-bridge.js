import { execSync, spawn } from 'child_process';
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
