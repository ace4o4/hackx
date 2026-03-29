const https = require('https');

const options = {
  hostname: 'api-sepolia.etherscan.io',
  path: '/api?module=account&action=txlist&address=0x14f711790a0A5C88Ee9fd721e175AEaB050e62cB&startblock=0&endblock=99999999&page=1&offset=10&sort=desc',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.status === "1") {
        const creations = parsed.result.filter(tx => tx.to === "" || tx.contractAddress !== "");
        console.log('Contract Addresses Found:');
        creations.forEach(tx => console.log(tx.contractAddress));
      } else {
        console.log("Etherscan API returned:", parsed.message, parsed.result);
      }
    } catch(e) {
      console.log("Parse Error:", data);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
