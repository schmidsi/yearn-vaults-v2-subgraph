import { Deposit1Call, Deposit2Call } from '../../generated/Registry/Vault';
import {
  BigInt,
  ethereum,
  log,
  Address,
  Bytes,
  ByteArray,
} from '@graphprotocol/graph-ts';
import { newMockCall } from 'matchstick-as';

export function createMockDeposit1Call(
  transactionHash: Bytes,
  vaultAddress: Address,
  recipientUserAccountAddress: Address,
  sharesMinted: BigInt
): Deposit1Call {
  let mockCall = newMockCall();
  mockCall.transaction.hash = transactionHash;

  let newDepositCall = new Deposit1Call(
    vaultAddress,
    recipientUserAccountAddress,
    mockCall.block,
    mockCall.transaction,
    mockCall.inputValues,
    mockCall.outputValues
  );

  newDepositCall.outputValues = new Array();
  let sharesMintedParam = new ethereum.EventParam(
    'value0',
    ethereum.Value.fromUnsignedBigInt(sharesMinted)
  );

  newDepositCall.outputValues.push(sharesMintedParam);
  return newDepositCall;
}
