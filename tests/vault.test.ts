import { assert, clearStore, test } from 'matchstick-as/assembly/index';
import { CreateVaultTransition } from './transitionMocks/createVaultTransition';
import { defaults } from './default';
import {
  handleStrategyAddedV1,
  handleUpdateGuardian,
  handleUpdateManagement,
  handleUpdateManagementFee,
  handleUpdatePerformanceFee,
  handleUpdateRewards,
} from '../src/mappings/vaultMappings';
import {
  MockUpdateDepositLimitTransition,
  MockUpdateGovernanceTransition,
  MockUpdateGuardianTransition,
  MockUpdateManagementFeeTransition,
  MockUpdateManagementTransition,
  MockUpdatePerformanceFeeTransition,
  MockUpdateRewardsTransition,
} from './transitionMocks/vaultAttributeTransitions';
import { Vault as VaultSchema } from '../generated/schema';
import { CreateStrategyTransition } from './transitionMocks/createStrategyTransition';

test('Test UpdateManagementFee Event', () => {
  clearStore();

  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddr = vault.stub.shareToken.address;

  let oldFee = vault.stub.managementFee;
  assert.fieldEquals('Vault', vaultAddr, 'managementFeeBps', oldFee);

  let newFee = '3000';

  let managementFeeUpdate = new MockUpdateManagementFeeTransition(
    vault.stub,
    newFee
  );

  assert.fieldEquals('Vault', vaultAddr, 'managementFeeBps', newFee);
  // grab latest update and make sure it has the correct fee
  let vaultEntity = VaultSchema.load(vaultAddr);
  assert.assertNotNull(vaultEntity);
  let latestUpdateId = vaultEntity!.latestUpdate;
  assert.assertNotNull(latestUpdateId);

  assert.fieldEquals(
    'VaultUpdate',
    latestUpdateId!,
    'newManagementFee',
    newFee
  );

  // intended to be null op for coverage detection
  handleUpdateManagementFee(managementFeeUpdate.mockEvent.mock);
});

test('Test UpdatePerformanceFee Event', () => {
  clearStore();

  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddr = vault.stub.shareToken.address;

  let oldFee = vault.stub.performanceFee;
  assert.fieldEquals('Vault', vaultAddr, 'performanceFeeBps', oldFee);

  let newFee = '3000';

  let performanceFeeUpdate = new MockUpdatePerformanceFeeTransition(
    vault.stub,
    newFee
  );

  assert.fieldEquals('Vault', vaultAddr, 'performanceFeeBps', newFee);
  // grab latest update and make sure it has the correct fee
  let vaultEntity = VaultSchema.load(vaultAddr);
  assert.assertNotNull(vaultEntity);
  let latestUpdateId = vaultEntity!.latestUpdate;
  assert.assertNotNull(latestUpdateId);

  assert.fieldEquals(
    'VaultUpdate',
    latestUpdateId!,
    'newPerformanceFee',
    newFee
  );

  // intended to be null op for coverage detection
  handleUpdatePerformanceFee(performanceFeeUpdate.mockEvent.mock);
});

test('Test UpdateRewards Event', () => {
  clearStore();

  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddr = vault.stub.shareToken.address;

  let oldRewards = vault.stub.rewardsAddress;
  assert.fieldEquals('Vault', vaultAddr, 'rewards', oldRewards);

  let newRewards = defaults.senderAddress;

  let rewardsUpdate = new MockUpdateRewardsTransition(vault.stub, newRewards);

  assert.fieldEquals('Vault', vaultAddr, 'rewards', newRewards);
  // grab latest update and make sure it has the correct fee
  let vaultEntity = VaultSchema.load(vaultAddr);
  assert.assertNotNull(vaultEntity);
  let latestUpdateId = vaultEntity!.latestUpdate;
  assert.assertNotNull(latestUpdateId);

  assert.fieldEquals('VaultUpdate', latestUpdateId!, 'newRewards', newRewards);

  // intended to be null op for coverage detection
  handleUpdateRewards(rewardsUpdate.mockEvent.mock);
});

test('Test handleStrategyAddedV1', () => {
  clearStore();
  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddress = vault.stub.shareToken.address;

  let debtLimit = '9500';
  let rateLimit = '2000000000000';
  let performanceFee = '1000';

  let strategy = new CreateStrategyTransition(
    vault.stub,
    debtLimit, // debt limit
    rateLimit, // rate limit
    performanceFee, // performance fee
    null // strategyStub
  );
  let strategyAddress = strategy.stub.address;

  assert.fieldEquals('Strategy', strategyAddress, 'vault', vaultAddress);
  assert.fieldEquals('Strategy', strategyAddress, 'name', strategy.stub.name);
  assert.fieldEquals(
    'Strategy',
    strategyAddress,
    'performanceFeeBps',
    performanceFee
  );
  assert.fieldEquals('Strategy', strategyAddress, 'debtLimit', debtLimit);
  assert.fieldEquals('Strategy', strategyAddress, 'rateLimit', rateLimit);
  assert.fieldEquals('Strategy', strategyAddress, 'minDebtPerHarvest', '0');
  assert.fieldEquals('Strategy', strategyAddress, 'maxDebtPerHarvest', '0');

  // intended to be null op for coverage detection
  handleStrategyAddedV1(strategy.mockEvent.mock);
});

test('Test UpdateGuardian Event', () => {
  clearStore();

  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddr = vault.stub.shareToken.address;

  let oldGuardian = vault.stub.guardianAddress;
  assert.fieldEquals('Vault', vaultAddr, 'guardian', oldGuardian);

  let newGuardian = defaults.senderAddress;
  let guardianUpdate = new MockUpdateGuardianTransition(
    vault.stub,
    newGuardian
  );
  assert.fieldEquals('Vault', vaultAddr!, 'guardian', newGuardian);
});

test('Test UpdateManagement Event', () => {
  clearStore();

  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddr = vault.stub.shareToken.address;

  let oldManagement = vault.stub.managementAddress;
  assert.fieldEquals('Vault', vaultAddr, 'management', oldManagement);

  let newGuardian = defaults.senderAddress;
  let managementUpdate = new MockUpdateManagementTransition(
    vault.stub,
    newGuardian
  );
  assert.fieldEquals('Vault', vaultAddr!, 'management', newGuardian);
});

test('Test UpdateGovernance Event', () => {
  clearStore();

  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddr = vault.stub.shareToken.address;

  let oldGovernance = vault.stub.governanceAddress;
  assert.fieldEquals('Vault', vaultAddr, 'governance', oldGovernance);

  let newGovernance = defaults.senderAddress;
  let governanceUpdate = new MockUpdateGovernanceTransition(
    vault.stub,
    newGovernance
  );
  assert.fieldEquals('Vault', vaultAddr!, 'governance', newGovernance);
});

test('Test UpdateDepositLimit Event', () => {
  clearStore();

  let vault = CreateVaultTransition.DefaultVault();
  let vaultAddr = vault.stub.shareToken.address;

  let oldDepositLimit = vault.stub.depositLimit;
  assert.fieldEquals('Vault', vaultAddr, 'depositLimit', oldDepositLimit);

  let newDepositLimit = '1000';
  let newAvailableDepositLimit = '1000';
  let depositLimitUpdate = new MockUpdateDepositLimitTransition(
    vault.stub,
    newDepositLimit
  );
  assert.fieldEquals('Vault', vaultAddr!, 'depositLimit', newDepositLimit);
  assert.fieldEquals(
    'Vault',
    vaultAddr!,
    'availableDepositLimit',
    newAvailableDepositLimit
  );
});
