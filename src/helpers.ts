import { RifiInstance } from './types';
import { getNetNameWithChainId } from './util';

const mapChainIdWithName = _rifi => {
  _rifi._network.name = getNetNameWithChainId(_rifi._network.chainId || _rifi._network.id);
};

/**
 * This function acts like a decorator for all methods that interact with the
 *     blockchain. In order to use the correct Rifi Protocol addresses, the
 *     Rifi.js SDK must know which network its provider points to. This
 *     function holds up a transaction until the main constructor has determined
 *     the network ID.
 *
 * @hidden
 *
 * @param {Rifi} _rifi The instance of the Rifi.js SDK.
 *
 */
export async function netId(_rifi: RifiInstance): Promise<void> {
  if (_rifi._networkPromise) {
    await _rifi._networkPromise;
    mapChainIdWithName(_rifi);
  }
}
