// Example of fetching a Rifi protocol contract address with Rifi.js
const Rifi = require('../../dist/nodejs/index.js');

const batAddress = Rifi.util.getAddress(Rifi.BAT);
const cbatAddress = Rifi.util.getAddress(Rifi.rBAT);
const cEthAddressRopsten = Rifi.util.getAddress(Rifi.rETH, 'ropsten');

console.log('BAT (mainnet)', batAddress);
console.log('rBAT (mainnet)', cbatAddress);

console.log('rETH (ropsten)', cEthAddressRopsten);
