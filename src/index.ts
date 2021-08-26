/**
 * @file Rifi
 * @desc This file defines the constructor of the `Rifi` class.
 * @hidden
 */

import { ethers } from "ethers";
import * as eth from "./eth";
import * as util from "./util";
import * as cointroller from "./cointroller";
import * as rToken from "./rToken";
import * as priceFeed from "./priceFeed";
import * as rifi from "./rifi";
import * as lens from "./lens";
import * as gov from "./gov";
import * as api from "./api";
import * as vault from "./vault";
import { constants, decimals, vaultConfig } from "./constants";
import { Provider, RifiOptions, RifiInstance } from "./types";

// Turn off Ethers.js warnings
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

/**
 * Creates an instance of the Rifi.js SDK.
 *
 * @param {Provider | string} [provider] Optional Ethereum network provider.
 *     Defaults to Ethers.js fallback mainnet provider.
 * @param {object} [options] Optional provider options.
 *
 * @example
 * ```
 * var rifi = new Rifi(window.ethereum); // web browser
 *
 * var rifi = new Rifi('http://127.0.0.1:8545'); // HTTP provider
 *
 * var rifi = new Rifi(); // Uses Ethers.js fallback mainnet (for testing only)
 *
 * var rifi = new Rifi('ropsten'); // Uses Ethers.js fallback (for testing only)
 *
 * // Init with private key (server side)
 * var rifi = new Rifi('https://mainnet.infura.io/v3/_your_project_id_', {
 *   privateKey: '0x_your_private_key_', // preferably with environment variable
 * });
 *
 * // Init with HD mnemonic (server side)
 * var rifi = new Rifi('mainnet' {
 *   mnemonic: 'clutch captain shoe...', // preferably with environment variable
 * });
 * ```
 *
 * @returns {object} Returns an instance of the Rifi.js SDK.
 */
const Rifi = function (
  provider: Provider | string = "mainnet",
  options: RifiOptions = {}
): RifiInstance {
  const originalProvider = provider;

  options.provider = provider || options.provider;
  provider = eth._createProvider(options);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instance: any = {
    _originalProvider: originalProvider,
    _provider: provider,
    ...cointroller,
    ...rToken,
    ...priceFeed,
    ...gov,
    ...lens,
    ...vault,
    vault: {
      ...vault,
    },
    claimRifi: rifi.claimRifi,
    delegate: rifi.delegate,
    delegateBySig: rifi.delegateBySig,
    createDelegateSignature: rifi.createDelegateSignature,
  };

  // Instance needs to know which network the provider connects to, so it can
  //     use the correct contract addresses.
  instance._networkPromise = eth
    .getProviderNetwork(provider)
    .then((network) => {
      delete instance._networkPromise;
      instance._network = network;
    });

  return instance;
};

Rifi.eth = eth;
Rifi.api = api;
Rifi.util = util;
Rifi._ethers = ethers;
Rifi.decimals = decimals;
Rifi.rifi = {
  getRifiBalance: rifi.getRifiBalance,
  getRifiAccrued: rifi.getRifiAccrued,
};
Rifi.vaultConfig = vaultConfig;
Object.assign(Rifi, constants);

export = Rifi;
