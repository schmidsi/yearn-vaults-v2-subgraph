import { log, ethereum, BigInt, Address, Bytes } from '@graphprotocol/graph-ts';
import {
  Harvest,
  Strategy,
  StrategyReport,
  Transaction,
  Vault,
} from '../../../generated/schema';
import { Strategy as StrategyTemplate } from '../../../generated/templates';
import { Strategy as StrategyContract } from '../../../generated/templates/Vault/Strategy';
import { Vault as VaultContract } from '../../../generated/templates/Vault/Vault';
import { bigIntExponential } from '../../../tests/util';
import { booleanToString, getTimeInMillis } from '../commons';
import { BIGINT_ZERO } from '../constants';
import * as strategyReportLibrary from './strategy-report';
import * as strategyReportResultLibrary from './strategy-report-result';

export function buildId(strategyAddress: Address): string {
  return strategyAddress.toHexString();
}

export function createAndGet(
  transactionId: string,
  strategyAddress: Address,
  vault: Address,
  debtLimit: BigInt,
  rateLimit: BigInt,
  minDebtPerHarvest: BigInt,
  maxDebtPerHarvest: BigInt,
  performanceFee: BigInt,
  clonedFrom: Strategy | null,
  transaction: Transaction
): Strategy {
  log.info('[Strategy] CreateAndGet strategy {} in vault {} in TxHash {}', [
    strategyAddress.toHexString(),
    vault.toHexString(),
    transaction.hash.toHexString(),
  ]);
  let strategyContract = StrategyContract.bind(strategyAddress);
  let strategyId = buildId(strategyAddress);
  let strategy = Strategy.load(strategyId);
  if (strategy == null) {
    log.info('[Strategy] Create new strategy {} in vault {} in TxHash {}', [
      strategyAddress.toHexString(),
      vault.toHexString(),
      transaction.hash.toHexString(),
    ]);
    strategy = new Strategy(strategyId);
    strategy.inQueue = true;
    strategy.blockNumber = transaction.blockNumber;
    strategy.timestamp = getTimeInMillis(transaction.timestamp);
    strategy.transaction = transactionId;
    let tryName = strategyContract.try_name();
    strategy.name = tryName.reverted ? 'TBD' : tryName.value.toString();
    strategy.address = strategyAddress;
    strategy.vault = vault.toHexString();
    strategy.debtLimit = debtLimit;
    strategy.rateLimit = rateLimit;
    strategy.minDebtPerHarvest = minDebtPerHarvest;
    strategy.maxDebtPerHarvest = maxDebtPerHarvest;
    strategy.performanceFeeBps = performanceFee;
    let tryApiVersion = strategyContract.try_apiVersion();
    strategy.apiVersion = tryApiVersion.reverted ? '0' : tryApiVersion.value;
    let tryKeeper = strategyContract.try_keeper();
    strategy.keeper = tryKeeper.reverted ? Address.zero() : tryKeeper.value;
    let tryStrategist = strategyContract.try_strategist();
    strategy.strategist = tryStrategist.reverted
      ? Address.zero()
      : tryStrategist.value;
    let tryRewards = strategyContract.try_rewards();
    strategy.rewards = tryRewards.reverted ? Address.zero() : tryRewards.value;

    let tryEmergencyExit = strategyContract.try_emergencyExit();
    strategy.emergencyExit = tryEmergencyExit.reverted
      ? false
      : tryEmergencyExit.value;

    strategy.clonedFrom = clonedFrom ? clonedFrom.id : null;

    let tryHealthCheck = strategyContract.try_healthCheck();
    strategy.healthCheck = tryHealthCheck.reverted
      ? null
      : tryHealthCheck.value;
    let tryDoHealthCheck = strategyContract.try_doHealthCheck();
    strategy.doHealthCheck = tryDoHealthCheck.reverted
      ? false
      : tryDoHealthCheck.value;

    strategy.save();
    StrategyTemplate.create(strategyAddress);
  }
  return strategy;
}

export function createReport(
  transaction: Transaction,
  strategyId: string,
  gain: BigInt,
  loss: BigInt,
  totalGain: BigInt,
  totalLoss: BigInt,
  totalDebt: BigInt,
  debtAdded: BigInt,
  debtLimit: BigInt,
  debtPaid: BigInt,
  event: ethereum.Event
): StrategyReport | null {
  let txHash = transaction.hash.toHexString();
  log.info('[Strategy] Create report for strategy {}', [strategyId]);
  let strategy = Strategy.load(strategyId);
  if (strategy !== null) {
    let currentReportId = strategy.latestReport;
    log.info(
      '[Strategy] Getting current report {} for strategy {}. TxHash: {}',
      [currentReportId ? currentReportId : 'null', strategy.id, txHash]
    );
    let latestReport = strategyReportLibrary.getOrCreate(
      transaction.id,
      strategy as Strategy,
      gain,
      loss,
      totalGain,
      totalLoss,
      totalDebt,
      debtAdded,
      debtLimit,
      debtPaid,
      event
    );
    strategy.latestReport = latestReport.id;
    strategy.save();

    // Getting latest report to compare to the new one and create a new report result.
    if (currentReportId !== null) {
      let currentReport = StrategyReport.load(currentReportId);
      if (currentReport !== null) {
        log.info(
          '[Strategy] Create report result (latest {} vs current {}) for strategy {}. TxHash: {}',
          [latestReport.id, currentReport.id, strategyId, txHash]
        );
        strategyReportResultLibrary.create(
          transaction,
          currentReport as StrategyReport,
          latestReport
        );
      }
    } else {
      log.info(
        '[Strategy] Report result NOT created. Only one report created {} for strategy {}. TxHash: {}',
        [latestReport.id, strategyId, txHash]
      );
    }
    return latestReport;
  } else {
    log.warning(
      '[Strategy] Failed to load strategy {} while handling StrategyReport',
      [strategyId]
    );
    return null;
  }
}

export function harvest(
  harvester: Address,
  strategyAddress: Address,
  timestamp: BigInt,
  blockNumber: BigInt,
  transactionHash: Bytes,
  transactionIndex: BigInt,
  profit: BigInt,
  loss: BigInt,
  debtPayment: BigInt,
  debtOutstanding: BigInt,
  transaction: Transaction
): Harvest {
  log.info('[Strategy] Harvest strategy {}', [strategyAddress.toHexString()]);
  let harvestId = strategyAddress
    .toHexString()
    .concat('-')
    .concat(transactionHash.toHexString())
    .concat('-')
    .concat(transactionIndex.toString());
  let harvest = Harvest.load(harvestId);

  if (harvest == null) {
    let strategyContract = StrategyContract.bind(strategyAddress);
    let strategy = Strategy.load(strategyAddress.toHexString());
    harvest = new Harvest(harvestId);
    harvest.timestamp = timestamp;
    harvest.blockNumber = blockNumber;
    harvest.transaction = transactionHash.toHexString();
    harvest.vault = strategyContract.vault().toHexString();
    harvest.strategy = strategyAddress.toHexString();
    harvest.harvester = harvester;
    harvest.profit = profit;
    harvest.loss = loss;
    harvest.debtPayment = debtPayment;
    harvest.debtOutstanding = debtOutstanding;
    harvest.transaction = transaction.id;
    harvest.save();
  } else {
    log.warning(
      '[Strategy] Harvest id {} FOUND for strategy {} and tx hash {}.',
      [harvestId, strategyAddress.toHexString(), transaction.hash.toHexString()]
    );
  }

  return harvest;
}

export function strategyCloned(
  clonedStrategyAddress: Address,
  fromStrategyAddress: Address,
  transaction: Transaction
): void {
  let txHash = transaction.hash.toHexString();
  log.info('[Strategy Mapping] Handle new cloned strategy {} and TX hash {}', [
    clonedStrategyAddress.toHexString(),
    txHash,
  ]);
  let strategyId = buildId(fromStrategyAddress);
  let strategyClonedFrom = Strategy.load(strategyId);
  let strategyContract = StrategyContract.bind(clonedStrategyAddress);
  let vaultAddress = strategyContract.vault();
  createAndGet(
    transaction.id,
    clonedStrategyAddress,
    vaultAddress,
    BIGINT_ZERO,
    BIGINT_ZERO,
    BIGINT_ZERO,
    BIGINT_ZERO,
    BIGINT_ZERO,
    strategyClonedFrom,
    transaction
  );
}

export function healthCheckSet(
  strategyAddress: Address,
  healthCheckAddress: Address,
  transaction: Transaction
): void {
  let txHash = transaction.hash.toHexString();
  log.info(
    '[Strategy Mapping] Handle strategy {} new health check set {} and TxHash {}',
    [strategyAddress.toHexString(), healthCheckAddress.toHexString(), txHash]
  );
  let strategyId = buildId(strategyAddress);
  let strategy = Strategy.load(strategyId);
  if (strategy !== null) {
    strategy.healthCheck = healthCheckAddress;
    strategy.save();
  } else {
    log.warning('SetHealthCheck {} Strategy {} not found in TxHash {}', [
      healthCheckAddress.toHexString(),
      strategyAddress.toHexString(),
      txHash,
    ]);
  }
}

export function doHealthCheckSet(
  strategyAddress: Address,
  doHealthCheck: boolean,
  transaction: Transaction
): void {
  let txHash = transaction.hash.toHexString();
  log.info(
    '[Strategy Mapping] Handle strategy {} new do health check set {} and TxHash {}',
    [strategyAddress.toHexString(), booleanToString(doHealthCheck), txHash]
  );
  let strategyId = buildId(strategyAddress);
  let strategy = Strategy.load(strategyId);
  if (strategy !== null) {
    strategy.doHealthCheck = doHealthCheck;
    strategy.save();
  } else {
    log.warning('SetDoHealthCheck {} Strategy {} not found in TxHash {}', [
      booleanToString(doHealthCheck),
      strategyAddress.toHexString(),
      txHash,
    ]);
  }
}

export function emergencyExitEnabled(
  strategyAddress: Address,
  transaction: Transaction
): void {
  let txHash = transaction.hash.toHexString();
  log.info(
    '[Strategy Mapping] Handle EmergencyExitEnabled strategy {} and TxHash {}',
    [strategyAddress.toHexString(), txHash]
  );
  let strategyId = buildId(strategyAddress);
  let strategy = Strategy.load(strategyId);
  if (strategy !== null) {
    strategy.emergencyExit = true;
    strategy.save();
  } else {
    log.warning('EmergencyExitEnabled Strategy {} not found in TxHash {}', [
      strategyAddress.toHexString(),
      txHash,
    ]);
  }
}

export function updatedKeeper(
  strategyAddress: Address,
  keeper: Address,
  transaction: Transaction
): void {
  let txHash = transaction.hash.toHexString();
  log.info(
    '[Strategy Mapping] Handle UpdatedKeeper {} strategy {} and TxHash {}',
    [keeper.toHexString(), strategyAddress.toHexString(), txHash]
  );
  let strategyId = buildId(strategyAddress);
  let strategy = Strategy.load(strategyId);
  if (strategy !== null) {
    strategy.keeper = keeper;
    strategy.save();
  } else {
    log.warning('UpdatedKeeper {} Strategy {} not found in TxHash {}', [
      keeper.toHexString(),
      strategyAddress.toHexString(),
      txHash,
    ]);
  }
}

export function updatedStrategist(
  strategyAddress: Address,
  strategist: Address,
  transaction: Transaction
): void {
  let txHash = transaction.hash.toHexString();
  log.info(
    '[Strategy Mapping] Handle UpdatedStrategist {} strategy {} and TxHash {}',
    [strategist.toHexString(), strategyAddress.toHexString(), txHash]
  );
  let strategyId = buildId(strategyAddress);
  let strategy = Strategy.load(strategyId);
  if (strategy !== null) {
    strategy.strategist = strategist;
    strategy.save();
  } else {
    log.warning('UpdatedStrategist {} Strategy {} not found in TxHash {}', [
      strategist.toHexString(),
      strategyAddress.toHexString(),
      txHash,
    ]);
  }
}

export function updatedRewards(
  strategyAddress: Address,
  rewards: Address,
  transaction: Transaction
): void {
  let txHash = transaction.hash.toHexString();
  log.info(
    '[Strategy Mapping] Handle UpdatedRewards {} strategy {} and TxHash {}',
    [rewards.toHexString(), strategyAddress.toHexString(), txHash]
  );
  let strategyId = buildId(strategyAddress);
  let strategy = Strategy.load(strategyId);
  if (strategy !== null) {
    strategy.rewards = rewards;
    strategy.save();
  } else {
    log.warning('UpdatedRewards {} Strategy {} not found in TxHash {}', [
      rewards.toHexString(),
      strategyAddress.toHexString(),
      txHash,
    ]);
  }
}

export function updateMaxDebtPerHarvest(
  vaultAddress: Address,
  strategyAddress: Address,
  maxDebtPerHarvest: BigInt,
  transaction: Transaction
): void {
  let strategyId = buildId(strategyAddress);
  let txHash = transaction.hash.toHexString();
  log.info(
    '[Strategy Mapping] Update MaxDebtPerHarvest for strategy {} tx {}',
    [strategyId, txHash]
  );

  let vaultId = vaultAddress.toHexString();
  let vault = Vault.load(vaultId);
  if (!vault) {
    log.critical(
      '[Strategy Mapping] Vault entity does not exist: {} updateMaxDebtPerHarvest tx {}',
      [vaultId, txHash]
    );
    return;
  }

  let strategy = Strategy.load(strategyId);
  if (!strategy) {
    log.critical(
      '[Strategy Mapping] Strategy entity does not exist: {} updateMaxDebtPerHarvest tx {}',
      [strategyId, txHash]
    );
    return;
  }

  if (strategy.vault != vaultId) {
    log.critical(
      '[Strategy Mapping] Strategy entity {} is not linked to this vault: {} tx: {}',
      [strategyId, vaultId, txHash]
    );
    return;
  }

  strategy.maxDebtPerHarvest = maxDebtPerHarvest;
  strategy.save();
}

export function updateMinDebtPerHarvest(
  vaultAddress: Address,
  strategyAddress: Address,
  minDebtPerHarvest: BigInt,
  transaction: Transaction
): void {
  let strategyId = buildId(strategyAddress);
  let txHash = transaction.hash.toHexString();
  log.info(
    '[Strategy Mapping] Update minDebtPerHarvest for strategy {} tx {}',
    [strategyId, txHash]
  );

  let vaultId = vaultAddress.toHexString();
  let vault = Vault.load(vaultId);
  if (!vault) {
    log.critical(
      '[Strategy Mapping] Vault entity does not exist: {} minDebtPerHarvest tx {}',
      [vaultId, txHash]
    );
    return;
  }

  let strategy = Strategy.load(strategyId);
  if (!strategy) {
    log.critical(
      '[Strategy Mapping] Strategy entity does not exist: {} minDebtPerHarvest tx {}',
      [strategyId, txHash]
    );
    return;
  }
  if (strategy.vault != vaultId) {
    log.critical(
      '[Strategy Mapping] Strategy entity {} is not linked to this vault: {} tx: {}',
      [strategyId, vaultId, txHash]
    );
    return;
  }

  strategy.minDebtPerHarvest = minDebtPerHarvest;
  strategy.save();
}

export function updatePerformanceFee(
  vaultAddress: Address,
  strategyAddress: Address,
  performanceFee: BigInt,
  transaction: Transaction
): void {
  let strategyId = buildId(strategyAddress);
  let txHash = transaction.hash.toHexString();
  log.info('[Strategy Mapping] Update performanceFee for strategy {} tx {}', [
    strategyId,
    txHash,
  ]);

  let vaultId = vaultAddress.toHexString();
  let vault = Vault.load(vaultId);
  if (!vault) {
    log.critical(
      '[Strategy Mapping] Vault entity does not exist: {} performanceFee tx {}',
      [vaultId, txHash]
    );
    return;
  }

  let strategy = Strategy.load(strategyId);
  if (!strategy) {
    log.critical(
      '[Strategy Mapping] Strategy entity does not exist: {} performanceFee tx {}',
      [strategyId, txHash]
    );
    return;
  }

  if (strategy.vault != vaultId) {
    log.critical(
      '[Strategy Mapping] Strategy entity {} is not linked to this vault: {} tx: {}',
      [strategyId, vaultId, txHash]
    );
    return;
  }

  strategy.performanceFeeBps = performanceFee;
  strategy.save();
}
