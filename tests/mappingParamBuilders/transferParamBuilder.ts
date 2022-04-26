import { MockTransaction } from './mockTransaction';
import { MockBlock } from './mockBlock';
import { BigInt, ethereum, Address } from '@graphprotocol/graph-ts';
import { Transfer } from '../../generated/Registry/Vault';
import { ParamFactoryBase } from './paramFactoryBase';

export class TransferEventBuilder extends ParamFactoryBase {
  tokenAddress: string;
  senderAddress: string;
  recipientAddress: string;
  amount: string;

  mock: Transfer;

  constructor(
    tokenAddress: string,
    senderAddress: string,
    recipientAddress: string,
    amount: string,
    transaction: MockTransaction | null,
    block: MockBlock | null
  ) {
    super(transaction, block);

    this.tokenAddress = tokenAddress;
    this.senderAddress = senderAddress;
    this.recipientAddress = recipientAddress;
    this.amount = amount;

    // create the mock itself
    let eventParams = new Array<ethereum.EventParam>();

    eventParams.push(
      new ethereum.EventParam(
        'sender',
        ethereum.Value.fromAddress(Address.fromString(this.senderAddress))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'receiver',
        ethereum.Value.fromAddress(Address.fromString(this.recipientAddress))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'amount',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(this.amount))
      )
    );

    let transferEvent = new Transfer(
      Address.fromString(this.tokenAddress),
      BigInt.fromString(this.transaction.logIndex),
      BigInt.fromString(this.transaction.txnIndex),
      'default_log_type',
      this.block.mock,
      this.transaction.mock,
      eventParams
    );

    this.mock = transferEvent;
  }
}
