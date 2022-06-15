import { MockBlock } from '../mappingParamBuilders/mockBlock';
import { VaultStub } from '../stubs/vaultStateStub';
import { StrategyStub } from '../stubs/strategyStateStub';
import { StrategyAddedEventBuilder } from '../mappingParamBuilders/strategyParamBuilder';
import { handleStrategyAddedV1 } from '../../src/mappings/vaultMappings';

/**
 * Using the provided vaultStub/strategyStub, emulate a strategy being added to a vault using handleStrategyAddedV1.
 */
export class CreateStrategyTransition {
  static DefaultAddress: string = StrategyStub.DefaultAddress;

  static DefaultStrategy(
    vaultStub: VaultStub,
    address: string = StrategyStub.DefaultAddress
  ): CreateStrategyTransition {
    let strategyStub = new StrategyStub(
      null,
      address,
      vaultStub.shareToken.address,
      null,
      true,
      vaultStub.wantToken,
      null,
      false,
      false,
      null,
      null,
      null
    );

    return new CreateStrategyTransition(
      vaultStub,
      null, // debt limit
      null, // rate limit
      null, // performance fee
      strategyStub // strategyStub
    );
  }

  static DefaultStrategyWithDebt(
    vaultStub: VaultStub,
    outstandingDebt: string
  ): CreateStrategyTransition {
    let stub = new StrategyStub(
      null,
      null,
      vaultStub.shareToken.address,
      null,
      true,
      vaultStub.wantToken,
      null,
      false,
      false,
      null,
      null,
      null
    );

    stub.wantToken.setAccountBalance(stub.address, outstandingDebt);

    return new CreateStrategyTransition(
      vaultStub,
      outstandingDebt, // debt limit
      null, // rate limit
      null, // performance fee
      stub // strategyStub
    );
  }

  stub: StrategyStub;

  mockEvent: StrategyAddedEventBuilder;

  constructor(
    vaultStub: VaultStub,
    debtLimit: string | null,
    rateLimit: string | null,
    performanceFee: string | null,
    stub: StrategyStub | null,
    version: string = 'v1'
  ) {
    if (stub) {
      this.stub = stub;
    } else {
      this.stub = StrategyStub.DefaultStrategyStub(vaultStub);
    }
    let debtLimitToUse: string = '0';
    let rateLimitToUse: string = '0';
    let performanceFeeToUse: string = '100';
    if (debtLimit) {
      debtLimitToUse = debtLimit;
    }
    if (rateLimit) {
      rateLimitToUse = rateLimit;
    }
    if (performanceFee) {
      performanceFeeToUse = performanceFee;
    }

    this.mockEvent = new StrategyAddedEventBuilder(
      vaultStub.shareToken.address,
      this.stub.address,
      debtLimitToUse,
      performanceFeeToUse,
      rateLimitToUse,
      null,
      null
    );

    handleStrategyAddedV1(this.mockEvent.mock);
    MockBlock.IncrementBlock();
  }
}
