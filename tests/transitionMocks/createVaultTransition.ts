import { Address, log } from '@graphprotocol/graph-ts';
import { handleNewReleaseInner } from '../../src/mappings/registryMappings';
import { MockBlock } from '../mappingParamBuilders/mockBlock';
import { NewReleaseEventBuilder } from '../mappingParamBuilders/registryParamBuilder';
import { TokenStub } from '../stubs/tokenStateStub';
import { VaultStub } from '../stubs/vaultStateStub';

export class CreateVaultTransition {
  static DefaultAddress: string = VaultStub.DefaultAddress;

  static DefaultVault(): CreateVaultTransition {
    return new CreateVaultTransition(
      new VaultStub(
        null, // total supply
        null, // total assets
        null, // total debt
        null, // price per share
        null, // performance fee
        null, // management fee
        null, // activation
        null, // apiVersion
        null, // rewardsAddress
        null, // guardianAddress
        null, // managementAddress
        null, // governanceAddress
        null, // depositLimit
        null, // availableDepositLimit
        new TokenStub( //shareToken
          VaultStub.DefaultAddress, // token address
          'DAI yVault', // token name
          null, // token decimals
          'yvDAI', // token symbol
          null, // token balances
          null, // token usdc value
          null // price oracle address
        ),
        new TokenStub( // wantToken
          TokenStub.DefaultTokenAddress, // token address
          null, // token name
          null, // token decimals
          null, // token symbol
          null, // token balances
          null, // token usdc value
          null // price oracle address
        ),
        null // withDrawlQueue
      ),
      null, // registryAddress
      null, // releaseId
      null // apiVersion
    );
  }

  static DefaultVaultWithDepositedBalance(
    numTokens: string,
    beneficiary: string
  ): CreateVaultTransition {
    let wantTokenBalances = new Map<string, string>();
    wantTokenBalances.set(VaultStub.DefaultAddress, numTokens);
    let shareTokenBalances = new Map<string, string>();
    shareTokenBalances.set(beneficiary, numTokens);
    let stub = new VaultStub(
      numTokens, // total supply
      numTokens, // total assets
      null, // total debt
      null, // price per share
      null, // performance fee
      null, // management fee
      null, // activation
      null, // apiVersion
      null, // rewardsAddress
      null, // guardianAddress
      null, // managementAddress
      null, // governanceAddress
      null, // depositLimit
      null, // availableDepositLimit
      new TokenStub( //shareToken
        VaultStub.DefaultAddress, // token address
        'DAI yVault', // token name
        null, // token decimals
        'yvDAI', // token symbol
        shareTokenBalances, // token balances
        null, // token usdc value
        null // price oracle address
      ),
      new TokenStub( // wantToken
        TokenStub.DefaultTokenAddress, // token address
        null, // token name
        null, // token decimals
        null, // token symbol
        wantTokenBalances, // token balances
        null, // token usdc value
        null // price oracle address
      ),
      null
    );

    return new CreateVaultTransition(
      stub,
      null, // registryAddress
      null, // releaseId
      null // apiVersion
    );
  }

  static DefaultVaultWithUnDepositedBalances(
    wantTokenBalances: Map<string, string>,
    shareTokenBalances: Map<string, string>
  ): CreateVaultTransition {
    let stub = new VaultStub(
      null, // total supply
      null, // total assets
      null, // total debt
      null, // price per share
      null, // performance fee
      null, // management fee
      null, // activation
      null, // apiVersion
      null, // rewardsAddress
      null, // guardianAddress
      null, // managementAddress
      null, // governanceAddress
      null, // depositLimit
      null, // availableDepositLimit

      new TokenStub( //shareToken
        VaultStub.DefaultAddress, // token address
        'DAI yVault', // token name
        null, // token decimals
        'yvDAI', // token symbol
        shareTokenBalances, // token balances
        null, // token usdc value
        null // price oracle address
      ),
      new TokenStub( // wantToken
        TokenStub.DefaultTokenAddress, // token address
        null, // token name
        null, // token decimals
        null, // token symbol
        wantTokenBalances, // token balances
        null, // token usdc value
        null // price oracle address
      ),
      null
    );

    return new CreateVaultTransition(
      stub,
      null, // registryAddress
      null, // releaseId
      null // apiVersion
    );
  }

  stub: VaultStub;
  releaseEvent: NewReleaseEventBuilder;

  constructor(
    stub: VaultStub | null,
    registryAddress: string | null,
    releaseId: string | null,
    apiVersion: string | null
  ) {
    if (stub) {
      this.stub = stub;
    } else {
      let wantToken = TokenStub.DefaultToken(TokenStub.DefaultTokenAddress);
      let shareToken = new TokenStub(
        VaultStub.DefaultAddress, // token address
        'DAI yVault', // token name
        null, // token decimals
        'yvDAI', // token symbol
        null, // token balances
        null, // token usdc value
        null // price oracle address
      );
      this.stub = new VaultStub(
        null, // total supply
        null, // total assets
        null, // total debt
        null, // price per share
        null, // performance fee
        null, // management fee
        null, // activation
        null, // apiVersion
        null, // rewardsAddress
        null, // guardianAddress
        null, // managementAddress
        null, // governanceAddress
        null, // depositLimit
        null, // availableDepositLimit
        shareToken, // shareToken
        wantToken, // wantToken
        null //withdrawlQueue
      );
    }

    this.releaseEvent = new NewReleaseEventBuilder(
      registryAddress, // registry address
      releaseId, // release id
      this.stub.shareToken.address, // template address
      apiVersion, // api Version
      null, // transaction
      null // block
    );

    // create entitiy
    handleNewReleaseInner(
      Address.fromString(this.releaseEvent.registryAddress),
      this.releaseEvent.mock
    );
    MockBlock.IncrementBlock();
  }
}
