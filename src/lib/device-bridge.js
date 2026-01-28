import { execSync, spawn } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { readFileSync, unlinkSync } from 'fs';

export async function captureScreenshot(deviceId, deviceSet) {
  const screenshotPath = join(tmpdir(), `radon-screenshot-${Date.now()}.png`);

  try {
    execSync(
      `xcrun simctl --set "${deviceSet}" io "${deviceId}" screenshot "${screenshotPath}"`,
      { encoding: 'utf-8', timeout: 10000 }
    );

    const imageData = readFileSync(screenshotPath);
    const base64 = imageData.toString('base64');

    try {
      unlinkSync(screenshotPath);
    } catch { /* cleanup failed, ignore */ }

    return {
      success: true,
      base64,
      mimeType: 'image/png',
      path: screenshotPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getDeviceLogs(deviceId, deviceSet, options = {}) {
  const { timeout = 5000, filter = '' } = options;

  return new Promise((resolve) => {
    const logs = [];
    const args = [
      'simctl', '--set', deviceSet,
      'spawn', deviceId,
      'log', 'stream',
      '--level', 'debug',
      '--style', 'compact',
    ];

    if (filter) {
      args.push('--predicate', `eventMessage CONTAINS "${filter}"`);
    }

    const proc = spawn('xcrun', args, { encoding: 'utf-8' });

    proc.stdout.on('data', (data) => {
      logs.push(data.toString());
    });

    proc.stderr.on('data', (data) => {
      logs.push(`[stderr] ${data.toString()}`);
    });

    setTimeout(() => {
      proc.kill();
      resolve(logs.join(''));
    }, timeout);
  });
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
