const assert = require('assert');
const ethers = require('ethers');
const Rifi = require('../src/index.ts');
const { request } = require('../src/util.ts');
const providerUrl = 'http://localhost:8545';

function wait(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

module.exports = function suite([ publicKeys, privateKeys ]) {

  const rifi = new Rifi(providerUrl);

  it('runs priceFeed.getPrice underlying asset to USD', async function () {
    const price = await rifi.getPrice(Rifi.WBTC);

    const isPositiveNumber = price > 0;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
  });

  it('runs priceFeed.getPrice underlying asset to underlying asset', async function () {
    const price = await rifi.getPrice(Rifi.UNI, Rifi.WBTC);

    const isPositiveNumber = price > 0;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);

  });

  it('runs priceFeed.getPrice rToken to underlying asset', async function () {
    const price = await rifi.getPrice(Rifi.rDAI, Rifi.WBTC);

    const isPositiveNumber = price > 0;
    const isLessThanOne = price < 1;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
    assert.equal(isLessThanOne, true);
  });

  it('runs priceFeed.getPrice underlying asset to rToken', async function () {
    const price = await rifi.getPrice(Rifi.UNI, Rifi.rDAI);

    const isPositiveNumber = price > 0;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
  });

  it('runs priceFeed.getPrice rToken to rToken', async function () {
    const price = await rifi.getPrice(Rifi.rDAI, Rifi.rDAI);

    const isPositiveNumber = price > 0;
    const isOne = price === 1;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
    assert.equal(isOne, true);
  });

  it('fails priceFeed.getPrice bad asset', async function () {
    const errorMessage = 'Rifi [getPrice] | Argument `asset` must be a non-empty string.';
    try {
      price = await rifi.getPrice('');
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails priceFeed.getPrice invalid asset', async function () {
    const errorMessage = 'Rifi [getPrice] | Argument `asset` is not supported.';
    try {
      price = await rifi.getPrice('UUU');
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

}
