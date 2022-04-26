import {
  handleDeposit,
  handleDepositEvent,
  handleDepositWithAmount,
  handleDepositWithAmountAndRecipient,
} from '../../src/mappings/vaultMappings';
import { defaults } from '../default';
import { MockBlock } from '../mappingParamBuilders/mockBlock';
import {
  DepositCallBuilder,
  DepositEventBuilder,
  DepositWithAmountAndRecipientCallBuilder,
  DepositWithAmountCallBuilder,
} from '../mappingParamBuilders/depositParamBuilder';
import { VaultStub } from '../stubs/vaultStateStub';
import { GenericDepositTransition } from './genericDepositTransition';

export class DepositCallTransition extends GenericDepositTransition {
  mockCall: DepositCallBuilder;

  constructor(
    preDepositStub: VaultStub,
    tokensDeposited: string,
    sharesMinted: string,
    senderAddress: string
  ) {
    super(preDepositStub, tokensDeposited, sharesMinted, senderAddress, false);

    this.mockCall = new DepositCallBuilder(
      defaults.senderAddress,
      this.tokensDeposited,
      this.postDepositStub,
      null,
      null
    );

    handleDeposit(this.mockCall.mock);

    MockBlock.IncrementBlock();
  }
}

export class DepositWithAmountCallTransition extends GenericDepositTransition {
  mockCall: DepositWithAmountCallBuilder;

  constructor(
    preDepositStub: VaultStub,
    tokensDeposited: string,
    sharesMinted: string,
    recipient: string,
    suppressMinimumBalanceErrors: boolean
  ) {
    super(
      preDepositStub,
      tokensDeposited,
      sharesMinted,
      recipient,
      suppressMinimumBalanceErrors
    );

    this.mockCall = new DepositWithAmountCallBuilder(
      recipient,
      sharesMinted,
      tokensDeposited,
      this.postDepositStub,
      null,
      null
    );

    handleDepositWithAmount(this.mockCall.mock);

    MockBlock.IncrementBlock();
  }
}

export class DepositWithAmountAndRecipientCallTransition extends GenericDepositTransition {
  mockCall: DepositWithAmountAndRecipientCallBuilder;

  constructor(
    preDepositStub: VaultStub,
    tokensDeposited: string,
    sharesMinted: string,
    recipient: string,
    benefactor: string
  ) {
    super(preDepositStub, tokensDeposited, sharesMinted, recipient, false);

    this.mockCall = new DepositWithAmountAndRecipientCallBuilder(
      recipient,
      benefactor,
      sharesMinted,
      tokensDeposited,
      this.postDepositStub,
      null,
      null
    );

    handleDepositWithAmountAndRecipient(this.mockCall.mock);

    MockBlock.IncrementBlock();
  }
}

export class DepositEventTransition extends GenericDepositTransition {
  mockEvent: DepositEventBuilder;

  constructor(
    preDepositStub: VaultStub,
    tokensDeposited: string,
    sharesMinted: string,
    senderAddress: string
  ) {
    super(preDepositStub, tokensDeposited, sharesMinted, senderAddress, false);

    this.mockEvent = new DepositEventBuilder(
      senderAddress,
      this.tokensDeposited,
      this.sharesMinted,
      this.postDepositStub,
      null,
      null
    );

    handleDepositEvent(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}
