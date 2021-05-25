const assert = require('assert');
const Rifi = require('../src/index.ts');

// Mocked browser `window.ethereum` as unlocked account '0xa0df35...'
const window = { ethereum: require('./window.ethereum.json') };

const providerUrl = 'http://localhost:8545';
const unlockedPrivateKey = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';
const unlockedMnemonic = 'clutch captain shoe salt awake harvest setup primary inmate ugly among become';

module.exports = function suite() {

  it('initializes rifi with ethers default provider', async function () {
    const rifi = new Rifi();

    const expectedType = 'object';

    assert.equal(typeof rifi, expectedType);
  });

  it('initializes rifi with JSON RPC URL', async function () {
    const rifi = new Rifi(providerUrl);

    const expectedType = 'object';

    assert.equal(typeof rifi, expectedType);
  });

  it('initializes rifi with mnemonic', async function () {
    const rifi = new Rifi(providerUrl, {
      mnemonic: unlockedMnemonic
    });

    const expectedType = 'object';

    assert.equal(typeof rifi, expectedType);
  });

  it('initializes rifi with private key', async function () {
    const rifi = new Rifi(providerUrl, {
      privateKey: unlockedPrivateKey
    });

    const expectedType = 'object';

    assert.equal(typeof rifi, expectedType);
  });

  it('initializes rifi as web3', async function () {
    window.ethereum.send = function (request, callback) {}
    const rifi = new Rifi(window.ethereum);

    const expectedType = 'object';

    assert.equal(typeof rifi, expectedType);
  });

}