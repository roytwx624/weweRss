// Vercel entry point for WeWe RSS

process.env.NODE_ENV = 'production';
process.env.AUTH_CODE = 'daduhuizhan';

const { createServer } = require('http');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

module.exports = createServer(async (req, res) => {
  const url = req.url || '';
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const __dirname = process.cwd();
  const clientDir = join(__dirname, 'apps', 'server', 'client');
  const assetsDir = join(clientDir, 'assets');

  // Serve static assets
  if (url.startsWith('/dash/assets/')) {
    const fileName = url.replace('/dash/assets/', '');
    const filePath = join(assetsDir, fileName);
    
    if (existsSync(filePath)) {
      const data = readFileSync(filePath);
      const contentType = filePath.endsWith('.css') ? 'text/css' : 
                         filePath.endsWith('.js') ? 'application/javascript' : 
                         'text/plain';
      res.setHeader('Content-Type', contentType);
      res.statusCode = 200;
      res.end(data);
      return;
    }
  }

  // Serve dashboard
  if (url === '/dash' || url.startsWith('/dash/')) {
    const indexPath = join(clientDir, 'index.hbs');
    
    if (existsSync(indexPath)) {
      let html = readFileSync(indexPath, 'utf8');
      
      // Replace template variables
      const serverUrl = process.env.SERVER_ORIGIN_URL || 'https://wewe-rss-livid.vercel.app';
      html = html.replace(/\{\{ iconUrl \}\}/g, `${serverUrl}/favicon.ico`)
                 .replace(/\{\{ weweRssServerOriginUrl \}\}/g, serverUrl)
                 .replace(/\{\{ enabledAuthCode \}\}/g, 'true');
      
      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200;
      res.end(html);
      return;
    }
  }

  // Redirect root to dashboard
  if (url === '/' || url === '/index.html') {
    res.statusCode = 302;
    res.setHeader('Location', '/dash');
    res.end();
    return;
  }

  // Favicon
  if (url === '/favicon.ico') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/x-icon');
    res.end(Buffer.from('AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAA/4QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA', 'base64'));
    return;
  }

  // 404
  res.statusCode = 404;
  res.end('Not found');
});
