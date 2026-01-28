import { execSync } from 'child_process';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const RADON_CACHE_PATH = join(homedir(), 'Library/Caches/com.swmansion.radon-ide/Devices');
const EXEC_TIMEOUT = 5000;

export function detectRadonDevice() {
  try {
    const psOutput = execSync('ps aux', { encoding: 'utf-8', timeout: EXEC_TIMEOUT });

    const serverMatch = psOutput.match(/simulator-server-macos.*--id\s+([A-F0-9-]+).*--device-set\s+(\S+)/i);

    if (serverMatch) {
      return {
        device: {
          deviceId: serverMatch[1],
          deviceSet: serverMatch[2],
          platform: 'iOS',
        },
        error: null,
      };
    }

    const iosDeviceSet = join(RADON_CACHE_PATH, 'iOS');
    if (existsSync(iosDeviceSet)) {
      const devices = readdirSync(iosDeviceSet).filter(d =>
        /^[A-F0-9-]{36}$/i.test(d)
      );
      if (devices.length > 0) {
        return {
          device: {
            deviceId: devices[0],
            deviceSet: iosDeviceSet,
            platform: 'iOS',
          },
          error: null,
        };
      }
    }

    return { device: null, error: null };
  } catch (error) {
    return { device: null, error: error.message };
  }
}

export function detectMetroPort() {
  try {
    const psOutput = execSync('ps aux', { encoding: 'utf-8', timeout: EXEC_TIMEOUT });

    const metroMatch = psOutput.match(/react-native.*start.*--port\s+(\d+)/);
    if (metroMatch) {
      return { port: parseInt(metroMatch[1], 10), error: null };
    }

    for (const port of [8081, 50377]) {
      try {
        execSync(`curl -s --connect-timeout 1 http://localhost:${port}/status`, {
          encoding: 'utf-8',
          timeout: 3000,
        });
        return { port, error: null };
      } catch {
        // Port not responding
      }
    }

    return { port: null, error: null };
  } catch (error) {
    return { port: null, error: error.message };
  }
}

export function getRadonContext() {
  const deviceResult = detectRadonDevice();
  const metroResult = detectMetroPort();

  return {
    device: deviceResult.device,
    metroPort: metroResult.port,
    isRunning: deviceResult.device !== null || metroResult.port !== null,
    errors: {
      device: deviceResult.error,
      metro: metroResult.error,
    },
  };
}
