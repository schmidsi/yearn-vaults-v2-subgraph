import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import {
  handleStrategyAddedToQueue,
  handleStrategyRemovedFromQueue,
  handleUpdateDepositLimit,
  handleUpdateGovernance,
  handleUpdateGuardian,
  handleUpdateManagement,
  handleUpdateManagementFee,
  handleUpdatePerformanceFee,
  handleUpdateRewards,
  handleUpdateWithdrawalQueue,
} from '../../src/mappings/vaultMappings';
import { MockBlock } from '../mappingParamBuilders/mockBlock';
import { VaultStub } from '../stubs/vaultStateStub';
import {
  StrategyAddedToQueue,
  StrategyRemovedFromQueue,
  UpdateWithdrawalQueue,
  UpdateDepositLimit,
  UpdateGovernance,
  UpdateGuardian,
  UpdateManagement,
  UpdateManagementFee,
  UpdatePerformanceFee,
  UpdateRewards,
} from '../../generated/Registry/Vault';
import { GenericAttributeUpdateEvent } from '../mappingParamBuilders/genericUpdateParam';
import { removeElementFromArray } from '../../src/utils/commons';
import { UpdateWithdrawalQueueParamBuilder } from '../mappingParamBuilders/updateWithdrawlQueueParamBuilder';

export class MockUpdateManagementFeeTransition {
  mockEvent: GenericAttributeUpdateEvent<UpdateManagementFee, BigInt>;
  preTransitionStub: VaultStub;
  postTransitionStub: VaultStub;

  constructor(preTransitionStub: VaultStub, newFee: string) {
    this.preTransitionStub = preTransitionStub;

    let postTransitionStub = preTransitionStub.clone();
    postTransitionStub.managementFee = newFee;
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new GenericAttributeUpdateEvent<
      UpdateManagementFee,
      BigInt
    >(preTransitionStub.shareToken.address, newFee, null, null);

    handleUpdateManagementFee(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}

export class MockUpdatePerformanceFeeTransition {
  mockEvent: GenericAttributeUpdateEvent<UpdatePerformanceFee, BigInt>;
  preTransitionStub: VaultStub;
  postTransitionStub: VaultStub;

  constructor(preTransitionStub: VaultStub, newFee: string) {
    this.preTransitionStub = preTransitionStub;

    let postTransitionStub = preTransitionStub.clone();
    postTransitionStub.performanceFee = newFee;
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new GenericAttributeUpdateEvent<
      UpdatePerformanceFee,
      BigInt
    >(preTransitionStub.shareToken.address, newFee, null, null);

    handleUpdatePerformanceFee(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}

export class MockUpdateRewardsTransition {
  mockEvent: GenericAttributeUpdateEvent<UpdateRewards, Address>;
  preTransitionStub: VaultStub;
  postTransitionStub: VaultStub;

  constructor(preTransitionStub: VaultStub, newAddress: string) {
    this.preTransitionStub = preTransitionStub;

    let postTransitionStub = preTransitionStub.clone();
    postTransitionStub.rewardsAddress = newAddress;
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new GenericAttributeUpdateEvent<UpdateRewards, Address>(
      preTransitionStub.shareToken.address,
      newAddress,
      null,
      null
    );

    handleUpdateRewards(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}

export class MockUpdateGuardianTransition {
  mockEvent: GenericAttributeUpdateEvent<UpdateGuardian, Address>;
  preTransitionStub: VaultStub;
  postTransitionStub: VaultStub;

  constructor(preTransitionStub: VaultStub, newAddress: string) {
    this.preTransitionStub = preTransitionStub;

    let postTransitionStub = preTransitionStub.clone();
    postTransitionStub.guardianAddress = newAddress;
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new GenericAttributeUpdateEvent<UpdateGuardian, Address>(
      preTransitionStub.shareToken.address,
      newAddress,
      null,
      null
    );

    handleUpdateGuardian(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}

export class MockUpdateManagementTransition {
  mockEvent: GenericAttributeUpdateEvent<UpdateManagement, Address>;
  preTransitionStub: VaultStub;
  postTransitionStub: VaultStub;

  constructor(preTransitionStub: VaultStub, newAddress: string) {
    this.preTransitionStub = preTransitionStub;

    let postTransitionStub = preTransitionStub.clone();
    postTransitionStub.managementAddress = newAddress;
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new GenericAttributeUpdateEvent<UpdateManagement, Address>(
      preTransitionStub.shareToken.address,
      newAddress,
      null,
      null
    );

    handleUpdateManagement(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}

export class MockUpdateGovernanceTransition {
  mockEvent: GenericAttributeUpdateEvent<UpdateGovernance, Address>;
  preTransitionStub: VaultStub;
  postTransitionStub: VaultStub;

  constructor(preTransitionStub: VaultStub, newAddress: string) {
    this.preTransitionStub = preTransitionStub;

    let postTransitionStub = preTransitionStub.clone();
    postTransitionStub.managementAddress = newAddress;
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new GenericAttributeUpdateEvent<UpdateGovernance, Address>(
      preTransitionStub.shareToken.address,
      newAddress,
      null,
      null
    );

    handleUpdateGovernance(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}

export class MockUpdateDepositLimitTransition {
  mockEvent: GenericAttributeUpdateEvent<UpdateDepositLimit, BigInt>;
  preTransitionStub: VaultStub;
  postTransitionStub: VaultStub;

  constructor(preTransitionStub: VaultStub, depositLimit: string) {
    this.preTransitionStub = preTransitionStub;

    let postTransitionStub = preTransitionStub.clone();
    postTransitionStub.depositLimit = depositLimit;
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new GenericAttributeUpdateEvent<
      UpdateDepositLimit,
      BigInt
    >(preTransitionStub.shareToken.address, depositLimit, null, null);

    handleUpdateDepositLimit(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}

export class MockStrategyAddedToQueueTransition {
  mockEvent: GenericAttributeUpdateEvent<StrategyAddedToQueue, Address>;
  preTransitionStub: VaultStub;
  postTransitionStub: VaultStub;

  constructor(preTransitionStub: VaultStub, strategyAdded: string) {
    this.preTransitionStub = preTransitionStub;
    let postTransitionStub = preTransitionStub.clone();

    let withDrawlQueue = postTransitionStub.withDrawlQueue;
    withDrawlQueue.push(strategyAdded);

    postTransitionStub.withDrawlQueue = withDrawlQueue;
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new GenericAttributeUpdateEvent<
      StrategyAddedToQueue,
      Address
    >(preTransitionStub.shareToken.address, strategyAdded, null, null);

    handleStrategyAddedToQueue(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}
export class MockUpdateWithdrawalQueueTransition {
  mockEvent: UpdateWithdrawalQueueParamBuilder<UpdateWithdrawalQueue>;
  preTransitionStub: VaultStub;
  postTransitionStub: VaultStub;

  constructor(preTransitionStub: VaultStub, newWithdrawlQueue: string[]) {
    this.preTransitionStub = preTransitionStub;
    let postTransitionStub = preTransitionStub.clone();

    postTransitionStub.withDrawlQueue = newWithdrawlQueue;
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new UpdateWithdrawalQueueParamBuilder<UpdateWithdrawalQueue>(
      preTransitionStub.shareToken.address,
      newWithdrawlQueue,
      null,
      null
    );

    handleUpdateWithdrawalQueue(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}
export class MockStrategyRemovedFromQueueTransition {
  mockEvent: GenericAttributeUpdateEvent<StrategyRemovedFromQueue, Address>;
  preTransitionStub: VaultStub;
  postTransitionStub: VaultStub;

  constructor(preTransitionStub: VaultStub, strategyRemoved: string) {
    this.preTransitionStub = preTransitionStub;
    let postTransitionStub = preTransitionStub.clone();

    postTransitionStub.withDrawlQueue = removeElementFromArray(
      postTransitionStub.withDrawlQueue,
      strategyRemoved
    );
    this.postTransitionStub = postTransitionStub;

    this.mockEvent = new GenericAttributeUpdateEvent<
      StrategyRemovedFromQueue,
      Address
    >(preTransitionStub.shareToken.address, strategyRemoved, null, null);

    handleStrategyRemovedFromQueue(this.mockEvent.mock);

    MockBlock.IncrementBlock();
  }
}
