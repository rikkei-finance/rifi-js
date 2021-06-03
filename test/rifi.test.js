const assert = require('assert');
const ethers = require('ethers');
const rifi = require('../src/rifi.ts');
const Rifi = require('../src/index.ts');
const providerUrl = 'http://localhost:8545';

const unlockedAddress = '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A';
const unlockedPk = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';

function getNonce (address, rifiAddress, _providerUrl) {
  return new Promise((resolve, reject) => {
    Rifi.eth.read(
      rifiAddress,
      'function nonces(address) returns (uint)',
      [ address ],
      { provider: _providerUrl }
    ).then(resolve).catch(reject);
  });
}

module.exports = function suite([ publicKeys, privateKeys ]) {

  const acc1 = { address: publicKeys[0], privateKey: privateKeys[0] };

  const rifi = new Rifi(providerUrl, {
    privateKey: acc1.privateKey
  });

  it('runs rifi.getRifiBalance', async function () {
    const bal = await rifi.getRifiBalance(acc1.address, providerUrl);

    const expected = 0;
    assert.equal(bal, expected);
  });

  it('fails rifi.getRifiBalance address string', async function () {
    const errorMessage = 'Rifi [getRifiBalance] | Argument `_address` must be a string.';

    try {
      await rifi.getRifiBalance(1, providerUrl);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails rifi.getRifiBalance address invalid', async function () {
    const errorMessage = 'Rifi [getRifiBalance] | Argument `_address` must be a valid Ethereum address.';

    try {
      await rifi.getRifiBalance('bad_ethereum_address', providerUrl);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs rifi.getRifiAccrued', async function () {
    const accrued = await rifi.getRifiAccrued(acc1.address, providerUrl);

    const expected = 0;
    assert.equal(accrued, expected);
  });

  it('fails rifi.getRifiAccrued address string', async function () {
    const errorMessage = 'Rifi [getRifiAccrued] | Argument `_address` must be a string.';

    try {
      await rifi.getRifiAccrued(1, providerUrl);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails rifi.getRifiAccrued address invalid', async function () {
    const errorMessage = 'Rifi [getRifiAccrued] | Argument `_address` must be a valid Ethereum address.';

    try {
      await rifi.getRifiAccrued('bad_ethereum_address', providerUrl);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });


  it('runs rifi.claimRifi', async function () {
    let txReceipt;

    try {
      const claimRifiTx = await rifi.claimRifi({
        gasLimit: ethers.utils.parseUnits('1000000', 'wei') // set when prices were unusually high
      });
      txReceipt = await claimRifiTx.wait(1);
    } catch (error) {
      console.error('error', error);
      console.error('txReceipt', txReceipt);
    }

    const status = txReceipt.status;
    const events = txReceipt.events.length;

    const expectedStatus = 1;
    const expectedEvents = 12;

    assert.equal(status, expectedStatus);
    assert.equal(events, expectedEvents);
  });

  it('runs rifi.delegate', async function () {
    const delegateTx = await rifi.delegate(acc1.address);
    const txReceipt = await delegateTx.wait(1);

    const event = txReceipt.events[0].event;
    const delegatee = txReceipt.events[0].args[2].toLowerCase();

    const expectedEvent = 'DelegateChanged';
    const expectedDelegatee = acc1.address.toLowerCase();

    assert.equal(event, expectedEvent);
    assert.equal(delegatee, expectedDelegatee);
  });

  it('fails rifi.delegate address string', async function () {
    const errorMessage = 'Rifi [delegate] | Argument `_address` must be a string.';

    try {
      await rifi.delegate(1, providerUrl);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails rifi.delegate address invalid', async function () {
    const errorMessage = 'Rifi [delegate] | Argument `_address` must be a valid Ethereum address.';

    try {
      await rifi.delegate('bad_ethereum_address', providerUrl);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs rifi.createDelegateSignature', async function () {
    const _rifi = new Rifi(providerUrl, {
      privateKey: unlockedPk
    });

    const expiry = 10e9;
    const delegateSignature = await _rifi.createDelegateSignature(
      unlockedAddress,
      expiry
    );

    const expectedSignature = {
      r: '0x5d86ab46e1f827f07e9eb6a5955eaa2219e93f64a8c8406ace0d1f48b4c0c405',
      s: '0x710fc5e9a2f8f865739e9f149ebd8a5e8a613097676385db4f197cd0ecfa85bd',
      v: '0x1c'
    }

    assert.equal(delegateSignature.r, expectedSignature.r);
    assert.equal(delegateSignature.s, expectedSignature.s);
    assert.equal(delegateSignature.v, expectedSignature.v);
  });

  it('runs rifi.delegateBySig', async function () {
    const rifiAddress = Rifi.util.getAddress(Rifi.RIFI);
    const nonce = +(await getNonce(acc1.address, rifiAddress, providerUrl)).toString();
    const expiry = 10e9;
    const signature = await rifi.createDelegateSignature(
      acc1.address,
      expiry
    );

    const delegateTx = await rifi.delegateBySig(
      acc1.address,
      nonce,
      expiry,
      signature,
    );

    const txReceipt = await delegateTx.wait(1);

    const toDelegate = txReceipt.events[0].args.toDelegate.toLowerCase();
    const expectedToDelegate = acc1.address.toLowerCase();

    assert.equal(toDelegate, expectedToDelegate);
  });

  it('fails rifi.delegateBySig address string', async function () {
    const errorMessage = 'Rifi [delegateBySig] | Argument `_address` must be a string.';
    try {
      const delegateTx = await rifi.delegateBySig(
        123, // bad
        1,
        10e9,
        {
          r: '0x5d86ab46e1f827f07e9eb6a5955eaa2219e93f64a8c8406ace0d1f48b4c0c405',
          s: '0x710fc5e9a2f8f865739e9f149ebd8a5e8a613097676385db4f197cd0ecfa85bd',
          v: '0x1c'
        },
      );
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails rifi.delegateBySig address invalid', async function () {
    const errorMessage = 'Rifi [delegateBySig] | Argument `_address` must be a valid Ethereum address.';
    try {
      const delegateTx = await rifi.delegateBySig(
        '0xbadaddress', // bad
        1,
        10e9,
        {
          r: '0x5d86ab46e1f827f07e9eb6a5955eaa2219e93f64a8c8406ace0d1f48b4c0c405',
          s: '0x710fc5e9a2f8f865739e9f149ebd8a5e8a613097676385db4f197cd0ecfa85bd',
          v: '0x1c'
        },
      );
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails rifi.delegateBySig nonce', async function () {
    const errorMessage = 'Rifi [delegateBySig] | Argument `nonce` must be an integer.';
    try {
      const delegateTx = await rifi.delegateBySig(
        '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A',
        'abc', // bad
        10e9,
        {
          r: '0x5d86ab46e1f827f07e9eb6a5955eaa2219e93f64a8c8406ace0d1f48b4c0c405',
          s: '0x710fc5e9a2f8f865739e9f149ebd8a5e8a613097676385db4f197cd0ecfa85bd',
          v: '0x1c'
        },
      );
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails rifi.delegateBySig expiry', async function () {
    const errorMessage = 'Rifi [delegateBySig] | Argument `expiry` must be an integer.';
    try {
      const delegateTx = await rifi.delegateBySig(
        '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A',
        1,
        null, // bad
        {
          r: '0x5d86ab46e1f827f07e9eb6a5955eaa2219e93f64a8c8406ace0d1f48b4c0c405',
          s: '0x710fc5e9a2f8f865739e9f149ebd8a5e8a613097676385db4f197cd0ecfa85bd',
          v: '0x1c'
        },
      );
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails rifi.delegateBySig signature', async function () {
    const errorMessage = 'Rifi [delegateBySig] | Argument `signature` must be an object that contains the v, r, and s pieces of an EIP-712 signature.';
    try {
      const delegateTx = await rifi.delegateBySig(
        '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A',
        1,
        10e9,
        {
          r: '0x5d86ab46e1f827f07e9eb6a5955eaa2219e93f64a8c8406ace0d1f48b4c0c405',
          s: '', // bad
          v: '0x1c'
        },
      );
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

}
