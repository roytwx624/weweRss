// Vercel entry point - Simple server with basic HTML

process.env.NODE_ENV = 'production';
process.env.AUTH_CODE = 'daduhuizhan';
const DEFAULT_SERVER_URL = 'https://wewe-rss-livid.vercel.app';
process.env.SERVER_ORIGIN_URL = process.env.SERVER_ORIGIN_URL || DEFAULT_SERVER_URL;

const http = require('http');
const path = require('path');
const port = process.env.PORT || 3000;

console.log('=== Vercel Server ===');
console.log('SERVER_ORIGIN_URL:', process.env.SERVER_ORIGIN_URL);

const BASIC_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WeWe RSS</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 500px;
    }
    h1 { color: #667eea; margin-bottom: 20px; font-size: 2.5rem; }
    p { color: #666; margin-bottom: 30px; font-size: 1.1rem; line-height: 1.6; }
    .info { 
      background: #f5f5f5; 
      padding: 20px; 
      border-radius: 10px; 
      text-align: left;
      margin-bottom: 20px;
    }
    .info p { margin-bottom: 10px; font-size: 0.95rem; }
    .label { font-weight: 600; color: #333; }
    .btn {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 15px 40px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
    }
    .status { 
      margin-top: 20px; 
      color: #999; 
      font-size: 0.9rem; 
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📰 WeWe RSS</h1>
    <p>更好的公众号订阅方式</p>
    <div class="info">
      <p><span class="label">状态:</span> Vercel 部署成功</p>
      <p><span class="label">AUTH_CODE:</span> ${process.env.AUTH_CODE || '未设置'}</p>
      <p><span class="label">环境:</span> ${process.env.NODE_ENV || 'development'}</p>
    </div>
    <a href="/dash" class="btn">进入控制台</a>
    <p class="status">Powered by WeWe RSS</p>
  </div>
</body>
</html>`;

function createTrpcResponse() {
  return JSON.stringify({
    id: Math.random().toString(36).substr(2, 9),
    result: {
      data: {
        json: null
      }
    }
  });
}

const server = http.createServer((req, res) => {
  console.log('Request:', req.method, req.url);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = 204;
    res.end();
    return;
  }

  // Handle tRPC requests
  if (req.url.includes('/trpc')) {
    console.log('Handling tRPC');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(createTrpcResponse());
    return;
  }

  // Handle dashboard - serve basic HTML
  if (req.url === '/dash' || req.url.startsWith('/dash')) {
    console.log('Serving dashboard');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(BASIC_HTML);
    return;
  }

  // Redirect root to dashboard
  if (req.url === '/' || req.url === '/index.html') {
    res.statusCode = 302;
    res.setHeader('Location', '/dash');
    res.end();
    return;
  }

  // Favicon
  if (req.url === '/favicon.ico') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/x-icon');
    res.end(Buffer.from('AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAA/4QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA', 'base64'));
    return;
  }

  res.statusCode = 404;
  res.end('Not found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
