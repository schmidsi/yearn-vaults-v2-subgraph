import { VaultStub } from '../stubs/vaultStateStub';
import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  MintERC20Transition,
  TransferERC20Transition,
} from './ERC20Transition';
import { handleTransfer } from '../../src/mappings/vaultMappings';
import { TransferEventBuilder } from '../mappingParamBuilders/transferParamBuilder';

export class GenericDepositTransition {
  preDepositStub: VaultStub;
  postDepositStub: VaultStub;

  tokensDeposited: string;
  sharesMinted: string;
  senderAddress: string;

  protected constructor(
    preDepositStub: VaultStub,
    tokensDeposited: string,
    sharesMinted: string,
    senderAddress: string,
    suppressMinimumBalanceErrors: boolean // used for testing issue #99
  ) {
    this.preDepositStub = preDepositStub;
    this.tokensDeposited = tokensDeposited;
    this.sharesMinted = sharesMinted;
    this.senderAddress = senderAddress;

    let vaultId = this.preDepositStub.address;

    let tokensSentToVault = this.tokensDeposited;
    if (suppressMinimumBalanceErrors) {
      // we need to manually resolve the amount that is actually being deposited
      let accountBalance = preDepositStub.wantToken.getAccountBalance(
        senderAddress
      );
      tokensSentToVault = accountBalance;
    }

    // account sends tokens to vault
    // be sure to skip the transferHandler. we only want it triggered once the transaction's final state is captured by the vault/strategy stubs
    let newWantTokenStub = new TransferERC20Transition(
      this.senderAddress,
      vaultId,
      tokensSentToVault,
      preDepositStub.wantToken,
      true // skipTransferHandler
    );

    if (suppressMinimumBalanceErrors) {
      // overwrite the TransferERC20Transition trigger with the value passed to this transition
      newWantTokenStub.mockEvent = new TransferEventBuilder(
        preDepositStub.wantToken.address,
        senderAddress,
        vaultId,
        this.tokensDeposited,
        newWantTokenStub.mockEvent.transaction,
        newWantTokenStub.mockEvent.block
      );
    }

    // mint shares
    let newShareTokenStub = new MintERC20Transition(
      this.senderAddress,
      this.sharesMinted,
      preDepositStub.shareToken,
      true // skipTransferHandler
    );

    let newShareSupply = GenericDepositTransition._calculateNewTotalSupply(
      this.preDepositStub,
      this.sharesMinted
    );

    newShareTokenStub.postTransitionStub.logBalances();
    newWantTokenStub.postTransitionStub.logBalances();

    // create new stub
    this.postDepositStub = new VaultStub(
      newShareSupply, // total supply
      newWantTokenStub.postTransitionStub.getAccountBalance(vaultId), // total assets
      preDepositStub.totalDebt, // total debt
      preDepositStub.pricePerShare, // price per share
      preDepositStub.performanceFee, // performance fee
      preDepositStub.managementFee, // management fee
      preDepositStub.activation, // activation
      preDepositStub.apiVersion, // apiVersion
      preDepositStub.rewardsAddress, // rewardsAddress
      preDepositStub.guardianAddress, // guardianAddress
      preDepositStub.managementAddress, // managementAddress
      preDepositStub.governanceAddress, // governanceAddress
      preDepositStub.depositLimit, // depositLimit
      preDepositStub.availableDepositLimit, // availableDepositLimit
      newShareTokenStub.postTransitionStub, // postTransitionStub
      newWantTokenStub.postTransitionStub, // postTransitionStub
      preDepositStub.withDrawlQueue // withdrawlQueue
    );

    // now trigger the transfer handlers that we skipped earlier
    handleTransfer(newWantTokenStub.mockEvent.mock);
    handleTransfer(newShareTokenStub.mockEvent.mock);
  }

  private static _calculateNewTotalSupply(
    preDepositStub: VaultStub,
    sharesMinted: string
  ): string {
    let oldShareSupply = BigInt.fromString(preDepositStub.totalSupply);
    let newShareSupply = oldShareSupply.plus(BigInt.fromString(sharesMinted));
    return newShareSupply.toString();
  }
}
