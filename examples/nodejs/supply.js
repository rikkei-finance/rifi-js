/**
 * Example of supplying ETH to the Rifi protocol with Rifi.js
 *
 * Run ganache-cli in another command line window before running this script. Be
 *     sure to fork mainnet.

ganache-cli \
  -f https://mainnet.infura.io/v3/_YOUR_INFURA_ID_ \
  -m "clutch captain shoe salt awake harvest setup primary inmate ugly among become" \
  -i 1

 */

const Rifi = require('../../dist/nodejs/index.js');
// const privateKey = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';
const privateKey = '0x89ddbfcb1d576e227897af535a7148bf5e989aa7ecf08827244c29d4b07d64cb';

const rifi = new Rifi('http://localhost:8545/', { privateKey });

// Ethers.js overrides are an optional 3rd parameter for `supply`
const trxOptions = { gasLimit: 250000, mantissa: false };

(async function() {

  console.log('Supplying ETH to the Rifi protocol...');
  const trx = await rifi.supply(Rifi.BNB, 1);
  console.log('Ethers.js transaction object', trx);

})().catch(console.error);
