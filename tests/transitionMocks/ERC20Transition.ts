import { BigInt, log } from '@graphprotocol/graph-ts';
import { MockBlock } from '../mappingParamBuilders/mockBlock';
import { TokenStub } from '../stubs/tokenStateStub';
import { handleTransfer } from '../../src/mappings/vaultMappings';
import { TransferEventBuilder } from '../mappingParamBuilders/transferParamBuilder';
import { BIGINT_ZERO, ZERO_ADDRESS } from '../../src/utils/constants';
import { fatalTestError } from '../util';

export class TransferERC20Transition {
  preTransitionStub: TokenStub;
  postTransitionStub: TokenStub;

  mockEvent: TransferEventBuilder;

  constructor(
    sender: string,
    recipient: string,
    amount: string,
    stub: TokenStub,
    skipTransferHandler: boolean
  ) {
    this.preTransitionStub = stub;

    if (!this.preTransitionStub.hasAccountBalance(sender)) {
      fatalTestError(
        'Cannot create ERC20 transfer transition. Account {} does not exist.',
        [sender]
      );
    }

    let senderBalance = BigInt.fromString(
      this.preTransitionStub.getAccountBalance(sender)
    );
    let amountInt = BigInt.fromString(amount);
    if (senderBalance.lt(amountInt)) {
      fatalTestError(
        'Cannot create ERC20 transfer transition. Account {} only has {} tokens and is trying to send {}.',
        [sender, senderBalance.toString(), amount]
      );
    }

    let recipientBalance = BIGINT_ZERO;
    if (this.preTransitionStub.hasAccountBalance(recipient)) {
      recipientBalance = BigInt.fromString(
        this.preTransitionStub.getAccountBalance(recipient)
      );
    }

    let postTransitionStub = stub.clone();
    let newSenderBalance = senderBalance.minus(amountInt);
    let newRecipientBalance = recipientBalance.plus(amountInt);

    postTransitionStub.setAccountBalance(sender, newSenderBalance.toString());
    postTransitionStub.setAccountBalance(
      recipient,
      newRecipientBalance.toString()
    );
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new TransferEventBuilder(
      stub.address,
      sender,
      recipient,
      amount,
      null,
      null
    );

    if (!skipTransferHandler) {
      handleTransfer(this.mockEvent.mock);
      MockBlock.IncrementBlock();
    }
  }
}

export class MintERC20Transition {
  preTransitionStub: TokenStub;
  postTransitionStub: TokenStub;

  mockEvent: TransferEventBuilder;

  constructor(
    recipient: string,
    amount: string,
    stub: TokenStub,
    skipTransferHandler: boolean
  ) {
    this.preTransitionStub = stub;

    let recipientBalance = BIGINT_ZERO;
    if (this.preTransitionStub.hasAccountBalance(recipient)) {
      recipientBalance = BigInt.fromString(
        this.preTransitionStub.getAccountBalance(recipient)
      );
    }

    let postTransitionStub = stub.clone();
    let newRecipientBalance = recipientBalance.plus(BigInt.fromString(amount));

    postTransitionStub.setAccountBalance(
      recipient,
      newRecipientBalance.toString()
    );
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new TransferEventBuilder(
      stub.address,
      ZERO_ADDRESS,
      recipient,
      amount,
      null,
      null
    );
    if (!skipTransferHandler) {
      handleTransfer(this.mockEvent.mock);
      MockBlock.IncrementBlock();
    }
  }
}

export class BurnERC20Transition {
  preTransitionStub: TokenStub;
  postTransitionStub: TokenStub;

  mockEvent: TransferEventBuilder;

  constructor(
    sender: string,
    amount: string,
    stub: TokenStub,
    skipTransferHandler: boolean
  ) {
    this.preTransitionStub = stub;

    stub.logBalances();

    if (!this.preTransitionStub.hasAccountBalance(sender)) {
      fatalTestError(
        'Cannot create ERC20 burn transition. Account {} does not exist.',
        [sender]
      );
    }

    let senderBalance = BigInt.fromString(
      this.preTransitionStub.getAccountBalance(sender)
    );
    let amountInt = BigInt.fromString(amount);
    if (senderBalance.lt(amountInt)) {
      fatalTestError(
        'Cannot create ERC20 burn transition. Account {} only has {} tokens and is trying to send {}.',
        [sender, senderBalance.toString(), amount]
      );
    }

    let postTransitionStub = stub.clone();
    let newSenderBalance = senderBalance.minus(amountInt);

    postTransitionStub.setAccountBalance(sender, newSenderBalance.toString());
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new TransferEventBuilder(
      stub.address,
      sender,
      ZERO_ADDRESS,
      amount,
      null,
      null
    );
    if (!skipTransferHandler) {
      handleTransfer(this.mockEvent.mock);
      MockBlock.IncrementBlock();
    }
  }
}
