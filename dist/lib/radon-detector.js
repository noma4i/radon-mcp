import { execSync } from 'child_process';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const RADON_CACHE_PATH = join(homedir(), 'Library/Caches/com.swmansion.radon-ide/Devices');

export function detectRadonDevice() {
  try {
    const psOutput = execSync('ps aux', { encoding: 'utf-8' });

    // Find simulator-server-macos process
    const serverMatch = psOutput.match(/simulator-server-macos.*--id\s+([A-F0-9-]+).*--device-set\s+(\S+)/i);

    if (serverMatch) {
      return {
        deviceId: serverMatch[1],
        deviceSet: serverMatch[2],
        platform: 'iOS',
      };
    }

    // Fallback: scan device directories
    const iosDeviceSet = join(RADON_CACHE_PATH, 'iOS');
    if (existsSync(iosDeviceSet)) {
      const devices = readdirSync(iosDeviceSet).filter(d =>
        /^[A-F0-9-]{36}$/i.test(d)
      );
      if (devices.length > 0) {
        return {
          deviceId: devices[0],
          deviceSet: iosDeviceSet,
          platform: 'iOS',
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function detectMetroPort() {
  try {
    const psOutput = execSync('ps aux', { encoding: 'utf-8' });

    // Find Metro bundler process
    const metroMatch = psOutput.match(/react-native.*start.*--port\s+(\d+)/);
    if (metroMatch) {
      return parseInt(metroMatch[1], 10);
    }

    // Check common ports
    for (const port of [8081, 50377]) {
      try {
        execSync(`curl -s --connect-timeout 1 http://localhost:${port}/status`, { encoding: 'utf-8' });
        return port;
      } catch {
        // Port not responding
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function getRadonContext() {
  const device = detectRadonDevice();
  const metroPort = detectMetroPort();

  return {
    device,
    metroPort,
    isRunning: device !== null || metroPort !== null,
  };
}
