import {
  AddStrategy1Call as AddStrategyV2Call,
  AddStrategyCall as AddStrategyV1Call,
} from '../../generated/Registry/Vault';
import {
  BigInt,
  ethereum,
  log,
  Address,
  ByteArray,
  Bytes,
} from '@graphprotocol/graph-ts';
import { defaults } from '../default';
import { newMockEvent } from 'matchstick-as';
import {
  Harvested as HarvestedEvent,
  Cloned as ClonedEvent,
  SetHealthCheckCall,
  SetDoHealthCheckCall,
} from '../../generated/templates/Vault/Strategy';

export function createMockHarvestedEvent(
  transactionHash: string,
  strategyAddress: Address,
  profit: BigInt,
  loss: BigInt,
  debtPayment: BigInt,
  debtOutstanding: BigInt
): HarvestedEvent {
  let mockEvent = newMockEvent();
  mockEvent.transaction.hash = Bytes.fromByteArray(
    ByteArray.fromHexString(transactionHash)
  );
  let harvestedEvent = new HarvestedEvent(
    strategyAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
  harvestedEvent.parameters = new Array();

  let profitParam = new ethereum.EventParam(
    'profit',
    ethereum.Value.fromUnsignedBigInt(profit)
  );
  let lossParam = new ethereum.EventParam(
    'loss',
    ethereum.Value.fromUnsignedBigInt(loss)
  );
  let debtPaymentParam = new ethereum.EventParam(
    'debtPayment',
    ethereum.Value.fromUnsignedBigInt(debtPayment)
  );
  let debtOutstandingParam = new ethereum.EventParam(
    'debtOutstanding',
    ethereum.Value.fromUnsignedBigInt(debtOutstanding)
  );

  harvestedEvent.parameters.push(profitParam);
  harvestedEvent.parameters.push(lossParam);
  harvestedEvent.parameters.push(debtPaymentParam);
  harvestedEvent.parameters.push(debtOutstandingParam);

  return harvestedEvent;
}
