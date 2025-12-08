const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/test',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log('BODY:', data); process.exit(0); });
});

req.on('error', (error) => {
  console.error('ERROR:', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('TIMEOUT');
  req.destroy();
  process.exit(1);
});

req.end();
