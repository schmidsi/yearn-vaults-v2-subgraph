import { NewVault } from '../../generated/Registry/Registry';
import {
  StrategyReported as StrategyReported_v0_3_0_v0_3_1_Event,
  StrategyReported1 as StrategyReportedEvent,
} from '../../generated/Registry/Vault';
import {
  BigInt,
  ethereum,
  log,
  Address,
  Bytes,
  ByteArray,
} from '@graphprotocol/graph-ts';
import { newMockEvent } from 'matchstick-as';

export function createMockNewVaultEvent(
  token: Address,
  deployment_id: i32,
  vault: Address,
  api_version: string
): NewVault {
  log.info('[TEST] Creating mock NewVaultEvent. Vault: {}  Want Token: {}', [
    vault.toHexString(),
    token.toHexString(),
  ]);

  let mockEvent = newMockEvent();
  let newVaultEvent = new NewVault(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
  newVaultEvent.parameters = new Array();

  let tokenParam = new ethereum.EventParam(
    'token',
    ethereum.Value.fromAddress(token)
  );
  let deployment_idParam = new ethereum.EventParam(
    'deployment_id',
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(deployment_id))
  );
  let vaultParam = new ethereum.EventParam(
    'vault',
    ethereum.Value.fromAddress(vault)
  );
  let api_versionParam = new ethereum.EventParam(
    'api_version',
    ethereum.Value.fromString(api_version)
  );

  newVaultEvent.parameters.push(tokenParam);
  newVaultEvent.parameters.push(deployment_idParam);
  newVaultEvent.parameters.push(vaultParam);
  newVaultEvent.parameters.push(api_versionParam);

  return newVaultEvent;
}

export function createMockStrategyReported_v3_0_v3_1_Event(
  txnHash: string,
  vaultAddress: Address,
  strategyAddress: Address,
  gain: BigInt,
  loss: BigInt,
  totalGain: BigInt,
  totalLoss: BigInt,
  totalDebt: BigInt,
  debtAdded: BigInt,
  debtLimit: BigInt
): StrategyReported_v0_3_0_v0_3_1_Event {
  let mockEvent = newMockEvent();
  let strategyReportedEvent = new StrategyReported_v0_3_0_v0_3_1_Event(
    vaultAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
  strategyReportedEvent.transaction.hash = Bytes.fromByteArray(
    ByteArray.fromHexString(txnHash)
  );
  strategyReportedEvent.parameters = new Array();

  let stratAddrParam = new ethereum.EventParam(
    'strategy',
    ethereum.Value.fromAddress(strategyAddress)
  );
  let gainParam = new ethereum.EventParam(
    'gain',
    ethereum.Value.fromUnsignedBigInt(gain)
  );
  let lossParam = new ethereum.EventParam(
    'loss',
    ethereum.Value.fromUnsignedBigInt(loss)
  );
  let totalGainParam = new ethereum.EventParam(
    'totalGain',
    ethereum.Value.fromUnsignedBigInt(totalGain)
  );
  let totalLossParam = new ethereum.EventParam(
    'totalLoss',
    ethereum.Value.fromUnsignedBigInt(totalLoss)
  );
  let totalDebtParam = new ethereum.EventParam(
    'totalDebt',
    ethereum.Value.fromUnsignedBigInt(totalDebt)
  );
  let debtAddedParam = new ethereum.EventParam(
    'debtAdded',
    ethereum.Value.fromUnsignedBigInt(debtAdded)
  );
  let debtLimitParam = new ethereum.EventParam(
    'debtLimit',
    ethereum.Value.fromUnsignedBigInt(debtLimit)
  );

  strategyReportedEvent.parameters.push(stratAddrParam);
  strategyReportedEvent.parameters.push(gainParam);
  strategyReportedEvent.parameters.push(lossParam);
  strategyReportedEvent.parameters.push(totalGainParam);
  strategyReportedEvent.parameters.push(totalLossParam);
  strategyReportedEvent.parameters.push(totalDebtParam);
  strategyReportedEvent.parameters.push(debtAddedParam);
  strategyReportedEvent.parameters.push(debtLimitParam);
  return strategyReportedEvent;
}
