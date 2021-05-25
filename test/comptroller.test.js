const assert = require('assert');
const ethers = require('ethers');
const cointroller = require('../src/cointroller.ts');
const Rifi = require('../src/index.ts');
const providerUrl = 'http://localhost:8545';

module.exports = function suite([ publicKeys, privateKeys ]) {

  const acc1 = { address: publicKeys[0], privateKey: privateKeys[0] };

  const rifi = new Rifi(providerUrl, {
    privateKey: acc1.privateKey
  });

  it('runs cointroller.enterMarkets single asset', async function () {
    const trx = await rifi.enterMarkets(Rifi.ETH);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const event = receipt.events[0].event;

    const numEventsExpected = 1;
    const eventExpected = 'MarketEntered';

    assert.equal(numEvents, numEventsExpected);
    assert.equal(event, eventExpected);
  });

  it('runs cointroller.enterMarkets multiple assets', async function () {
    const trx = await rifi.enterMarkets(
      [ Rifi.DAI, Rifi.USDC, Rifi.UNI ]
    );
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const event = receipt.events[0].event;

    const numEventsExpected = 3;
    const eventExpected = 'MarketEntered';

    assert.equal(numEvents, numEventsExpected);
    assert.equal(event, eventExpected);
  });

  it('fails cointroller.enterMarkets rToken string', async function () {
    const errorMessage = 'Rifi [enterMarkets] | Argument `markets` must be an array or string.';
    try {
      const trx = await rifi.enterMarkets(null);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails cointroller.enterMarkets invalid rToken', async function () {
    const errorMessage = 'Rifi [enterMarkets] | Provided market `cbadrtokenname` is not a recognized rToken.';
    try {
      const trx = await rifi.enterMarkets(['USDC', 'badrtokenname']);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs cointroller.exitMarket', async function () {
    const enterMarketsTrx = await rifi.enterMarkets(Rifi.ETH);
    await enterMarketsTrx.wait(1);

    const trx = await rifi.exitMarket(Rifi.ETH);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const event = receipt.events[0].event;

    const numEventsExpected = 1;
    const eventExpected = 'MarketExited';

    assert.equal(numEvents, numEventsExpected);
    assert.equal(event, eventExpected);
  });

  it('fails cointroller.exitMarket rToken string', async function () {
    const errorMessage = 'Rifi [exitMarket] | Argument `market` must be a string of a rToken market name.';
    try {
      const trx = await rifi.exitMarket(null);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails cointroller.exitMarket invalid rToken', async function () {
    const errorMessage = 'Rifi [exitMarket] | Provided market `cbadrtokenname` is not a recognized rToken.';
    try {
      const trx = await rifi.exitMarket('badrtokenname');
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

}
