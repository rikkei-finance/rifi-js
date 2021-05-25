const assert = require('assert');
const ethers = require('ethers');
const rToken = require('../src/rToken.ts');
const Rifi = require('../src/index.ts');
const providerUrl = 'http://localhost:8545';

module.exports = function suite([ publicKeys, privateKeys ]) {

  const acc1 = { address: publicKeys[0], privateKey: privateKeys[0] };
  const acc2 = { address: publicKeys[1], privateKey: privateKeys[1] };

  const rifi = new Rifi(providerUrl, {
    privateKey: acc1.privateKey
  });

  const rifi2 = new Rifi(providerUrl, {
    privateKey: acc2.privateKey
  });

  it('runs rToken.supply ETH', async function () {
    const trx = await rifi.supply(Rifi.ETH, 2);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 4;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Mint'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs rToken.supply USDC', async function () {
    const supplyEthTrx = await rifi.supply(Rifi.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await rifi.enterMarkets(Rifi.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await rifi.borrow(Rifi.USDC, 5, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    const supplyUsdcTrx = await rifi.supply(Rifi.USDC, 2);
    const receipt = await supplyUsdcTrx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    let numbTransfers = 0;
    events.forEach(e => { if (e === 'Transfer') numbTransfers++ });

    const numEventsExpected = 5;
    const numbTransfersExpected = 2;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(numbTransfers, numbTransfersExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Mint'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs rToken.supply USDC no approve', async function () {
    const supplyEthTrx = await rifi.supply(Rifi.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await rifi.enterMarkets(Rifi.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await rifi.borrow(Rifi.USDC, 5, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    const supplyUsdcTrx = await rifi.supply(Rifi.USDC, 2, true);
    const receipt = await supplyUsdcTrx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 3;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Failure'), true);
  });

  it('fails rToken.supply asset type', async function () {
    const errorMessage = 'Rifi [supply] | Argument `asset` cannot be supplied.';
    try {
      const trx = await rifi.supply(null, 10); // bad asset type
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails rToken.supply bad amount', async function () {
    const errorMessage = 'Rifi [supply] | Argument `amount` must be a string, number, or BigNumber.';
    try {
      const trx = await rifi.supply('ETH', null); // bad amount
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs rToken.redeem ETH', async function () {
    const supplyEthTrx = await rifi.supply(Rifi.ETH, 1);
    await supplyEthTrx.wait(1);

    const trx = await rifi.redeem(Rifi.ETH, 1);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 4;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Redeem'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs rToken.redeem USDC', async function () {
    const supplyEthTrx = await rifi.supply(Rifi.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await rifi.enterMarkets(Rifi.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await rifi.borrow(Rifi.USDC, 5, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    const supplyUsdcTrx = await rifi.supply(Rifi.USDC, 2);
    await supplyUsdcTrx.wait(1);

    const trx = await rifi.redeem(Rifi.USDC, 2);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    let numbTransfers = 0;
    events.forEach(e => { if (e === 'Transfer') numbTransfers++ });

    const numEventsExpected = 5;
    const numbTransfersExpected = 2;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(numbTransfers, numbTransfersExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Redeem'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs rToken.redeem rUSDC', async function () {
    const supplyEthTrx = await rifi.supply(Rifi.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await rifi.enterMarkets(Rifi.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await rifi.borrow(Rifi.USDC, 5, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    const supplyUsdcTrx = await rifi.supply(Rifi.USDC, 2);
    await supplyUsdcTrx.wait(1);

    const trx = await rifi.redeem(Rifi.rUSDC, 2);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    let numbTransfers = 0;
    events.forEach(e => { if (e === 'Transfer') numbTransfers++ });

    const numEventsExpected = 5;
    const numbTransfersExpected = 2;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(numbTransfers, numbTransfersExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Redeem'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('fails rToken.redeem bad asset', async function () {
    const errorMessage = 'Rifi [redeem] | Argument `asset` must be a non-empty string.';
    try {
      const trx = await rifi.redeem(null, 2); // bad asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails rToken.redeem invalid asset', async function () {
    const errorMessage = 'Rifi [redeem] | Argument `asset` is not supported.';
    try {
      const trx = await rifi.redeem('UUUU', 2); // invalid asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails rToken.redeem invalid rToken', async function () {
    const errorMessage = 'Rifi [redeem] | Argument `asset` is not supported.';
    try {
      const trx = await rifi.redeem('rUUUU', 2); // invalid asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails rToken.redeem bad amount', async function () {
    const errorMessage = 'Rifi [redeem] | Argument `amount` must be a string, number, or BigNumber.';
    try {
      const trx = await rifi.redeem(Rifi.rUSDC, null); // bad amount
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs rToken.borrow USDC', async function () {
    const supplyEthTrx = await rifi.supply(Rifi.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await rifi.enterMarkets(Rifi.ETH);
    await enterEthMarket.wait(1);

    const trx = await rifi.borrow(Rifi.USDC, 5, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 4;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Borrow'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs rToken.borrow ETH', async function () {
    const supplyEthTrx = await rifi.supply(Rifi.ETH, 10);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await rifi.enterMarkets(Rifi.ETH);
    await enterEthMarket.wait(1);

    const trx = await rifi.borrow(Rifi.ETH, 1, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const events = receipt.events.map(e => e.event);

    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Borrow'), true);
  });

  it('fails rToken.borrow invalid asset', async function () {
    const errorMessage = 'Rifi [borrow] | Argument `asset` cannot be borrowed.';
    try {
      const trx = await rifi.borrow('UUUU', 5); // invalid asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails rToken.borrow bad amount', async function () {
    const errorMessage = 'Rifi [borrow] | Argument `amount` must be a string, number, or BigNumber.';
    try {
      const trx = await rifi.borrow(Rifi.USDC, null); // bad amount
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs rToken.repayBorrow USDC', async function () {
    const supplyEthTrx = await rifi.supply(Rifi.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await rifi.enterMarkets(Rifi.ETH);
    await enterEthMarket.wait(1);

    const borrowTrx = await rifi.borrow(Rifi.USDC, 5, { gasLimit: 600000 });
    await borrowTrx.wait(1);

    const trx = await rifi.repayBorrow(Rifi.USDC, 5, null, false, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 4;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('RepayBorrow'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs rToken.repayBorrow ETH', async function () {
    const supplyEthTrx = await rifi.supply(Rifi.ETH, 10);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await rifi.enterMarkets(Rifi.ETH);
    await enterEthMarket.wait(1);

    const borrowTrx = await rifi.borrow(Rifi.ETH, 1, { gasLimit: 600000 });
    await borrowTrx.wait(1);

    const trx = await rifi.repayBorrow(Rifi.ETH, 1, null, false, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 3;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('RepayBorrow'), true);
  });

  it('runs rToken.repayBorrow behalf USDC', async function () {
    const supplyEthTrx2 = await rifi2.supply(Rifi.ETH, 2);
    await supplyEthTrx2.wait(1);

    const enterEthMarket2 = await rifi2.enterMarkets(Rifi.ETH);
    await enterEthMarket2.wait(1);

    const borrowTrx2 = await rifi2.borrow(Rifi.USDC, 5, { gasLimit: 600000 });
    await borrowTrx2.wait(1);

    const supplyEthTrx = await rifi.supply(Rifi.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await rifi.enterMarkets(Rifi.ETH);
    await enterEthMarket.wait(1);

    const borrowTrx = await rifi.borrow(Rifi.USDC, 5, { gasLimit: 600000 });
    await borrowTrx.wait(1);

    // acc1 repays USDCborrow on behalf of acc2
    const trx = await rifi.repayBorrow(Rifi.USDC, 5, acc2.address, false, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);
    const repayBorrowEvent = receipt.events.find(e => e.event === 'RepayBorrow');
    const payer = repayBorrowEvent.args[0].toLowerCase();
    const borrower = repayBorrowEvent.args[1].toLowerCase();

    const payerExpected = acc1.address.toLowerCase();
    const borrowerExpected = acc2.address.toLowerCase();
    const numEventsExpected = 4;

    assert.equal(payer, payerExpected);
    assert.equal(borrower, borrowerExpected);
    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('RepayBorrow'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs rToken.repayBorrow behalf ETH', async function () {
    const supplyEthTrx = await rifi2.supply(Rifi.ETH, 10);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await rifi2.enterMarkets(Rifi.ETH);
    await enterEthMarket.wait(1);

    const borrowTrx = await rifi2.borrow(Rifi.ETH, 1, { gasLimit: 600000 });
    await borrowTrx.wait(1);

    const trx = await rifi.repayBorrow(Rifi.ETH, 1, acc2.address, false, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);
    const repayBorrowEvent = receipt.events.find(e => e.event === 'RepayBorrow');
    const payer = repayBorrowEvent.args[0].toLowerCase();
    const borrower = repayBorrowEvent.args[1].toLowerCase();

    const payerExpected = acc1.address.toLowerCase();
    const borrowerExpected = acc2.address.toLowerCase();

    const numEventsExpected = 3;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('RepayBorrow'), true);
  });

  it('fails rToken.repayBorrow bad asset', async function () {
    const errorMessage = 'Rifi [repayBorrow] | Argument `asset` is not supported.';
    try {
      const trx = await rifi.repayBorrow(null, 1, acc2.address, false); // bad asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails rToken.repayBorrow invalid asset', async function () {
    const errorMessage = 'Rifi [repayBorrow] | Argument `asset` is not supported.';
    try {
      const trx = await rifi.repayBorrow('xxxx', 1, acc2.address, false); // invalid asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails rToken.repayBorrow bad amount', async function () {
    const errorMessage = 'Rifi [repayBorrow] | Argument `amount` must be a string, number, or BigNumber.';
    try {
      const trx = await rifi.repayBorrow('USDC', null, acc2.address, false); // invalid asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails rToken.repayBorrow behalf address', async function () {
    const errorMessage = 'Rifi [repayBorrow] | Invalid `borrower` address.';
    try {
      const trx = await rifi.repayBorrow('USDC', 1, '0xbadaddress', false); // bad address
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

}