// Rifi.js Tests

// To run all tests: `npm test`
// To run a single file's tests: `npm test -- -g './src/eth.ts'`
// To run a single test: `npm test -- -g 'eth.getBalance'`

// Source Files
const api = require('./api.test.js');
const rifi = require('./rifi.test.js');
const cointroller = require('./cointroller.test.js');
const rToken = require('./rToken.test.js');
const EIP712 = require('./EIP712.test.js');
const eth = require('./eth.test.js');
const gov = require('./gov.test.js');
const priceFeed = require('./priceFeed.test.js');
const util = require('./util.test.js');
const initialize = require('./initialize.test.js');

const providerUrl = process.env.MAINNET_PROVIDER_URL;

if (!providerUrl) {
  console.error('Missing JSON RPC provider URL as environment variable `MAINNET_PROVIDER_URL`');
  process.exit(1);
}

// Run a Ganache Core to test against a mainnet fork
const ganache = require('ganache-core');

const server = ganache.server({
  fork: providerUrl,
  network_id: 1,
  default_balance_ether: 10000,
});

server.listen(7545, (err, blockchain) => console.error);

const unlockedAccounts = server.provider.manager.state.unlocked_accounts;
const publicKeys = Object.keys(unlockedAccounts);
const privateKeys = publicKeys.map((k) => {
  return '0x' + unlockedAccounts[k].secretKey.toString('hex');
});
const acc = [ publicKeys, privateKeys ]; // Unlocked accounts with test ETH

// Main test suite
describe('Rifi.js', function () {
  describe('./src/api.ts', api.bind(this, acc));
  describe('./src/rifi.ts', rifi.bind(this, acc));
  describe('./src/cointroller.ts', cointroller.bind(this, acc));
  describe('./src/rToken.ts', rToken.bind(this, acc));
  describe('./src/EIP712.ts', EIP712.bind(this, acc));
  describe('./src/eth.ts', eth.bind(this, acc));
  describe('./src/gov.ts', gov.bind(this, acc));
  describe('./src/priceFeed.ts', priceFeed.bind(this, acc));
  describe('./src/util.ts', util.bind(this, acc));
  describe('initialize', initialize.bind(this, acc));
});

after(function () {
  server.close();
});
