import fs from 'fs';
import https from 'https';

const TOKEN = process.env.FIGMA_TOKEN;
const OUTPUT_DIR = 'figma';

const FILES = [
  { name: 'primitive', key: 'nFZZKbwZjwWtGhcto3Bew4' },
  { name: 'semantic', key: 'X9TzGj6LUcQo65RXeV6GHL' },
  { name: 'components', key: 'qq5tbwPSIdxBWwjmZz9dTD' }
];

const fetchVariables = (fileKey) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.figma.com',
      path: `/v1/files/${fileKey}/variables/local`,
      method: 'GET',
      headers: {
        'X-Figma-Token': TOKEN
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

const run = async () => {
  console.log('🔄 Starting Token Sync...');
  
  try {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (const file of FILES) {
      console.log(`📥 Fetching ${file.name} tokens (ID: ${file.key})...`);
      const data = await fetchVariables(file.key);
      
      const fileName = `tokens.${file.name}.json`;
      const filePath = `${OUTPUT_DIR}/${fileName}`;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Saved ${filePath}`);
    }
    
    console.log('✨ All tokens fetched successfully.');
    
  } catch (error) {
    console.error('❌ Error fetching tokens:', error.message);
  }
};

run();
