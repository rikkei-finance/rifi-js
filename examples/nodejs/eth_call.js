// Example of calling JSON RPC's eth_call with Rifi.js
const Rifi = require('../../dist/nodejs/index.js');

const cEthAddress = Rifi.util.getAddress(Rifi.rBNB);

(async function() {

  const srpb = await Rifi.eth.read(
    cEthAddress,
    'function supplyRatePerBlock() returns (uint256)',
    // [], // [optional] parameters
    // {}  // [optional] call options, provider, network, plus ethers "overrides"
  );

  console.log('rETH market supply rate per block:', srpb.toString());

})().catch(console.error);
