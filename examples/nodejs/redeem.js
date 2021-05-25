/**
 * Example of redeeming ETH from the Rifi protocol with Rifi.js
 *
 * Run ganache-cli in another command line window before running this script. Be
 *     sure to fork mainnet.

ganache-cli \
  -f https://mainnet.infura.io/v3/_YOUR_INFURA_ID_ \
  -m "clutch captain shoe salt awake harvest setup primary inmate ugly among become" \
  -i 1

 */

const Rifi = require('../../dist/nodejs/index.js');
const privateKey = '0xacbafc9fbca0575b001c3c57d8967fd2d95ae360c3214091e33dbee9a5e3aa2e';

const rifi = new Rifi('https://data-seed-prebsc-1-s2.binance.org:8545/', { privateKey });

// Ethers.js overrides are an optional 3rd parameter for `supply` or `redeem`
const trxOptions = { gasLimit: 250000, mantissa: false };

(async function() {

  // console.log('Supplying ETH to the Rifi protocol...');
  // const trx1 = await rifi.supply(Rifi.ETH, 1);
  // console.log('Supply transaction: ', trx1);

  console.log('Redeeming ETH...');
  const trx2 = await rifi.redeem(Rifi.ETH, 10); // also accepts rToken args
  console.log('Redeem transaction: ', trx2);

})().catch(console.error);
