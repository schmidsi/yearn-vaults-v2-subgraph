import { handleHarvested } from '../../src/mappings/strategyMappings';
import { handleStrategyReported_v0_3_0_v0_3_1 } from '../../src/mappings/vaultMappings';
import { StrategyStub } from '../stubs/strategyStateStub';
import { VaultStub } from '../stubs/vaultStateStub';
import { MockBlock } from '../mappingParamBuilders/mockBlock';
import {
  HarvestedEventBuilder,
  StrategyReported_v0_3_0_v0_3_1EventBuilder,
} from '../mappingParamBuilders/strategyParamBuilder';
import { MintERC20Transition } from './ERC20Transition';

export class HarvestedTransition {
  mockEvent: HarvestedEventBuilder;

  preHarvestStub: StrategyStub;
  postHarvestStub: StrategyStub;

  constructor(
    preHarvestStub: StrategyStub,
    profit: string,
    loss: string,
    debtPayment: string,
    debtOutstanding: string
  ) {
    this.preHarvestStub = preHarvestStub;

    let postHarvestStub = preHarvestStub.clone();

    // todo: there's some token transfer logic that can happen here, but I don't think it's too important to implement it for testing.
    this.postHarvestStub = postHarvestStub;

    // create event
    this.mockEvent = new HarvestedEventBuilder(
      preHarvestStub.address,
      profit,
      loss,
      debtPayment,
      debtOutstanding,
      null,
      null
    );

    handleHarvested(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}

export class StrategyReported_v0_3_0_v0_3_1Transition {
  mockEvent: StrategyReported_v0_3_0_v0_3_1EventBuilder;

  preTransitionStub: VaultStub;
  postTransitionStub: VaultStub;

  strategyStub: StrategyStub;

  strategistPaymentTransition: MintERC20Transition;
  treasuryPaymentTransition: MintERC20Transition;

  constructor(
    preTransitionStub: VaultStub,
    strategyStub: StrategyStub,
    gain: string,
    loss: string,
    totalGain: string,
    totalLoss: string,
    totalDebt: string,
    debtAdded: string,
    debtLimit: string,
    strategistPayment: string | null,
    treasuryPayment: string | null
  ) {
    this.preTransitionStub = preTransitionStub;
    this.strategyStub = strategyStub;

    // we could technically calculate these values based off the strategy's gain and fee setting, but it's easier to just pass as a parameter and the correctness of these two fee values doesn't matter for other testing.
    let strategistPaymentToUse: string = '10';
    let treasuryPaymentToUse: string = '20';
    if (strategistPayment) {
      strategistPaymentToUse = strategistPayment;
    }
    if (treasuryPayment) {
      treasuryPaymentToUse = treasuryPayment;
    }

    // transfer(mint) fee to strategist
    this.strategistPaymentTransition = new MintERC20Transition(
      this.strategyStub.strategist,
      strategistPaymentToUse,
      preTransitionStub.shareToken,
      false // skipHandler
    );

    // transfer(mint) fee to treasury
    this.treasuryPaymentTransition = new MintERC20Transition(
      this.preTransitionStub.rewardsAddress,
      treasuryPaymentToUse,
      this.strategistPaymentTransition.postTransitionStub,
      false // skipHandler
    );

    // Technically there should also be a transfer here of a quantity of wantTokens from the strategy to the vault.
    // As far as I can tell, this isn't important for any tests so we won't implement it(knock on wood).

    let postTransitionStub = preTransitionStub.clone();

    postTransitionStub.shareToken = this.treasuryPaymentTransition.postTransitionStub;

    this.postTransitionStub = postTransitionStub;

    // create event
    this.mockEvent = new StrategyReported_v0_3_0_v0_3_1EventBuilder(
      this.preTransitionStub.address,
      this.strategyStub.address,
      gain,
      loss,
      totalGain,
      totalLoss,
      totalDebt,
      debtAdded,
      debtLimit,
      null,
      null
    );

    handleStrategyReported_v0_3_0_v0_3_1(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}
