import {
  handleWithdraw,
  handleWithdrawEvent,
} from '../../src/mappings/vaultMappings';
import { MockBlock } from '../mappingParamBuilders/mockBlock';
import {
  WithdrawCallBuilder,
  MockWithdrawBuilder,
} from '../mappingParamBuilders/withdrawParamBuilder';
import { VaultStub } from '../stubs/vaultStateStub';
import { GenericWithdrawTransition } from './genericWithdrawTransition';

export class WithdrawCallTransition extends GenericWithdrawTransition {
  mockCall: WithdrawCallBuilder;

  constructor(
    preWithdrawStub: VaultStub,
    tokensWithdrawn: string,
    sharesBurned: string,
    recipient: string
  ) {
    super(preWithdrawStub, tokensWithdrawn, sharesBurned, recipient);

    // create call
    this.mockCall = new WithdrawCallBuilder(
      this.recipient,
      this.sharesBurnt,
      this.tokensWithdrawn,
      this.postWithdrawStub,
      null,
      null
    );

    handleWithdraw(this.mockCall.mock);

    MockBlock.IncrementBlock();
  }
}

export class WithdrawEventTransition extends GenericWithdrawTransition {
  mockEvent: MockWithdrawBuilder;

  constructor(
    preWithdrawStub: VaultStub,
    tokensWithdrawn: string,
    sharesBurned: string,
    recipient: string
  ) {
    super(preWithdrawStub, tokensWithdrawn, sharesBurned, recipient);

    // create call
    this.mockEvent = new MockWithdrawBuilder(
      this.recipient,
      this.sharesBurnt,
      this.tokensWithdrawn,
      this.postWithdrawStub,
      null,
      null
    );

    handleWithdrawEvent(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}
