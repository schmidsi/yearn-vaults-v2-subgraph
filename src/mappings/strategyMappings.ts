import {
  ethereum,
  log,
  BigInt,
  dataSource,
  Address,
} from '@graphprotocol/graph-ts';
import {
  Harvested as HarvestedEvent,
  Cloned as ClonedEvent,
  SetHealthCheckCall,
  SetDoHealthCheckCall,
  SetHealthCheck as SetHealthCheckEvent,
  SetDoHealthCheck as SetDoHealthCheckEvent,
  EmergencyExitEnabled,
  UpdatedKeeper,
  UpdatedStrategist,
  UpdatedRewards,
} from '../../generated/templates/Vault/Strategy';

import { Vault as VaultContract } from '../../generated/templates/Vault/Vault';
import * as strategyLibrary from '../utils/strategy/strategy';
import {
  getOrCreateTransactionFromCall,
  getOrCreateTransactionFromEvent,
} from '../utils/transaction';
import { booleanToString } from '../utils/commons';
import { UpdateRewards } from '../../generated/Registry/Vault';
import { Strategy } from '../../generated/schema';

export function handleSetHealthCheck(call: SetHealthCheckCall): void {
  let strategyAddress = call.to;
  let txHash = call.transaction.hash.toHexString();
  log.info(
    '[Strategy Mapping] Handle set health check {} in strategy {} and TX hash {}',
    [
      call.inputs._healthCheck.toHexString(),
      strategyAddress.toHexString(),
      txHash,
    ]
  );
  let transaction = getOrCreateTransactionFromCall(call, 'SetHealthCheck');
  strategyLibrary.healthCheckSet(
    strategyAddress,
    call.inputs._healthCheck,
    transaction
  );
}

export function handleSetHealthCheckEvent(event: SetHealthCheckEvent): void {
  let strategyAddress = event.address;
  let txHash = event.transaction.hash.toHexString();
  let newHealthCheckAddress = event.params.healthCheckAddress;
  log.info(
    '[Strategy Mapping] Handle set health check via event {} in strategy {} and TX hash {}',
    [newHealthCheckAddress.toHexString(), strategyAddress.toHexString(), txHash]
  );
  let transaction = getOrCreateTransactionFromEvent(event, 'SetHealthCheck');
  strategyLibrary.healthCheckSet(
    strategyAddress,
    newHealthCheckAddress,
    transaction
  );
}

export function handleSetDoHealthCheck(call: SetDoHealthCheckCall): void {
  let strategyAddress = call.to;
  let txHash = call.transaction.hash.toHexString();
  log.info(
    '[Strategy Mapping] Handle set do health check {} in strategy {} and TX hash {}',
    [
      booleanToString(call.inputs._doHealthCheck),
      strategyAddress.toHexString(),
      txHash,
    ]
  );
  let transaction = getOrCreateTransactionFromCall(call, 'SetDoHealthCheck');
  strategyLibrary.doHealthCheckSet(
    strategyAddress,
    call.inputs._doHealthCheck,
    transaction
  );
}

export function handleSetDoHealthCheckEvent(
  event: SetDoHealthCheckEvent
): void {
  let strategyAddress = event.address;
  let txHash = event.transaction.hash.toHexString();
  let healthCheckEnabled = event.params.doHealthCheck;
  log.info(
    '[Strategy Mapping] Handle set do health check via event {} in strategy {} and TX hash {}',
    [booleanToString(healthCheckEnabled), strategyAddress.toHexString(), txHash]
  );
  let transaction = getOrCreateTransactionFromEvent(event, 'SetDoHealthCheck');
  strategyLibrary.doHealthCheckSet(
    strategyAddress,
    healthCheckEnabled,
    transaction
  );
}

export function handleHarvested(event: HarvestedEvent): void {
  let contractAddress = event.address;
  let txHash = event.transaction.hash.toHexString();
  log.info(
    '[Strategy Mapping] Handle harvested in strategy {} and TX hash {}',
    [contractAddress.toHexString(), txHash]
  );
  let ethTransaction = getOrCreateTransactionFromEvent(event, 'Harvested');
  strategyLibrary.harvest(
    event.transaction.from,
    contractAddress,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash,
    event.transaction.index,
    event.params.profit,
    event.params.loss,
    event.params.debtPayment,
    event.params.debtOutstanding,
    ethTransaction
  );
}

export function handleCloned(event: ClonedEvent): void {
  let txHash = event.transaction.hash.toHexString();

  log.info('StrategyCloned txHash {} event.transaction.from {}', [
    event.transaction.from.toHexString(),
    txHash,
  ]);
  log.info('StrategyCloned txHash {} event.transaction.to {}', [
    event.transaction.to!.toHexString(),
    txHash,
  ]);
  log.info('StrategyCloned txHash {} event.transaction.input {}', [
    event.transaction.input.toHexString(),
    txHash,
  ]);
  log.info('StrategyCloned txHash {} event.address {}', [
    event.address.toHexString(),
    txHash,
  ]);
  log.info('StrategyCloned txHash {} event.params.clone {}', [
    event.params.clone.toHexString(),
    txHash,
  ]);

  let clonedStrategyAddress = event.params.clone;
  let strategyAddress = event.address;
  log.info('[Strategy Mapping] Handle cloned strategy {} and TX hash {}', [
    clonedStrategyAddress.toHexString(),
    txHash,
  ]);
  let ethTransaction = getOrCreateTransactionFromEvent(event, 'StrategyCloned');
  strategyLibrary.strategyCloned(
    clonedStrategyAddress,
    strategyAddress,
    ethTransaction
  );
}

export function handleEmergencyExitEnabled(event: EmergencyExitEnabled): void {
  let ethTransaction = getOrCreateTransactionFromEvent(
    event,
    'EmergencyExitEnabled'
  );

  strategyLibrary.emergencyExitEnabled(event.address, ethTransaction);
}

export function handleUpdatedKeeper(event: UpdatedKeeper): void {
  let ethTransaction = getOrCreateTransactionFromEvent(event, 'UpdatedKeeper');

  strategyLibrary.updatedKeeper(
    event.address,
    event.params.newKeeper,
    ethTransaction
  );
}

export function handleUpdatedStrategist(event: UpdatedStrategist): void {
  let ethTransaction = getOrCreateTransactionFromEvent(
    event,
    'UpdatedStrategist'
  );

  strategyLibrary.updatedStrategist(
    event.address,
    event.params.newStrategist,
    ethTransaction
  );
}

export function handleUpdatedRewards(event: UpdatedRewards): void {
  let ethTransaction = getOrCreateTransactionFromEvent(event, 'UpdatedRewards');

  strategyLibrary.updatedRewards(
    event.address,
    event.params.rewards,
    ethTransaction
  );
}
