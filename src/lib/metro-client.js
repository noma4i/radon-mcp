import { request } from 'http';

export function getMetroStatus(port) {
  return new Promise((resolve) => {
    const req = request(
      { hostname: 'localhost', port, path: '/status', method: 'GET', timeout: 3000 },
      (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          resolve({
            running: res.statusCode === 200,
            status: data.trim(),
            port,
          });
        });
      }
    );

    req.on('error', () => {
      resolve({ running: false, port });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ running: false, port });
    });

    req.end();
  });
}

export function reloadMetro(port) {
  return new Promise((resolve) => {
    const postData = '';
    const req = request(
      {
        hostname: 'localhost',
        port,
        path: '/reload',
        method: 'POST',
        timeout: 5000,
        headers: { 'Content-Length': 0 },
      },
      (res) => {
        resolve({ success: res.statusCode === 200, statusCode: res.statusCode });
      }
    );

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });

    req.write(postData);
    req.end();
  });
}

export function getMetroLogs(port, options = {}) {
  const { timeout = 5000 } = options;

  return new Promise((resolve) => {
    const req = request(
      { hostname: 'localhost', port, path: '/logs/', method: 'GET', timeout },
      (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          resolve({ success: true, logs: data });
        });
      }
    );

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });

    req.end();
  });
}
