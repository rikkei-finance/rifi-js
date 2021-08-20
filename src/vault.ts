/**
 * @file Vault
 * @desc These methods facilitate interactions with the Vault smart contracts.
 */

import { ethers, BigNumber, utils } from "ethers";
const { parseUnits } = utils;
import * as eth from "./eth";
import { netId } from "./helpers";
import * as constants from "./constants";
import { CallOptions, TrxResponse } from "./types";


const MAX_ALLOWANCE = BigNumber.from(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
); // 2**256 - 1
// Because RIFI only set allowance to (2**96 - 1)
const SAFE_ALLOWANCE = BigNumber.from("0xffffffffffffffffffffff"); // 2**88 - 1


async function getUserAddress(provider: ethers.Wallet): Promise<string> {
  let userAddress: string = provider.address;

  if (!userAddress && provider.getAddress) {
    userAddress = await provider.getAddress();
  }
  return userAddress;
}

async function isApproved(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
  amount?: number | string | ethers.BigNumber,
  options: CallOptions = {}
): Promise<boolean> {
  const trxOptions = {
    ...options,
    abi: constants.abi.Bep20,
  };

  const allowance = await eth.read(
    tokenAddress,
    "allowance",
    [ownerAddress, spenderAddress],
    trxOptions
  );

  if (!amount) {
    amount = SAFE_ALLOWANCE;
  }

  return allowance.gte(amount);
}

async function approve(
  tokenAddress: string,
  spenderAddress: string,
  amount?: number | string | ethers.BigNumber,
  options: CallOptions = {}
): Promise<TrxResponse> {
  const trxOptions = {
    ...options,
    abi: constants.abi.Bep20,
  };

  if (!amount) {
    amount = MAX_ALLOWANCE;
  }

  const parameters = [spenderAddress, amount];
  return eth.trx(tokenAddress, "approve", parameters, trxOptions);
}

/**
 * Check if user has enabled depositing into vault
 *
 * @param {string} vault The name of the vault.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction.
 *
 * @returns {boolean} True if depositing is enabled
 */
export async function depositEnabled(
  vault: string,
  options: CallOptions = {}
): Promise<boolean> {
  await netId(this);
  const errorPrefix = "Vault [depositEnabled] | ";

  const vaultAddress = constants.address[this._network?.name]?.[vault];
  const tokenName = constants.vaultInfo[this._network?.name]?.[vault]?.depositToken;
  const tokenAddress = constants.address[this._network?.name]?.[tokenName];

  if (!vaultAddress || !tokenAddress) {
    throw Error(errorPrefix + "Vault `vault` not found.");
  }

  const userAddress = await getUserAddress(this._provider);
  const trxOptions = {
    ...options,
    _rifiProvider: this._provider,
  };

  return await isApproved(
    tokenAddress,
    userAddress,
    vaultAddress,
    SAFE_ALLOWANCE,
    trxOptions
  );
}

/**
 * Enable depositing into vault for user (approve vault to transfer asset)
 *
 * @param {string} vault The name of the vault.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction.
 *
 * @returns {TrxResponse} Returns an Ethers.js transaction object of the approve
 *     transaction, or nothing if the vault is already approved.
 */
export async function enableDeposit(
  vault: string,
  options: CallOptions = {}
): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = "Vault [enableDeposit] | ";

  const vaultAddress = constants.address[this._network?.name]?.[vault];
  const tokenName = constants.vaultInfo[this._network?.name]?.[vault]?.depositToken;
  const tokenAddress = constants.address[this._network?.name]?.[tokenName];

  if (!vaultAddress || !tokenAddress) {
    throw Error(errorPrefix + "Vault `vault` not found.");
  }

  const userAddress = await getUserAddress(this._provider);
  const trxOptions = {
    ...options,
    _rifiProvider: this._provider,
  };

  const approved = await isApproved(
    tokenAddress,
    userAddress,
    vaultAddress,
    SAFE_ALLOWANCE,
    trxOptions
  );

  if (!approved) {
    return approve(tokenAddress, vaultAddress, MAX_ALLOWANCE, trxOptions);
  }
}

/**
 * Deposit the user's asset into vault.
 *
 * @param {string} vault The name of the vault to deposit into.
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to deposit. Use the `mantissa` boolean
 *     in the `options` parameter to indicate if this value is scaled up (so
 *     there are no decimals) or in its natural scale.
 * @param {boolean} noApprove Explicitly prevent this method from attempting an
 *     ERC-20 `approve` transaction prior to sending the `deposit` transaction.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction.
 *
 * @returns {TrxResponse} Returns an Ethers.js transaction object of the deposit
 *     transaction.
 *
 * @example
 *
 * ```
 * const rifi = new Rifi(window.ethereum);
 *
 * (async function() {
 *
 *   console.log('Redeeming ETH...');
 *   const trx = await rifi.deposit(Rifi.UsdtVault, 1);
 *   console.log('Ethers.js transaction object', trx);
 *
 * })().catch(console.error);
 * ```
 */
export async function deposit(
  vault: string,
  amount: string | number | BigNumber,
  noApprove = false,
  options: CallOptions = {}
): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = "Vault [deposit] | ";

  const vaultAddress = constants.address[this._network?.name]?.[vault];
  const tokenName = constants.vaultInfo[this._network?.name]?.[vault]?.depositToken;
  const tokenAddress = constants.address[this._network?.name]?.[tokenName];

  if (!vaultAddress || !tokenAddress) {
    throw Error(errorPrefix + "Vault `vault` not found.");
  }

  if (
    typeof amount !== "number" &&
    typeof amount !== "string" &&
    !ethers.BigNumber.isBigNumber(amount)
  ) {
    throw Error(
      errorPrefix + "Argument `amount` must be a string, number, or BigNumber."
    );
  }

  // Scale up amount
  if (!options.mantissa) {
    amount = parseUnits(amount.toString(), constants.decimals[tokenName]);
  } else {
    amount = BigNumber.from(amount.toString());
  }

  const trxOptions: CallOptions = {
    ...options,
    _rifiProvider: this._provider,
  };

  // Explicitly approve required amount
  if (noApprove !== true) {
    const userAddress = await getUserAddress(this._provider);

    const approved = isApproved(
      tokenAddress,
      userAddress,
      vaultAddress,
      amount,
      trxOptions
    );

    if (!approved) {
      approve(tokenAddress, vaultAddress, amount, trxOptions);
    }
  }

  trxOptions.abi = constants.abi.Vault;
  const parameters = [amount];

  return eth.trx(vaultAddress, "deposit", parameters, trxOptions);
}

/**
 * Withdraw user's asset from vault.
 *
 * @param {string} vault The name of the vault to withdraw from.
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to withdraw. Use the `mantissa` boolean
 *     in the `options` parameter to indicate if this value is scaled up (so
 *     there are no decimals) or in its natural scale. Omit this parameter or
 *     pass `null` to withdraw all assets.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction.
 *
 * @returns {TrxResponse} Returns an Ethers.js transaction object of the withdraw
 *     transaction.
 *
 * @example
 *
 * ```
 * const rifi = new Rifi(window.ethereum);
 *
 * (async function() {
 *
 *   console.log('Redeeming ETH...');
 *   const trx = await rifi.withdraw(Rifi.UsdtVault, 1);
 *   console.log('Ethers.js transaction object', trx);
 *
 * })().catch(console.error);
 * ```
 */
export async function withdraw(
  vault: string,
  amount?: string | number | BigNumber,
  options: CallOptions = {}
): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = "Vault [withdraw] | ";

  const vaultAddress = constants.address[this._network.name]?.[vault];
  if (!vaultAddress) {
    throw Error(errorPrefix + "Vault `vault` not found.");
  }

  const parameters = [];
  let methodName;

  if (amount !== undefined && amount !== null) {
    if (
      typeof amount !== "number" &&
      typeof amount !== "string" &&
      !ethers.BigNumber.isBigNumber(amount)
    ) {
      throw Error(
        errorPrefix +
          "Argument `amount` must be a string, number, or BigNumber."
      );
    }

    if (!options.mantissa) {
      const tokenName = constants.vaultInfo[this._network?.name]?.[vault]?.depositToken;
      amount = parseUnits(amount.toString(), constants.decimals[tokenName]);
    } else {
      amount = BigNumber.from(amount.toString());
    }

    methodName = "withdraw";
    parameters.push(amount);
  } else {
    methodName = "withdrawAll";
  }

  const trxOptions: CallOptions = {
    ...options,
    abi: constants.abi.Vault,
    _rifiProvider: this._provider,
  };

  return eth.trx(vaultAddress, methodName, parameters, trxOptions);
}

/**
 * Harvest user's reward in vault.
 *
 * @param {string} vault The name of the vault to harvest.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction.
 *
 * @returns {TrxResponse} Returns an Ethers.js transaction object of the harvest
 *     transaction.
 *
 * @example
 *
 * ```
 * const rifi = new Rifi(window.ethereum);
 *
 * (async function() {
 *
 *   console.log('Harvesting RIFI...');
 *   const trx = await rifi.harvestReward(Rifi.UsdtVault);
 *   console.log('Ethers.js transaction object', trx);
 *
 * })().catch(console.error);
 * ```
 */
export async function harvestReward(
  vault: string,
  options: CallOptions = {}
): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = "Vault [harvestReward] | ";

  const vaultAddress = constants.address[this._network.name]?.[vault];
  if (!vaultAddress) {
    throw Error(errorPrefix + "Vault `vault` not found.");
  }

  const trxOptions: CallOptions = {
    ...options,
    abi: constants.abi.Vault,
    _rifiProvider: this._provider,
  };
  const parameters = [];

  return eth.trx(vaultAddress, "harvest", parameters, trxOptions);
}

/**
 * Claim vested reward from vault.
 *
 * @param {string} vault The name of the vault to (to find reward locker).
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction.
 *
 * @returns {TrxResponse} Returns an Ethers.js transaction object of the claim
 *     transaction.
 *
 * @example
 *
 * ```
 * const rifi = new Rifi(window.ethereum);
 *
 * (async function() {
 *
 *   console.log('Claiming RIFI...');
 *   const trx = await rifi.claimReward(Rifi.UsdtVault);
 *   console.log('Ethers.js transaction object', trx);
 *
 * })().catch(console.error);
 * ```
 */
export async function claimReward(
  vault: string,
  options: CallOptions = {}
): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = "Vault [claimReward] | ";

  const vaultAddress = constants.address[this._network.name]?.[vault];
  if (!vaultAddress) {
    throw Error(errorPrefix + "Vault `vault` not found.");
  }

  const rewardLocker = constants.vaultInfo[this._network?.name]?.[vault]?.rewardLocker;
  const lockerAddress = constants.address[this._network?.name]?.[rewardLocker];
  const rewardToken = constants.vaultInfo[this._network?.name]?.[vault]?.rewardToken;
  const tokenAddress = constants.address[this._network?.name]?.[rewardToken];
  if (!lockerAddress || !tokenAddress) {
    throw Error(errorPrefix + "Locker for `vault` not found.");
  }

  const userAddress = getUserAddress(this._provider);

  const trxOptions: CallOptions = {
    ...options,
    abi: constants.abi.RewardLocker,
    _rifiProvider: this._provider,
  };

  const numSchedules: BigNumber = await eth.read(
    lockerAddress,
    "numVestingSchedules",
    [userAddress, tokenAddress],
    trxOptions
  );

  if (numSchedules.gt(0)) {
    return eth.trx(
      lockerAddress,
      "vestSchedulesInRange",
      [tokenAddress, 0, numSchedules.sub(1)],
      trxOptions
    );
  }
}

/**
 * Get user balance in vault
 *
 * @param {string} vault The name of the vault to (to find reward locker).
 * @param {string} account User's account address.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction.
 *
 * @returns {BigNumber} Returns an Ethers.js transaction object of the withdraw
 *     transaction.
 *
 * @example
 *
 * ```
 * const rifi = new Rifi(window.ethereum);
 *
 * (async function() {
 *
 *   console.log('Get balance...');
 *   const balance = await rifi.getDepositOf(Rifi.UsdtVault, account);
 *   console.log('Balance in vault', balance);
 *
 * })().catch(console.error);
 * ```
 */
export async function getDepositOf(
  vault: string,
  account?: string,
  options: CallOptions = {}
): Promise<BigNumber> {
  await netId(this);
  const errorPrefix = "Vault [getDepositOf] | ";

  const vaultAddress = constants.address[this._network.name]?.[vault];
  if (!vaultAddress) {
    throw Error(errorPrefix + "Vault `vault` not found.");
  }

  if (!account) {
    account = await getUserAddress(this._provider);
  }

  const trxOptions: CallOptions = {
    ...options,
    abi: constants.abi.Vault,
    _rifiProvider: this._provider,
  };
  const parameters = [account];

  return await eth.read(vaultAddress, "getBalance", parameters, trxOptions);
}

interface RewardBalances {
  pending: BigNumber;
  vesting: BigNumber;
  claimable: BigNumber;
}

interface VestingSchedule {
  startBlock: BigNumber;
  endBlock: BigNumber;
  quantity: BigNumber;
  vestedQuantity: BigNumber;
}

/**
 * Query and calculate reward amounts for current user
 *
 * @param {string} vault The name of the vault to (to find reward locker).
 * @param {string} account User's account address.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction.
 *
 * @returns {BigNumber} Returns an Ethers.js transaction object of the withdraw
 *     transaction.
 *
 * @example
 *
 * ```
 * const rifi = new Rifi(window.ethereum);
 *
 * (async function() {
 *
 *   console.log('Get balance...');
 *   const { pending, vesting, claimable } = await rifi.getRewardBalances(Rifi.UsdtVault);
 *   console.log('Pending reward', pending);
 *   console.log('Vesting reward', vesting);
 *   console.log('Claimable reward', claimable);
 *
 * })().catch(console.error);
 * ```
 */
export async function getRewardBalances(
  vault: string,
  options: CallOptions = {}
): Promise<RewardBalances> {
  await netId(this);
  const errorPrefix = "Vault [getRewardOf] | ";

  const vaultAddress = constants.address[this._network.name]?.[vault];
  if (!vaultAddress) {
    throw Error(errorPrefix + "Vault `vault` not found.");
  }

  const rewardLocker = constants.vaultInfo[this._network?.name]?.[vault]?.rewardLocker;
  const lockerAddress = constants.address[this._network?.name]?.[rewardLocker];
  const rewardToken = constants.vaultInfo[this._network?.name]?.[vault]?.rewardToken;
  const tokenAddress = constants.address[this._network?.name]?.[rewardToken];
  if (!lockerAddress || !tokenAddress) {
    throw Error(errorPrefix + "Locker for `vault` not found.");
  }

  const userAddress = getUserAddress(this._provider);

  let trxOptions: CallOptions = {
    ...options,
    abi: constants.abi.Vault,
    _rifiProvider: this._provider,
  };

  const pending = await eth.read(
    vaultAddress,
    "getUnclaimedReward",
    [userAddress],
    trxOptions
  );

  trxOptions = {
    ...trxOptions,
    abi: constants.abi.RewardLocker,
  };

  const numSchedules: BigNumber = await eth.read(
    lockerAddress,
    "numVestingSchedules",
    [userAddress, tokenAddress],
    trxOptions
  );

  let vesting: BigNumber, claimable: BigNumber;
  if (numSchedules.gt(0)) {
    try {
      claimable = await eth.read(
        lockerAddress,
        "vestSchedulesInRange",
        [tokenAddress, 0, numSchedules.sub(1)],
        trxOptions
      );
    } catch (err) {
      console.error("error vestSchedulesInRange  ", err);
      claimable = BigNumber.from(0);
    }

    const schedules: VestingSchedule[] = await eth.read(
      lockerAddress,
      "getVestingSchedules",
      [userAddress, tokenAddress],
      trxOptions
    );

    vesting = schedules.reduce<BigNumber>(
      (total, cur) => cur.quantity.sub(cur.vestedQuantity).add(total),
      BigNumber.from(0)
    );
    vesting = vesting.sub(claimable);
  } else {
    vesting = claimable = BigNumber.from(0);
  }

  return { pending, vesting, claimable };
}
