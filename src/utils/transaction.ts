import { log, BigInt, ethereum, Bytes, Address } from '@graphprotocol/graph-ts';
import { Transaction } from '../../generated/schema';
import { getTimestampInMillis } from './commons';
import { ZERO_ADDRESS } from './constants';

export function getOrCreateTransactionFromEvent(
  event: ethereum.Event,
  action: string
): Transaction {
  log.debug('[Transaction] Get or create transaction hash {} from event {}', [
    event.transaction.hash.toHexString(),
    action,
  ]);
  let transaction = _getOrCreateTransaction(
    event.transaction,
    event.logIndex,
    event.block,
    action
  );
  return transaction;
}

export function getOrCreateTransactionFromCall(
  call: ethereum.Call,
  action: string
): Transaction {
  log.debug(
    '[Transaction] Get or create transaction hash {} from call action {}',
    [call.transaction.hash.toHexString(), action]
  );
  let transaction = _getOrCreateTransaction(
    call.transaction,
    call.transaction.index, // As the call hasnt the event log inde, we use the transaction index value. Will this cause an accounting error if someone deposits and withdraws from a vault in the same transaction?
    call.block,
    action
  );
  return transaction;
}

export function getTransactionId(
  transactionHash: string,
  logIndex: string
): string {
  return transactionHash.concat('-').concat(logIndex.toString());
}

function _getOrCreateTransaction(
  ethTransaction: ethereum.Transaction,
  logIndex: BigInt,
  block: ethereum.Block,
  action: string
): Transaction {
  log.info(
    '[Transaction] Get or create transaction for hash {}. Action: {} Log Index: {} Tx Index: {}',
    [
      ethTransaction.hash.toHexString(),
      action,
      logIndex.toString(),
      ethTransaction.index.toString(),
    ]
  );
  let id = getTransactionId(
    ethTransaction.hash.toHexString(),
    logIndex.toString()
  );
  let transaction = Transaction.load(id);
  if (transaction == null) {
    // Special handling for contract creates since ethTransaction.to will be null.
    let toAddress: Bytes = Address.fromHexString(ZERO_ADDRESS) as Bytes;
    if (ethTransaction.to) {
      toAddress = ethTransaction.to as Bytes;
    }
    transaction = new Transaction(id);
    transaction.logIndex = logIndex;
    transaction.from = ethTransaction.from;
    transaction.gasPrice = ethTransaction.gasPrice;
    transaction.gasLimit = ethTransaction.gasLimit;
    transaction.hash = ethTransaction.hash;
    transaction.index = ethTransaction.index;
    transaction.to = toAddress;
    transaction.value = ethTransaction.value;
    transaction.timestamp = getTimestampInMillis(block);
    transaction.blockGasLimit = block.gasLimit;
    transaction.blockNumber = block.number;
    transaction.event = action;
    transaction.save();
  }

  return transaction;
}
