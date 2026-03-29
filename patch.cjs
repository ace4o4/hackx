const fs = require('fs');
const solc = require('solc');

const sourceCode = fs.readFileSync('contracts/AethosProofRegistry.sol', 'utf8');
const input = {
  language: 'Solidity',
  sources: { 'AethosProofRegistry.sol': { content: sourceCode } },
  settings: { outputSelection: { '*': { '*': ['*'] } } }
};
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const bytecode = '0x' + output.contracts['AethosProofRegistry.sol']['AethosProofRegistry'].evm.bytecode.object;

let f = fs.readFileSync('src/lib/blockchain.ts', 'utf8');
f = f.replace(/const BYTECODE = \"0x.*\";/, `const BYTECODE = "${bytecode}";`);
fs.writeFileSync('src/lib/blockchain.ts', f);
console.log('Bytecode patched in blockchain.ts');
