// Vercel entry point - Simple server with frontend support

process.env.NODE_ENV = 'production';
process.env.AUTH_CODE = 'daduhuizhan';
const DEFAULT_SERVER_URL = 'https://wewe-rss-livid.vercel.app';
process.env.SERVER_ORIGIN_URL = process.env.SERVER_ORIGIN_URL || DEFAULT_SERVER_URL;

const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;

console.log('=== Vercel Server ===');
console.log('SERVER_ORIGIN_URL:', process.env.SERVER_ORIGIN_URL);

const clientDir = path.join(__dirname, 'apps', 'server', 'client');
const assetsDir = path.join(clientDir, 'assets');
const indexPath = path.join(clientDir, 'index.hbs');

console.log('clientDir:', clientDir);
console.log('assetsDir:', assetsDir);
console.log('indexPath:', indexPath);

function createTrpcResponse() {
  return JSON.stringify({
    id: Math.random().toString(36).substr(2, 9),
    result: {
      data: {
        json: {
          items: [],
          nextId: null
        }
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

  // Handle static assets
  if (req.url.startsWith('/dash/assets/')) {
    const fileName = req.url.replace('/dash/assets/', '');
    const filePath = path.join(assetsDir, fileName);
    
    console.log('Looking for asset:', filePath);
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
      res.statusCode = 200;
      res.end(data);
      return;
    } else {
      console.log('Asset not found:', filePath);
    }
  }

  // Handle dashboard
  if (req.url === '/dash' || req.url.startsWith('/dash')) {
    console.log('Looking for index:', indexPath);
    console.log('Exists:', fs.existsSync(indexPath));
    
    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, 'utf8');
      
      html = html
        .replace('{{ weweRssServerOriginUrl }}', process.env.SERVER_ORIGIN_URL)
        .replace('{{ enabledAuthCode }}', 'true')
        .replace('{{ iconUrl }}', `${process.env.SERVER_ORIGIN_URL}/favicon.ico`);
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(html);
      return;
    }
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
