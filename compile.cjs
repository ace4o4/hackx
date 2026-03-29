const fs = require('fs');
const solc = require('solc');

const sourceCode = fs.readFileSync('contracts/AethosProofRegistry.sol', 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'AethosProofRegistry.sol': {
      content: sourceCode
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  output.errors.forEach(err => console.error(err.formattedMessage));
}

const bytecode = output.contracts['AethosProofRegistry.sol']['AethosProofRegistry'].evm.bytecode.object;
console.log('0x' + bytecode);
