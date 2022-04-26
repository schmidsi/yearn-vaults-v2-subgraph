import { MockTransaction } from '../mappingParamBuilders/mockTransaction';
import { assert } from 'matchstick-as/assembly/index';
import { MockBlock } from '../mappingParamBuilders/mockBlock';

export function validateTransactionState(
  txnParams: MockTransaction,
  blockParams: MockBlock
): void {
  // note: the event name field is not tested
  assert.fieldEquals(
    'Transaction',
    txnParams.entityId,
    'id',
    txnParams.entityId
  );
  assert.fieldEquals(
    'Transaction',
    txnParams.entityId,
    'logIndex',
    txnParams.logIndex
  );
  assert.fieldEquals(
    'Transaction',
    txnParams.entityId,
    'from',
    txnParams.fromAddress
  );
  assert.fieldEquals(
    'Transaction',
    txnParams.entityId,
    'gasPrice',
    txnParams.gasPrice
  );
  assert.fieldEquals(
    'Transaction',
    txnParams.entityId,
    'gasLimit',
    txnParams.gasLimit
  );
  assert.fieldEquals(
    'Transaction',
    txnParams.entityId,
    'hash',
    txnParams.txnHash
  );
  assert.fieldEquals(
    'Transaction',
    txnParams.entityId,
    'index',
    txnParams.txnIndex
  );
  assert.fieldEquals(
    'Transaction',
    txnParams.entityId,
    'to',
    txnParams.toAddress
  );
  assert.fieldEquals(
    'Transaction',
    txnParams.entityId,
    'value',
    txnParams.sentValue
  );
  assert.fieldEquals(
    'Transaction',
    txnParams.entityId,
    'timestamp',
    blockParams.timestamp + '000'
  );
  assert.fieldEquals(
    'Transaction',
    txnParams.entityId,
    'blockGasLimit',
    blockParams.gasLimit
  );
  assert.fieldEquals(
    'Transaction',
    txnParams.entityId,
    'blockNumber',
    blockParams.blockNumber
  );
  return;
}
