import { assert, clearStore, log, test } from 'matchstick-as/assembly/index';
import { CreateVaultTransition } from './transitionMocks/createVaultTransition';
import { defaults } from './default';
import { handleStrategyReported_v0_3_0_v0_3_1 } from '../src/mappings/vaultMappings';
import { CreateStrategyTransition } from './transitionMocks/createStrategyTransition';
import {
  HarvestedTransition,
  StrategyReported_v0_3_0_v0_3_1Transition,
} from './transitionMocks/strategyTransitions';
import { buildIdFromEvent } from '../src/utils/commons';
import {
  EmergencyExitTransition,
  SetDoHealthCheckTransition,
  SetHealthCheckTransition,
  UpdatedKeeperTransition,
  UpdatedRewardsTransition,
  UpdatedStrategistTransition,
} from './transitionMocks/strategyAttributeTransitions';
import {
  handleSetDoHealthCheckEvent,
  handleSetHealthCheckEvent,
} from '../src/mappings/strategyMappings';
import { getDayIDFromIndex } from '../src/utils/vault/vault-day-data';
import { BIGINT_ZERO } from '../src/utils/constants';
import { Vault } from '../generated/schema';
import {
  MockStrategyAddedToQueueTransition,
  MockStrategyRemovedFromQueueTransition,
  MockUpdateWithdrawalQueueTransition,
} from './transitionMocks/vaultAttributeTransitions';

test('Test handleHarvested Event', () => {
  clearStore();

  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddr = vault.stub.shareToken.address;

  let strategy = new CreateStrategyTransition(
    vault.stub,
    null, // debt limit
    null, // rate limit
    null, // performance fee
    null // strategyStub
  );
  let strategyAddress = strategy.stub.address;
  let profit = '33043378';
  let loss = '0';
  let debtPayment = '0';
  let debtOutstanding = '0'; // this means the vault acquired all of the tokens from the strategy?

  // this should be handled in the harvest transition, not here
  strategy.stub.wantToken.setAccountBalance(strategyAddress, '0');
  strategy.stub.wantToken.setAccountBalance(vaultAddr, profit);

  let harvestTransition = new HarvestedTransition(
    strategy.stub,
    profit,
    loss,
    debtPayment,
    debtOutstanding
  );

  let harvestId = strategyAddress
    .concat('-')
    .concat(harvestTransition.mockEvent.transaction.txnHash)
    .concat('-')
    .concat(harvestTransition.mockEvent.transaction.txnIndex);

  assert.fieldEquals('Harvest', harvestId, 'id', harvestId);
  assert.fieldEquals('Harvest', harvestId, 'profit', profit);
  assert.fieldEquals('Harvest', harvestId, 'loss', loss);
  assert.fieldEquals('Harvest', harvestId, 'debtPayment', debtPayment);
  assert.fieldEquals('Harvest', harvestId, 'debtOutstanding', debtOutstanding);
});

test('Test handleTransfer properly identifies Strategist fees', () => {});

test('Test StrategyReported_v0_3_0_v0_3_1 Event', () => {
  clearStore();

  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddress = vault.stub.shareToken.address;

  let strategy = CreateStrategyTransition.DefaultStrategy(vault.stub);

  let gain = '33043378';
  let loss = '0';
  let totalGain = '33043378';
  let totalLoss = '0';
  let totalDebt = '559944200575';
  let debtAdded = '398061966813';
  let debtLimit = '9500';

  let strategyReport = new StrategyReported_v0_3_0_v0_3_1Transition(
    vault.stub,
    strategy.stub,
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

  let strategyReportedId = buildIdFromEvent(strategyReport.mockEvent.mock);

  assert.fieldEquals(
    'StrategyReport',
    strategyReportedId,
    'id',
    strategyReportedId
  );
  assert.fieldEquals('StrategyReport', strategyReportedId, 'gain', gain);
  assert.fieldEquals('StrategyReport', strategyReportedId, 'loss', loss);
  assert.fieldEquals(
    'StrategyReport',
    strategyReportedId,
    'totalGain',
    totalGain
  );
  assert.fieldEquals(
    'StrategyReport',
    strategyReportedId,
    'totalLoss',
    totalLoss
  );
  assert.fieldEquals(
    'StrategyReport',
    strategyReportedId,
    'totalDebt',
    totalDebt
  );
  assert.fieldEquals(
    'StrategyReport',
    strategyReportedId,
    'debtAdded',
    debtAdded
  );

  //todo: move to transfer tests
  // validate that fees have been recognized by accounting
  /*
  assert.fieldEquals('TokenFee', vaultAddress, 'unrecognizedTreasuryFees', '0');
  assert.fieldEquals('TokenFee', vaultAddress, 'unrecognizedStrategyFees', '0');

  assert.fieldEquals(
    'TokenFee',
    vaultAddress,
    'totalTreasuryFees',
    unrecognizedTreasuryFees
  );
  assert.fieldEquals(
    'TokenFee',
    vaultAddress,
    'totalStrategyFees',
    unrecognizedStrategistFees
  );
  assert.fieldEquals(
    'TokenFee',
    vaultAddress,
    'totalFees',
    totalFees.toString()
  );

  assert.fieldEquals(
    'VaultUpdate',
    latestUpdate!,
    'returnsGenerated',
    returns.toString()
  );
  assert.fieldEquals(
    'VaultUpdate',
    latestUpdate!,
    'totalFees',
    totalFees.toString()
  );
	*/

  let vaultEntity = Vault.load(vaultAddress);
  let latestUpdate = vaultEntity!.latestUpdate;

  assert.fieldEquals(
    'VaultUpdate',
    latestUpdate!,
    'returnsGenerated',
    totalGain
  );

  // make sure the values bubbled up into VaultDayData correctly
  let vaultDayId = getDayIDFromIndex(vaultAddress, BIGINT_ZERO);
  assert.fieldEquals('VaultDayData', vaultDayId, 'id', vaultDayId);
  assert.fieldEquals(
    'VaultDayData',
    vaultDayId,
    'totalReturnsGenerated',
    totalGain
  );
  assert.fieldEquals(
    'VaultDayData',
    vaultDayId,
    'dayReturnsGenerated',
    totalGain
  );

  // no-op to mark test for coverage
  handleStrategyReported_v0_3_0_v0_3_1(strategyReport.mockEvent.mock);
});

test('Test Strategy SetHealthCheck Event', () => {
  clearStore();

  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddress = vault.stub.shareToken.address;

  let strategy = CreateStrategyTransition.DefaultStrategy(vault.stub);
  let strategyAddress = strategy.stub.address;

  let initialHealthCheckAddress = strategy.stub.healthCheck;
  assert.fieldEquals(
    'Strategy',
    strategyAddress,
    'healthCheck',
    initialHealthCheckAddress
  );

  let newHealthCheckAddress = defaults.senderAddress;

  let setHealthCheckTransition = new SetHealthCheckTransition(
    strategy.stub,
    newHealthCheckAddress
  );

  assert.fieldEquals(
    'Strategy',
    strategyAddress,
    'healthCheck',
    newHealthCheckAddress
  );

  // no-op to mark test for coverage
  handleSetHealthCheckEvent(setHealthCheckTransition.mockEvent.mock);
});

test('Test Strategy setDoHealthCheck Event', () => {
  clearStore();

  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddress = vault.stub.shareToken.address;

  let strategy = CreateStrategyTransition.DefaultStrategy(vault.stub);
  let strategyAddress = strategy.stub.address;

  let initlDoHealthCheck = strategy.stub.doHealthCheck;
  assert.fieldEquals(
    'Strategy',
    strategyAddress,
    'doHealthCheck',
    initlDoHealthCheck.toString()
  );

  let newDoHealthCheck: boolean;
  // is there seriously not a more succinct way to do this in AS?
  if (initlDoHealthCheck) {
    newDoHealthCheck = false;
  } else {
    newDoHealthCheck = true;
  }

  let setDoHealthCheckTransition = new SetDoHealthCheckTransition(
    strategy.stub,
    newDoHealthCheck
  );

  assert.fieldEquals(
    'Strategy',
    strategyAddress,
    'doHealthCheck',
    newDoHealthCheck.toString()
  );

  // no-op to mark test for coverage
  handleSetDoHealthCheckEvent(setDoHealthCheckTransition.mockEvent.mock);
});

test('Test EmergencyExitEnabled Event', () => {
  clearStore();

  let vault = CreateVaultTransition.DefaultVault();
  let strategy = CreateStrategyTransition.DefaultStrategy(vault.stub);
  let strategyAddress = strategy.stub.address;

  let oldEmergencyExit = strategy.stub.emergencyExit;
  assert.fieldEquals(
    'Strategy',
    strategyAddress,
    'emergencyExit',
    oldEmergencyExit.toString()
  );

  let keeperUpdate = new EmergencyExitTransition(strategy.stub);
  assert.fieldEquals('Strategy', strategyAddress, 'emergencyExit', 'true');
});

test('Test UpdatedKeeper Event', () => {
  clearStore();

  let vault = CreateVaultTransition.DefaultVault();
  let strategy = CreateStrategyTransition.DefaultStrategy(vault.stub);
  let strategyAddress = strategy.stub.address;

  let oldKeeperAdress = strategy.stub.keeper;
  assert.fieldEquals('Strategy', strategyAddress, 'keeper', oldKeeperAdress);

  let newKeeper = defaults.senderAddress;
  let keeperUpdate = new UpdatedKeeperTransition(strategy.stub, newKeeper);
  assert.fieldEquals('Strategy', strategyAddress, 'keeper', newKeeper);
});

test('Test UpdatedStrategist Event', () => {
  clearStore();

  let vault = CreateVaultTransition.DefaultVault();
  let strategy = CreateStrategyTransition.DefaultStrategy(vault.stub);
  let strategyAddress = strategy.stub.address;

  let oldStrategistAdress = strategy.stub.strategist;
  assert.fieldEquals(
    'Strategy',
    strategyAddress,
    'strategist',
    oldStrategistAdress
  );

  let newStrategistAddress = defaults.senderAddress;
  let strategistUpdate = new UpdatedStrategistTransition(
    strategy.stub,
    newStrategistAddress
  );
  assert.fieldEquals(
    'Strategy',
    strategyAddress,
    'strategist',
    newStrategistAddress
  );
});

test('Test UpdatedRewards Event', () => {
  clearStore();

  let vault = CreateVaultTransition.DefaultVault();
  let strategy = CreateStrategyTransition.DefaultStrategy(vault.stub);
  let strategyAddress = strategy.stub.address;

  let oldRewardsAdress = strategy.stub.rewards;
  assert.fieldEquals('Strategy', strategyAddress, 'rewards', oldRewardsAdress);

  let newRewardsAddress = defaults.senderAddress;
  let rewardsUpdate = new UpdatedRewardsTransition(
    strategy.stub,
    newRewardsAddress
  );
  assert.fieldEquals('Strategy', strategyAddress, 'rewards', newRewardsAddress);
});

test('Test strategyAddedV1', () => {
  clearStore();
  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddress = vault.stub.address;

  let strategy = CreateStrategyTransition.DefaultStrategyWithDebt(
    vault.stub,
    '100000'
  );

  assert.fieldEquals(
    'Vault',
    vaultAddress,
    'withdrawalQueue',
    '[' + strategy.stub.address.toString() + ']'
  );
});

test('Test strategyAddedToQueue Event', () => {
  clearStore();
  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddress = vault.stub.address;

  assert.i32Equals(vault.stub.withDrawlQueue.length, 0);
  assert.fieldEquals('Vault', vaultAddress, 'withdrawalQueue', '[]');

  let strategy = CreateStrategyTransition.DefaultStrategy(vault.stub);

  new MockStrategyAddedToQueueTransition(vault.stub, strategy.stub.address);

  let expectedWithdrawlQueue = new Array<string>();
  expectedWithdrawlQueue.push(strategy.stub.address);

  assert.fieldEquals(
    'Vault',
    vaultAddress,
    'withdrawalQueue',
    '[' + expectedWithdrawlQueue.toString() + ']'
  );
});

test('Test setWithdrawlQueue Event', () => {
  clearStore();
  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddress = vault.stub.address;

  assert.i32Equals(vault.stub.withDrawlQueue.length, 0);

  assert.fieldEquals('Vault', vaultAddress, 'withdrawalQueue', '[]');

  let firstStrategy = CreateStrategyTransition.DefaultStrategy(vault.stub);
  let secondStrategy = CreateStrategyTransition.DefaultStrategy(
    vault.stub,
    defaults.anotherAddress
  );

  new MockUpdateWithdrawalQueueTransition(vault.stub, [
    firstStrategy.stub.address,
    secondStrategy.stub.address,
  ]);

  let vaultWithNewWithdrawlQueue = Vault.load(vault.stub.address);
  assert.i32Equals(vaultWithNewWithdrawlQueue!.withdrawalQueue.length, 2);

  let actualFirstStrat = vaultWithNewWithdrawlQueue!.withdrawalQueue[0];
  let actualSecondStrat = vaultWithNewWithdrawlQueue!.withdrawalQueue[1];

  //Ensure that both strategy are part of the withdrawlQueue before we delete the first one
  assert.stringEquals(firstStrategy.stub.address, actualFirstStrat);
  assert.stringEquals(secondStrategy.stub.address, actualSecondStrat);
});
test('Test setWithdrawlQueue Event -- new withdrawlQueue should not contain strategies from the old withdrawlQueue', () => {
  clearStore();
  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddress = vault.stub.address;

  assert.i32Equals(vault.stub.withDrawlQueue.length, 0);

  assert.fieldEquals('Vault', vaultAddress, 'withdrawalQueue', '[]');

  let firstStrategy = CreateStrategyTransition.DefaultStrategy(vault.stub);

  new MockUpdateWithdrawalQueueTransition(vault.stub, [
    firstStrategy.stub.address,
  ]);

  let vaultWithNewWithdrawlQueue = Vault.load(vault.stub.address);
  assert.i32Equals(vaultWithNewWithdrawlQueue!.withdrawalQueue.length, 1);

  let actualFirstStrat = vaultWithNewWithdrawlQueue!.withdrawalQueue[0];
  assert.stringEquals(firstStrategy.stub.address, actualFirstStrat);

  let secondStrategy = CreateStrategyTransition.DefaultStrategy(
    vault.stub,
    defaults.anotherAddress
  );
  //Because we are setting the queue "firstStrat" is no longer part of the withdrawlQueue
  new MockUpdateWithdrawalQueueTransition(vault.stub, [
    secondStrategy.stub.address,
  ]);

  let vaultWithUpdatedWithdrawlQueue = Vault.load(vault.stub.address);
  assert.i32Equals(vaultWithUpdatedWithdrawlQueue!.withdrawalQueue.length, 1);

  let newFirstStrat = vaultWithUpdatedWithdrawlQueue!.withdrawalQueue[0];
  assert.stringEquals(secondStrategy.stub.address, newFirstStrat);
});

test('Test strategyRemovedFromQueue Event', () => {
  clearStore();
  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddress = vault.stub.address;

  let firstStrategy = CreateStrategyTransition.DefaultStrategy(vault.stub);
  let secondStrategy = CreateStrategyTransition.DefaultStrategy(
    vault.stub,
    defaults.anotherAddress
  );

  //Add First strategy
  new MockStrategyAddedToQueueTransition(
    vault.stub,

    firstStrategy.stub.address
  );

  //Add Second strategy
  new MockStrategyAddedToQueueTransition(
    vault.stub,
    secondStrategy.stub.address
  );

  let vaultWithNewWithdrawlQueue = Vault.load(vault.stub.address);
  let actualFirstStrat = vaultWithNewWithdrawlQueue!.withdrawalQueue[0];
  let actualSecondStrat = vaultWithNewWithdrawlQueue!.withdrawalQueue[1];

  //Ensure that both strategy are part of the withdrawlQueue before we delete the first one
  assert.stringEquals(firstStrategy.stub.address, actualFirstStrat);
  assert.stringEquals(secondStrategy.stub.address, actualSecondStrat);

  //Delete first strat from withdrawl queue
  new MockStrategyRemovedFromQueueTransition(
    vault.stub,
    firstStrategy.stub.address
  );

  //Withdrawl Queue now only contains the second strat
  assert.fieldEquals(
    'Vault',
    vaultAddress,
    'withdrawalQueue',
    '[' + secondStrategy.stub.address.toString() + ']'
  );
});
