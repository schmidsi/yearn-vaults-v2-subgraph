import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { Transaction, Vault, VaultUpdate } from '../../../generated/schema';
import { BIGINT_ZERO } from '../constants';

export function buildIdFromVaultTxHashAndIndex(
  vault: string,
  transactionHash: string,
  transactionIndex: string
): string {
  return vault
    .concat('-')
    .concat(transactionHash.concat('-').concat(transactionIndex));
}

export function buildIdFromVaultAndTransaction(
  vault: Vault,
  transaction: Transaction
): string {
  return buildIdFromVaultTxHashAndIndex(
    vault.id,
    transaction.id,
    transaction.index.toString()
  );
}

function createVaultUpdate(
  id: string,
  vault: Vault,
  transaction: Transaction,
  tokensDeposited: BigInt,
  tokensWithdrawn: BigInt,
  sharesMinted: BigInt,
  sharesBurnt: BigInt,
  pricePerShare: BigInt,
  totalFees: BigInt,
  managementFees: BigInt,
  performanceFees: BigInt,
  balancePosition: BigInt,
  totalAssets: BigInt,
  rewards: Address | null = null
): VaultUpdate {
  log.debug('[VaultUpdate] Creating vault update with id {}', [id]);
  let vaultUpdate = new VaultUpdate(id);
  vaultUpdate.timestamp = transaction.timestamp;
  vaultUpdate.blockNumber = transaction.blockNumber;
  vaultUpdate.transaction = transaction.id;
  vaultUpdate.vault = vault.id;
  // Balances & Shares
  vaultUpdate.tokensDeposited = tokensDeposited;
  vaultUpdate.tokensWithdrawn = tokensWithdrawn;
  vaultUpdate.sharesMinted = sharesMinted;
  vaultUpdate.sharesBurnt = sharesBurnt;
  vaultUpdate.balanceTokens = totalAssets;
  // Performance
  vaultUpdate.pricePerShare = pricePerShare;
  vaultUpdate.totalFees = totalFees;
  vaultUpdate.managementFees = managementFees;
  vaultUpdate.performanceFees = performanceFees;
  vaultUpdate.balancePosition = balancePosition;
  vaultUpdate.rewards = rewards;

  // NOTE: This returnsGenerated parameter represents the _recognized_ returns since the last VaultUpdate.
  // Recognized returns are returns which the strategy has paid out to the Vault via Harvest().
  // Unrecognized returns are returns which have yet to be harvested.
  // The value of unrecognized returns may change between the time of query and the time of harvest, so we use
  // recognized returns for the subgraph.
  vaultUpdate.returnsGenerated = totalAssets
    .minus(vault.balanceTokens)
    .minus(tokensDeposited)
    .plus(tokensWithdrawn);
  vaultUpdate.save();

  vault.latestUpdate = vaultUpdate.id;
  vault.balanceTokens = totalAssets;
  // todo: current implementation of balanceTokensIdle does not update when debt is issued to strategies
  vault.balanceTokensIdle = vault.balanceTokensIdle
    .plus(tokensDeposited)
    .minus(tokensWithdrawn);
  // todo: balanceTokensInvested
  vault.sharesSupply = vault.sharesSupply.plus(sharesMinted).minus(sharesBurnt);
  vault.save();

  return vaultUpdate;
}

export function firstDeposit(
  vault: Vault,
  transaction: Transaction,
  depositedAmount: BigInt,
  sharesMinted: BigInt,
  pricePerShare: BigInt,
  balancePosition: BigInt,
  totalAssets: BigInt
): VaultUpdate {
  log.debug('[VaultUpdate] First deposit', []);
  let vaultUpdateId = buildIdFromVaultAndTransaction(vault, transaction);
  let vaultUpdate = VaultUpdate.load(vaultUpdateId);

  if (vaultUpdate === null) {
    vaultUpdate = createVaultUpdate(
      vaultUpdateId,
      vault,
      transaction,
      depositedAmount,
      BIGINT_ZERO,
      sharesMinted,
      BIGINT_ZERO,
      pricePerShare,
      BIGINT_ZERO,
      BIGINT_ZERO,
      BIGINT_ZERO,
      balancePosition,
      totalAssets
    );
  }

  return vaultUpdate;
}

export function deposit(
  vault: Vault,
  transaction: Transaction,
  depositedAmount: BigInt,
  sharesMinted: BigInt,
  pricePerShare: BigInt,
  balancePosition: BigInt,
  totalAssets: BigInt
): VaultUpdate {
  log.debug('[VaultUpdate] Deposit', []);
  let vaultUpdateId = buildIdFromVaultAndTransaction(vault, transaction);
  let vaultUpdate = VaultUpdate.load(vaultUpdateId);
  let latestVaultUpdate: VaultUpdate | null;
  if (vault.latestUpdate !== null) {
    latestVaultUpdate = VaultUpdate.load(vault.latestUpdate!);
  }

  if (vaultUpdate === null) {
    vaultUpdate = createVaultUpdate(
      vaultUpdateId,
      vault,
      transaction,
      depositedAmount,
      BIGINT_ZERO, // TokensWithdrawn
      sharesMinted,
      BIGINT_ZERO, // SharesBurnt,
      pricePerShare,
      latestVaultUpdate!.totalFees,
      latestVaultUpdate!.managementFees,
      latestVaultUpdate!.performanceFees,
      balancePosition,
      totalAssets
    );
  }

  return vaultUpdate;
}

export function withdraw(
  vault: Vault,
  latestVaultUpdate: VaultUpdate,
  pricePerShare: BigInt,
  withdrawnAmount: BigInt,
  sharesBurnt: BigInt,
  transaction: Transaction,
  balancePosition: BigInt,
  totalAssets: BigInt
): VaultUpdate {
  let vaultUpdateId = buildIdFromVaultAndTransaction(vault, transaction);
  let newVaultUpdate = createVaultUpdate(
    vaultUpdateId,
    vault,
    transaction,
    BIGINT_ZERO, // TokensDeposited
    withdrawnAmount,
    BIGINT_ZERO, // SharesMinted
    sharesBurnt,
    pricePerShare,
    latestVaultUpdate.totalFees,
    latestVaultUpdate.managementFees,
    latestVaultUpdate.performanceFees,
    balancePosition,
    totalAssets
  );
  return newVaultUpdate;
}

export function strategyReported(
  vault: Vault,
  latestVaultUpdate: VaultUpdate,
  transaction: Transaction,
  pricePerShare: BigInt,
  balancePosition: BigInt,
  totalAssets: BigInt
): VaultUpdate {
  let vaultUpdateId = buildIdFromVaultAndTransaction(vault, transaction);
  let newVaultUpdate = createVaultUpdate(
    vaultUpdateId,
    vault,
    transaction,
    BIGINT_ZERO, // TokensDeposited
    BIGINT_ZERO, // TokensWithdrawn
    BIGINT_ZERO, // SharesMinted
    BIGINT_ZERO, // SharesBurnt
    pricePerShare,
    latestVaultUpdate.totalFees,
    latestVaultUpdate.managementFees,
    latestVaultUpdate.performanceFees,
    balancePosition,
    totalAssets
  );
  return newVaultUpdate;
}

export function performanceFeeUpdated(
  vault: Vault,
  transaction: Transaction,
  latestVaultUpdate: VaultUpdate,
  balancePosition: BigInt,
  performanceFee: BigInt,
  totalAssets: BigInt
): VaultUpdate {
  let vaultUpdateId = buildIdFromVaultAndTransaction(vault, transaction);
  let newVaultUpdate = createVaultUpdate(
    vaultUpdateId,
    vault,
    transaction,
    BIGINT_ZERO, // TokensDeposited
    BIGINT_ZERO, // TokensWithdrawn
    BIGINT_ZERO, // SharesMinted
    BIGINT_ZERO, // SharesBurnt
    latestVaultUpdate.pricePerShare,
    latestVaultUpdate.totalFees,
    BIGINT_ZERO,
    performanceFee,
    balancePosition,
    totalAssets
  );
  return newVaultUpdate;
}

export function managementFeeUpdated(
  vault: Vault,
  transaction: Transaction,
  latestVaultUpdate: VaultUpdate,
  balancePosition: BigInt,
  managementFee: BigInt,
  totalAssets: BigInt
): VaultUpdate {
  let vaultUpdateId = buildIdFromVaultAndTransaction(vault, transaction);
  let newVaultUpdate = createVaultUpdate(
    vaultUpdateId,
    vault,
    transaction,
    BIGINT_ZERO, // TokensDeposited
    BIGINT_ZERO, // TokensWithdrawn
    BIGINT_ZERO, // SharesMinted
    BIGINT_ZERO, // SharesBurnt
    latestVaultUpdate.pricePerShare,
    latestVaultUpdate.totalFees,
    managementFee,
    BIGINT_ZERO,
    balancePosition,
    totalAssets
  );
  return newVaultUpdate;
}

export function rewardsUpdated(
  vault: Vault,
  transaction: Transaction,
  latestVaultUpdate: VaultUpdate,
  balancePosition: BigInt,
  totalAssets: BigInt,
  rewards: Address
): VaultUpdate {
  let vaultUpdateId = buildIdFromVaultAndTransaction(vault, transaction);
  let newVaultUpdate = createVaultUpdate(
    vaultUpdateId,
    vault,
    transaction,
    BIGINT_ZERO, // TokensDeposited
    BIGINT_ZERO, // TokensWithdrawn
    BIGINT_ZERO, // SharesMinted
    BIGINT_ZERO, // SharesBurnt
    latestVaultUpdate.pricePerShare,
    latestVaultUpdate.totalFees,
    BIGINT_ZERO,
    BIGINT_ZERO,
    balancePosition,
    totalAssets,
    rewards
  );
  return newVaultUpdate;
}
