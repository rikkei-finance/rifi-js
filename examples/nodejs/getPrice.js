// Example of fetching prices from the Rifi protocol's open price feed using
// Rifi.js
const Rifi = require('../../dist/nodejs/index.js');
const rifi = new Rifi();

let price;
(async function() {

  price = await rifi.getPrice(Rifi.BAT);
  console.log('BAT in USDC', price);

  price = await rifi.getPrice(Rifi.rBAT);
  console.log('rBAT in USDC', price);

  price = await rifi.getPrice(Rifi.BAT, Rifi.rUSDC);
  console.log('BAT in rUSDC', price);

  price = await rifi.getPrice(Rifi.BAT, Rifi.ETH);
  console.log('BAT in ETH', price);

})().catch(console.error);
