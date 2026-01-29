import { request } from 'http';

export function getMetroStatus(port) {
  return new Promise(resolve => {
    const req = request({ hostname: 'localhost', port, path: '/status', method: 'GET', timeout: 3000 }, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          running: res.statusCode === 200,
          status: data.trim(),
          port
        });
      });
    });

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

function getMetroPages(port) {
  return new Promise(resolve => {
    const req = request({ hostname: 'localhost', port, path: '/json', method: 'GET', timeout: 3000 }, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({ success: true, pages: JSON.parse(data) });
        } catch {
          resolve({ success: false, error: 'Invalid JSON from /json endpoint' });
        }
      });
    });

    req.on('error', error => {
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });

    req.end();
  });
}

function formatConsoleArgs(args) {
  if (!args || !Array.isArray(args)) return '';
  return args
    .map(a => {
      if (a.value !== undefined) return String(a.value);
      if (a.description) return a.description;
      return JSON.stringify(a);
    })
    .join(' ');
}

export function getMetroLogs(port, options = {}) {
  const { collectTimeout = 2000 } = options;

  return new Promise(async resolve => {
    try {
      const pagesResult = await getMetroPages(port);
      if (!pagesResult.success) {
        resolve({ success: false, error: pagesResult.error });
        return;
      }

      const rnPage = pagesResult.pages.find(p => (p.description && p.description.includes('React Native')) || (p.title && p.title.includes('React Native')));

      if (!rnPage || !rnPage.webSocketDebuggerUrl) {
        resolve({ success: false, error: 'No React Native debugger page found' });
        return;
      }

      const ws = new WebSocket(rnPage.webSocketDebuggerUrl);
      const logs = [];
      let settled = false;

      const finish = () => {
        if (settled) return;
        settled = true;
        try {
          ws.close();
        } catch {}
        resolve({ success: true, logs: logs.join('\n') });
      };

      const timer = setTimeout(finish, collectTimeout);

      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      };

      ws.onmessage = event => {
        try {
          const msg = JSON.parse(typeof event.data === 'string' ? event.data : event.data.toString());

          if (msg.method === 'Runtime.consoleAPICalled') {
            const { type, args } = msg.params;
            const text = formatConsoleArgs(args);
            if (text.includes('__RNIDE_INTERNAL')) return;
            logs.push(`[${type}] ${text}`);
          }
        } catch {}
      };

      ws.onerror = error => {
        clearTimeout(timer);
        if (!settled) {
          settled = true;
          resolve({ success: false, error: error.message || 'WebSocket error' });
        }
      };

      ws.onclose = () => {
        clearTimeout(timer);
        finish();
      };
    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
}
