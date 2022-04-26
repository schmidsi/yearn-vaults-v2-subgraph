import { MockBlock } from './mockBlock';
import { MockTransaction } from './mockTransaction';
import {
  Withdraw1Call as WithdrawCall,
  Withdraw1Call as WithdrawWithSharesCall,
  Withdraw2Call as WithdrawWithSharesAndRecipientCall,
  Withdraw as WithdrawEvent,
} from '../../generated/Registry/Vault';
import { ethereum, BigInt, Address } from '@graphprotocol/graph-ts';
import { VaultStub } from '../stubs/vaultStateStub';
import { ParamFactoryBase as ParamFactoryBase } from './paramFactoryBase';

export class WithdrawCallBuilder extends ParamFactoryBase {
  sharesBurnt: string;
  tokensReturned: string;
  senderAddress: string;
  vault: VaultStub;

  mock: WithdrawCall;

  constructor(
    senderAddress: string,
    sharesBurnt: string,
    tokensReturned: string,
    mockVault: VaultStub,
    transaction: MockTransaction | null,
    mockBlock: MockBlock | null
  ) {
    super(transaction, mockBlock);

    this.senderAddress = senderAddress;

    this.tokensReturned = tokensReturned;
    this.sharesBurnt = sharesBurnt;

    this.vault = mockVault;
    // create the mock itself
    let callOutputValues = new Array<ethereum.EventParam>();

    callOutputValues.push(
      new ethereum.EventParam(
        'value0',
        ethereum.Value.fromUnsignedBigInt(
          BigInt.fromString(this.tokensReturned)
        )
      )
    );

    let callParams = new Array<ethereum.EventParam>();

    callParams.push(
      new ethereum.EventParam(
        'shares',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(this.sharesBurnt))
      )
    );

    let withdrawCall = new WithdrawCall(
      Address.fromString(this.vault.shareToken.address),
      Address.fromString(this.senderAddress),
      this.block.mock,
      this.transaction.mock,
      callParams, // params
      callOutputValues // output values
    );

    this.mock = withdrawCall;
  }
}

export class MockWithdrawBuilder extends ParamFactoryBase {
  sharesBurnt: string;
  tokensReturned: string;
  recipient: string;
  vault: VaultStub;

  mock: WithdrawEvent;

  constructor(
    recipient: string,
    sharesBurnt: string,
    tokensReturned: string,
    mockVault: VaultStub,
    transaction: MockTransaction | null,
    mockBlock: MockBlock | null
  ) {
    super(transaction, mockBlock);

    this.recipient = recipient;

    this.tokensReturned = tokensReturned;
    this.sharesBurnt = sharesBurnt;

    this.vault = mockVault;

    if (transaction) {
      this.transaction = transaction;
    }
    if (mockBlock) {
      this.block = mockBlock;
    }

    // create the mock itself
    let eventParams = new Array<ethereum.EventParam>();

    eventParams.push(
      new ethereum.EventParam(
        'recipient',
        ethereum.Value.fromAddress(Address.fromString(recipient))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'amount',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(tokensReturned))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'shares',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(sharesBurnt))
      )
    );

    let withdrawEvent = new WithdrawEvent(
      Address.fromString(this.vault.shareToken.address),
      BigInt.fromString(this.transaction.logIndex),
      BigInt.fromString(this.transaction.txnIndex),
      'default_log_type',
      this.block.mock,
      this.transaction.mock,
      eventParams
    );

    this.mock = withdrawEvent;
  }
}
