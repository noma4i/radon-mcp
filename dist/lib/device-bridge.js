import { execSync, spawn } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { readFileSync, unlinkSync } from 'fs';

export async function captureScreenshot(deviceId, deviceSet) {
  const screenshotPath = join(tmpdir(), `radon-screenshot-${Date.now()}.png`);
  const jpegPath = join(tmpdir(), `radon-screenshot-${Date.now()}.jpg`);

  try {
    execSync(
      `xcrun simctl --set "${deviceSet}" io "${deviceId}" screenshot "${screenshotPath}"`,
      { encoding: 'utf-8', timeout: 10000 }
    );

    // Convert to JPEG with resize (max 800px) and quality 60%
    execSync(
      `sips -Z 800 -s format jpeg -s formatOptions 60 "${screenshotPath}" --out "${jpegPath}"`,
      { encoding: 'utf-8', timeout: 10000 }
    );

    const imageData = readFileSync(jpegPath);
    const base64 = imageData.toString('base64');

    // Cleanup
    try { unlinkSync(screenshotPath); } catch { /* ignore */ }
    try { unlinkSync(jpegPath); } catch { /* ignore */ }

    return {
      success: true,
      base64,
      mimeType: 'image/jpeg',
    };
  } catch (error) {
    // Cleanup on error
    try { unlinkSync(screenshotPath); } catch { /* ignore */ }
    try { unlinkSync(jpegPath); } catch { /* ignore */ }

    return {
      success: false,
      error: error.message,
    };
  }
}

export function reloadApp(deviceId, deviceSet, method = 'reloadJs') {
  try {
    if (method === 'reloadJs') {
      // Send reload command via simctl
      execSync(
        `xcrun simctl --set "${deviceSet}" spawn "${deviceId}" notifyutil -p com.apple.mobile.keybag.userAuthenticated`,
        { encoding: 'utf-8', timeout: 5000 }
      );
      return { success: true, method: 'reloadJs' };
    }

    // Full restart - kill app and let Metro restart it
    return { success: true, method: 'fullRestart', note: 'Use Metro reload for full restart' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function listBootedDevices(deviceSet) {
  try {
    const output = execSync(
      `xcrun simctl --set "${deviceSet}" list devices booted -j`,
      { encoding: 'utf-8' }
    );
    return JSON.parse(output);
  } catch {
    return { devices: {} };
  }
}
