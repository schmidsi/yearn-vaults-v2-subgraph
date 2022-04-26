import { Address, BigInt } from '@graphprotocol/graph-ts';
import { MockBlock } from '../mappingParamBuilders/mockBlock';
import { GenericAttributeUpdateEvent } from '../mappingParamBuilders/genericUpdateParam';
import {
  EmergencyExitEnabled,
  SetDoHealthCheck,
  SetHealthCheck,
  UpdatedKeeper,
  UpdatedRewards,
  UpdatedStrategist,
} from '../../generated/templates/Vault/Strategy';
import { StrategyStub } from '../stubs/strategyStateStub';
import {
  handleEmergencyExitEnabled,
  handleSetDoHealthCheckEvent,
  handleSetHealthCheckEvent,
  handleUpdatedKeeper,
  handleUpdatedRewards,
  handleUpdatedStrategist,
} from '../../src/mappings/strategyMappings';
import { handleUpdateRewards } from '../../src/mappings/vaultMappings';
import { MockTransaction } from '../mappingParamBuilders/mockTransaction';

export class SetHealthCheckTransition {
  mockEvent: GenericAttributeUpdateEvent<SetHealthCheck, Address>;
  preTransitionStub: StrategyStub;
  postTransitionStub: StrategyStub;

  constructor(preTransitionStub: StrategyStub, newHealthCheckAddress: string) {
    this.preTransitionStub = preTransitionStub;

    let postTransitionStub = preTransitionStub.clone();
    postTransitionStub.healthCheck = newHealthCheckAddress;
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new GenericAttributeUpdateEvent<SetHealthCheck, Address>(
      preTransitionStub.address,
      newHealthCheckAddress,
      null,
      null
    );

    handleSetHealthCheckEvent(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}

export class SetDoHealthCheckTransition {
  mockEvent: GenericAttributeUpdateEvent<SetDoHealthCheck, boolean>;
  preTransitionStub: StrategyStub;
  postTransitionStub: StrategyStub;

  constructor(preTransitionStub: StrategyStub, doHealthCheck: boolean) {
    this.preTransitionStub = preTransitionStub;

    let postTransitionStub = preTransitionStub.clone();
    postTransitionStub.doHealthCheck = doHealthCheck;
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new GenericAttributeUpdateEvent<SetDoHealthCheck, boolean>(
      preTransitionStub.address,
      doHealthCheck.toString(),
      null,
      null
    );

    handleSetDoHealthCheckEvent(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}

export class UpdatedKeeperTransition {
  mockEvent: GenericAttributeUpdateEvent<UpdatedKeeper, Address>;
  preTransitionStub: StrategyStub;
  postTransitionStub: StrategyStub;

  constructor(preTransitionStub: StrategyStub, keeperAddress: string) {
    this.preTransitionStub = preTransitionStub;

    let postTransitionStub = preTransitionStub.clone();
    postTransitionStub.keeper = keeperAddress;
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new GenericAttributeUpdateEvent<UpdatedKeeper, Address>(
      preTransitionStub.address,
      keeperAddress.toString(),
      null,
      null
    );

    handleUpdatedKeeper(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}

export class UpdatedStrategistTransition {
  mockEvent: GenericAttributeUpdateEvent<UpdatedStrategist, Address>;
  preTransitionStub: StrategyStub;
  postTransitionStub: StrategyStub;

  constructor(preTransitionStub: StrategyStub, strategistAddress: string) {
    this.preTransitionStub = preTransitionStub;

    let postTransitionStub = preTransitionStub.clone();
    postTransitionStub.strategist = strategistAddress;
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new GenericAttributeUpdateEvent<
      UpdatedStrategist,
      Address
    >(preTransitionStub.address, strategistAddress.toString(), null, null);

    handleUpdatedStrategist(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}

export class UpdatedRewardsTransition {
  mockEvent: GenericAttributeUpdateEvent<UpdatedRewards, Address>;
  preTransitionStub: StrategyStub;
  postTransitionStub: StrategyStub;

  constructor(preTransitionStub: StrategyStub, rewardsAddress: string) {
    this.preTransitionStub = preTransitionStub;

    let postTransitionStub = preTransitionStub.clone();
    postTransitionStub.rewards = rewardsAddress;
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new GenericAttributeUpdateEvent<UpdatedRewards, Address>(
      preTransitionStub.address,
      rewardsAddress.toString(),
      null,
      null
    );

    handleUpdatedRewards(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}

export class EmergencyExitTransition {
  preTransitionStub: StrategyStub;
  postTransitionStub: StrategyStub;

  constructor(preTransitionStub: StrategyStub) {
    this.preTransitionStub = preTransitionStub;

    let postTransitionStub = preTransitionStub.clone();
    postTransitionStub.emergencyExit = true;
    this.postTransitionStub = postTransitionStub;

    let event = instantiate<EmergencyExitEnabled>(
      Address.fromString(preTransitionStub.address),
      BigInt.fromString(MockTransaction.NewDefaultTxn().logIndex),
      BigInt.fromString(MockTransaction.NewDefaultTxn().txnIndex),
      'default_log_type',
      MockBlock.NewDefaultBlock().mock,
      MockTransaction.NewDefaultTxn().mock,
      []
    );

    handleEmergencyExitEnabled(event);

    MockBlock.IncrementBlock();
  }
}
