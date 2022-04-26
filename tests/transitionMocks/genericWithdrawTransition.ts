import { VaultStub } from '../stubs/vaultStateStub';
import { BigInt } from '@graphprotocol/graph-ts';
import {
  BurnERC20Transition,
  TransferERC20Transition,
} from './ERC20Transition';
import { handleTransfer } from '../../src/mappings/vaultMappings';
import { fatalTestError } from '../util';

export class GenericWithdrawTransition {
  preWithdrawStub: VaultStub;
  postWithdrawStub: VaultStub;

  tokensWithdrawn: string;
  sharesBurnt: string;
  recipient: string;

  protected constructor(
    preWithdrawStub: VaultStub,
    tokensWithdrawn: string,
    sharesBurnt: string,
    senderAddress: string
  ) {
    this.preWithdrawStub = preWithdrawStub;
    this.tokensWithdrawn = tokensWithdrawn;
    this.sharesBurnt = sharesBurnt;
    this.recipient = senderAddress;

    let vaultId = preWithdrawStub.address;

    let newShareSupply = GenericWithdrawTransition._calculateNewTotalSupply(
      this.preWithdrawStub,
      this.sharesBurnt
    );

    // vault sends tokens to account
    // account sends tokens to vault
    // be sure to skip the transferHandler. we only want it triggered once the transaction's final state is captured by the vault/strategy stubs
    let newWantTokenStub = new TransferERC20Transition(
      vaultId,
      this.recipient,
      this.tokensWithdrawn,
      preWithdrawStub.wantToken,
      true // skipTransferHandler
    );

    // burn shares
    // todo: this might have to be changed for withdrawWithRecipient
    let newShareTokenStub = new BurnERC20Transition(
      this.recipient,
      this.sharesBurnt,
      preWithdrawStub.shareToken,
      true // skipTransferHandler
    );

    // create new stub
    this.postWithdrawStub = new VaultStub(
      newShareSupply, // total supply
      newWantTokenStub.postTransitionStub.getAccountBalance(vaultId), // total assets
      preWithdrawStub.totalDebt, // total debt
      preWithdrawStub.pricePerShare, // price per share
      preWithdrawStub.performanceFee, // performance fee
      preWithdrawStub.managementFee, // management fee
      preWithdrawStub.activation, // activation
      preWithdrawStub.apiVersion, // apiVersion
      preWithdrawStub.rewardsAddress, // rewardsAddress
      preWithdrawStub.guardianAddress, // guardianAddress
      preWithdrawStub.managementAddress, // managementAddress
      preWithdrawStub.governanceAddress, // governanceAddress
      preWithdrawStub.depositLimit, // depositLimit
      preWithdrawStub.availableDepositLimit, // availableDepositLimit
      newShareTokenStub.postTransitionStub,
      newWantTokenStub.postTransitionStub
    );

    // now trigger the transfer handlers that we skipped earlier
    handleTransfer(newWantTokenStub.mockEvent.mock);
    handleTransfer(newShareTokenStub.mockEvent.mock);
  }

  private static _calculateNewTotalSupply(
    preWithdrawStub: VaultStub,
    sharesBurnt: string
  ): string {
    let oldShareSupplyInt = BigInt.fromString(preWithdrawStub.totalSupply);
    let sharesBurntInt = BigInt.fromString(sharesBurnt);
    if (sharesBurntInt.gt(oldShareSupplyInt)) {
      fatalTestError(
        'Trying to burn {} shares, but only {} shares are outstanding.',
        [sharesBurnt, preWithdrawStub.totalSupply]
      );
    }

    let newShareSupply = oldShareSupplyInt.minus(sharesBurntInt);

    return newShareSupply.toString();
  }
}
