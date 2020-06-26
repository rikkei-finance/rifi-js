"use strict";
exports.__esModule = true;
exports.trx = exports.read = void 0;
var ethers_1 = require("ethers");
/**
 * This is a generic method for invoking JSON RPC's `eth_call` or `eth_send`
 *     with ethers.js. This function supports the public `read` and `trx`
 *     methods in this module.
 *
 * @param {boolean} isWrite True for `eth_send` and false for `eth_call`.
 * @param {string} address The Ethereum address the transaction is directed to.
 * @param {string} method The smart contract member in which to invoke.
 * @param {any[]} [parameters] Parameters of the method to invoke.
 * @param {CallOptions} [options] Options to set for `eth_call`, optional ABI
 *     (as JSON object), and ethers.js method overrides. The ABI can be a string
 *     of the single intended method, an array of many methods, or a JSON object
 *     of the ABI generated by a Solidity compiler.
 *
 * @returns {Promise<any>} Return value of the invoked smart contract member
 *     or an error object if the call failed.
 */
function _readOrWrite(isWrite, address, method, parameters, options) {
    if (parameters === void 0) { parameters = []; }
    if (options === void 0) { options = {}; }
    return new Promise(function (resolve, reject) {
        var network = options.network || 'mainnet';
        var walletSigner;
        if (options.privateKey) {
            walletSigner = options.privateKey;
        }
        else if (options.mnemonic) {
            walletSigner = ethers_1.ethers.Wallet.fromMnemonic(options.mnemonic);
        }
        var walletProvider, web3Signer;
        if (typeof options.provider === 'object') {
            walletProvider = new ethers_1.ethers.providers.Web3Provider(options.provider);
            web3Signer = walletProvider.getSigner();
        }
        else if (typeof options.provider === 'string') {
            walletProvider = new ethers_1.ethers.providers.JsonRpcProvider(options.provider);
        }
        else {
            walletProvider = ethers_1.ethers.getDefaultProvider(network);
        }
        var provider;
        if (walletSigner) {
            provider = new ethers_1.ethers.Wallet(walletSigner, walletProvider);
        }
        else {
            provider = walletProvider;
        }
        var overrides = {
            gasPrice: options.gasPrice,
            nonce: options.nonce,
            value: options.value,
            chainId: options.chainId,
            from: options.from,
            gasLimit: options.gasLimit
        };
        parameters.push(overrides);
        var contract;
        var abi;
        if (options.abi) {
            // Assumes `method` is a string of the member name
            // Assumes `abi` is a JSON object
            abi = options.abi;
            contract = new ethers_1.ethers.Contract(address, abi, provider);
        }
        else {
            // Assumes `method` is a string of the member definition
            abi = [method];
            contract = new ethers_1.ethers.Contract(address, abi, provider);
            method = Object.keys(contract.functions)[1];
        }
        if (web3Signer) {
            contract = contract.connect(web3Signer);
        }
        if (isWrite) {
            contract[method].apply(null, parameters).then(function (result) {
                resolve(result);
            })["catch"](function (error) {
                reject(error);
            });
        }
        else {
            contract.callStatic[method].apply(null, parameters).then(function (result) {
                resolve(result);
            })["catch"](function (error) {
                reject(error);
            });
        }
    });
}
/**
 * This is a generic method for invoking JSON RPC's `eth_call` with ethers.js.
 *     Use this method to execute a smart contract's constant or non-constant
 *     member without using gas. This is a read-only method intended to read a
 *     value or test a transaction for valid parameters. It does not create a
 *     transaction on the block chain.
 *
 * @param {string} address The Ethereum address the transaction is directed to.
 * @param {string} method The smart contract member in which to invoke.
 * @param {any[]} [parameters] Parameters of the method to invoke.
 * @param {CallOptions} [options] Options to set for `eth_call`, optional ABI
 *     (as JSON object), and ethers.js method overrides. The ABI can be a string
 *     of the single intended method, an array of many methods, or a JSON object
 *     of the ABI generated by a Solidity compiler.
 *
 * @returns {any} Return value of the invoked smart contract member or an error
 *     object if the call failed.
 */
function read(address, method, parameters, options) {
    if (parameters === void 0) { parameters = []; }
    if (options === void 0) { options = {}; }
    return _readOrWrite(false, address, method, parameters, options);
}
exports.read = read;
// TODO: Add a doc block for this
function trx(address, method, parameters, options) {
    if (parameters === void 0) { parameters = []; }
    if (options === void 0) { options = {}; }
    return _readOrWrite(true, address, method, parameters, options);
}
exports.trx = trx;
//# sourceMappingURL=eth.js.map