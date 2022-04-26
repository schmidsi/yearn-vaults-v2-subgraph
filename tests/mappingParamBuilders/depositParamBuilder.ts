import { MockBlock } from './mockBlock';
import { MockTransaction } from './mockTransaction';
import {
  Deposit1Call as DepositCall,
  Deposit1Call as DepositWithAmountCall,
  Deposit2Call as DepositWithAmountAndRecipientCall,
  Deposit as DepositEvent,
} from '../../generated/Registry/Vault';
import { ethereum, BigInt, Address } from '@graphprotocol/graph-ts';
import { VaultStub } from '../stubs/vaultStateStub';
import { ParamFactoryBase } from './paramFactoryBase';

export class DepositCallBuilder extends ParamFactoryBase {
  sharesMinted: string;
  vault: VaultStub;
  recipient: string;

  mock: DepositCall;

  constructor(
    recipient: string,
    sharesMinted: string,
    mockVault: VaultStub,
    transaction: MockTransaction | null,
    mockBlock: MockBlock | null
  ) {
    super(transaction, mockBlock);

    this.vault = mockVault;
    this.recipient = recipient;
    this.sharesMinted = sharesMinted;

    // create the mock itself
    let callOutputValues = new Array<ethereum.EventParam>();

    callOutputValues.push(
      new ethereum.EventParam(
        'value0',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(this.sharesMinted))
      )
    );

    let depositCall = new DepositCall(
      Address.fromString(this.vault.shareToken.address),
      Address.fromString(this.recipient),
      this.block.mock,
      this.transaction.mock,
      new Array<ethereum.EventParam>(), // params
      callOutputValues // output values
    );

    this.mock = depositCall;
  }
}

export class DepositWithAmountCallBuilder extends ParamFactoryBase {
  sharesMinted: string;
  tokensDeposited: string;
  vault: VaultStub;
  recipient: string;

  mock: DepositWithAmountCall;

  constructor(
    recipient: string,
    sharesMinted: string,
    tokensDeposited: string,
    mockVault: VaultStub,
    transaction: MockTransaction | null,
    mockBlock: MockBlock | null
  ) {
    super(transaction, mockBlock);

    this.vault = mockVault;
    this.recipient = recipient;
    this.sharesMinted = sharesMinted;
    this.tokensDeposited = tokensDeposited;

    // create the mock itself
    let paramValues = new Array<ethereum.EventParam>();
    paramValues.push(
      new ethereum.EventParam(
        'amount',
        ethereum.Value.fromUnsignedBigInt(
          BigInt.fromString(this.tokensDeposited)
        )
      )
    );

    let callOutputValues = new Array<ethereum.EventParam>();

    callOutputValues.push(
      new ethereum.EventParam(
        'value0',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(this.sharesMinted))
      )
    );

    let depositCall = new DepositWithAmountCall(
      Address.fromString(this.vault.shareToken.address),
      Address.fromString(this.recipient),
      this.block.mock,
      this.transaction.mock,
      paramValues, // params
      callOutputValues // output values
    );

    this.mock = depositCall;
  }
}

export class DepositWithAmountAndRecipientCallBuilder extends ParamFactoryBase {
  sharesMinted: string;
  tokensDeposited: string;
  vault: VaultStub;
  recipient: string;
  benefactor: string;

  mock: DepositWithAmountAndRecipientCall;

  constructor(
    recipient: string,
    benefactor: string,
    sharesMinted: string,
    tokensDeposited: string,
    mockVault: VaultStub,
    transaction: MockTransaction | null,
    mockBlock: MockBlock | null
  ) {
    super(transaction, mockBlock);

    this.vault = mockVault;
    this.recipient = recipient;
    this.benefactor = benefactor;
    this.sharesMinted = sharesMinted;
    this.tokensDeposited = tokensDeposited;

    // create the mock itself
    let paramValues = new Array<ethereum.EventParam>();
    paramValues.push(
      new ethereum.EventParam(
        'amount',
        ethereum.Value.fromUnsignedBigInt(
          BigInt.fromString(this.tokensDeposited)
        )
      )
    );

    paramValues.push(
      new ethereum.EventParam(
        'recipient',
        ethereum.Value.fromAddress(Address.fromString(this.recipient))
      )
    );

    let callOutputValues = new Array<ethereum.EventParam>();

    callOutputValues.push(
      new ethereum.EventParam(
        'value0',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(this.sharesMinted))
      )
    );

    let depositCall = new DepositWithAmountAndRecipientCall(
      Address.fromString(this.vault.shareToken.address),
      Address.fromString(this.benefactor),
      this.block.mock,
      this.transaction.mock,
      paramValues, // params
      callOutputValues // output values
    );

    this.mock = depositCall;
  }
}

export class DepositEventBuilder extends ParamFactoryBase {
  sharesMinted: string;
  tokensDeposited: string;
  recipient: string;
  vault: VaultStub;

  mock: DepositEvent;

  constructor(
    recipient: string,
    tokensDeposited: string,
    sharesMinted: string,
    mockVault: VaultStub,
    transaction: MockTransaction | null,
    mockBlock: MockBlock | null
  ) {
    super(transaction, mockBlock);

    this.vault = mockVault;
    this.recipient = recipient;
    this.sharesMinted = sharesMinted;
    this.tokensDeposited = tokensDeposited;
    this.recipient = recipient;

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
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(tokensDeposited))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'shares',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(sharesMinted))
      )
    );

    let depositEvent = new DepositEvent(
      Address.fromString(this.vault.shareToken.address),
      BigInt.fromString(this.transaction.logIndex),
      BigInt.fromString(this.transaction.txnIndex),
      'default_log_type',
      this.block.mock,
      this.transaction.mock,
      eventParams
    );

    this.mock = depositEvent;
  }
}
