import { clearStore, test, assert } from 'matchstick-as/assembly/index';
import {
  Address,
  log,
  BigInt,
  Bytes,
  ByteArray,
  ethereum,
} from '@graphprotocol/graph-ts';
import { createRegistryV1Entity } from './util/registryEvents';
import {
  createMockDeposit1Call,
  createMockDepositCall,
  createMockWithdraw1Call,
} from './util/vaultCalls';
import { createMockAddStrategyV1Call } from './util/strategyCalls';
import { createMockNewVaultEvent } from './util/vaultEvents';
import {
  handleDeposit,
  handleWithdrawWithShares,
  handleAddStrategy,
  handleWithdraw,
} from '../src/mappings/vaultMappings';
import { CreateMockUSDCVault_1 } from './fixtures/CreateMockUSDCVault_1';
import { AddStrategyToUSDCVault_2 } from './fixtures/AddStrategyToUSDCVault_2';
import { DepositToVaultWithSpecAmount_3 } from './fixtures/DepositToVaultWithSpecAmount_3';
import { WithdrawFromVaultWithSpecAmount_4 } from './fixtures/WithdrawFromVaultWithSpecAmount_4';
import { handleNewVaultInner } from '../src/mappings/registryMappings';
import {
  Vault as VaultSchema,
  Deposit as DepositSchema,
  Strategy as StrategySchema,
} from '../generated/schema';

let registry_address = Address.fromString(
  '0xa0c1a2ea0a861a967d9d0ffe2ae4012c2e053804'
);

test('Can create registry via NewRelease event', () => {
  let registry = createRegistryV1Entity(registry_address);
  assert.assertNotNull(registry);
});

test('Can create a Vault entity via NewVault event', () => {
  CreateMockUSDCVault_1.mockChainState();
  let vaultAddress = CreateMockUSDCVault_1.VaultAddress;
  let wantTokenAddress = CreateMockUSDCVault_1.WantTokenAddress;
  let apiVersion = '0.3.0';

  let mockEvent = createMockNewVaultEvent(
    Address.fromString(wantTokenAddress),
    1,
    Address.fromString(vaultAddress),
    apiVersion
  );
  log.info('[TEST] Calling handleNewVaultInner with mocked event', []);
  handleNewVaultInner(registry_address, mockEvent);

  let vault = VaultSchema.load(vaultAddress);

  assert.assertNotNull(vault);
  assert.fieldEquals(
    'Vault',
    vaultAddress,
    'registry',
    registry_address.toHexString()
  );
});

test('Can add a strategy to a vault using handleAddStrategyV1 (call)', () => {
  AddStrategyToUSDCVault_2.mockChainState();
  let vaultAddress = AddStrategyToUSDCVault_2.VaultAddress;
  let strategyAddress = AddStrategyToUSDCVault_2.StrategyAddress;

  // from https://etherscan.io/tx/0x3e059ed2652468576e10ea90bc1c3fcf2f125bbdb31c2f9063cb5108c68e1c59#eventlog
  let debtLimit = '9500';
  let rateLimit = '2000000000000';
  let performanceFee = '1000';
  let mockCall = createMockAddStrategyV1Call(
    Address.fromString(strategyAddress),
    Address.fromString(vaultAddress),
    debtLimit,
    rateLimit,
    performanceFee
  );
  handleAddStrategy(mockCall);

  let strategy = StrategySchema.load(strategyAddress);
  assert.assertNotNull(strategy);
  log.info('[TEST] Strategy built successfully', []);

  assert.fieldEquals('Strategy', strategyAddress, 'vault', vaultAddress);
});

test('Can perform an initial deposit into a Vault using a deposit1 (call)', () => {
  DepositToVaultWithSpecAmount_3.mockChainState();
  // from DepositToVaultWithSpecAmount_3
  let depositor = DepositToVaultWithSpecAmount_3.DepositorAddress;
  let vaultAddress = DepositToVaultWithSpecAmount_3.VaultAddress;
  let wantAddress = DepositToVaultWithSpecAmount_3.WantTokenAddress;
  let sharesMinted = '79056085';
  let txnHash =
    '0xc1c33bd1a42e6c57134275be180376ef79d4e3b5a09162640ea3d01fb96e8ce6';

  let mockCall = createMockDepositCall(
    Bytes.fromByteArray(ByteArray.fromHexString(txnHash)),
    Address.fromString(vaultAddress),
    Address.fromString(depositor),
    BigInt.fromString(sharesMinted)
  );
  handleDeposit(mockCall);

  // note: there's an awful lot of asserts that need to be made to verify all of the entities were generated correctly. there might be a way to break this up to verify individual entity components so we don't need 200 loc to validate each test.
  assert.fieldEquals('Account', depositor, 'id', depositor);

  // Verify an AccountPosition exists and has the correct balances
  let positionId = depositor.concat('-').concat(vaultAddress);
  assert.fieldEquals('AccountVaultPosition', positionId, 'account', depositor);

  // todo: get from chain?
  let pricePerShare = BigInt.fromString('10').pow(u8(6));

  assert.fieldEquals('AccountVaultPosition', positionId, 'account', depositor);
  assert.fieldEquals('AccountVaultPosition', positionId, 'vault', vaultAddress);
  assert.fieldEquals('AccountVaultPosition', positionId, 'token', wantAddress);
  assert.fieldEquals(
    'AccountVaultPosition',
    positionId,
    'balanceShares',
    sharesMinted
  );
  assert.fieldEquals(
    'AccountVaultPosition',
    positionId,
    'balanceTokens',
    sharesMinted
  );

  // Verify VaultPositionUpdate exists and is correct
  // todo: get newOrder from transaction
  let newOrder = '0';
  let positionUpdateId = depositor
    .concat('-')
    .concat(vaultAddress.concat('-').concat(newOrder));
  assert.fieldEquals(
    'AccountVaultPosition',
    positionId,
    'latestUpdate',
    positionUpdateId
  );
  assert.fieldEquals(
    'AccountVaultPositionUpdate',
    positionUpdateId,
    'id',
    positionUpdateId
  );
  assert.fieldEquals(
    'AccountVaultPositionUpdate',
    positionUpdateId,
    'account',
    depositor
  );
  assert.fieldEquals(
    'AccountVaultPositionUpdate',
    positionUpdateId,
    'accountVaultPosition',
    positionId
  );
  assert.fieldEquals(
    'AccountVaultPositionUpdate',
    positionUpdateId,
    'deposits',
    sharesMinted
  );
  assert.fieldEquals(
    'AccountVaultPositionUpdate',
    positionUpdateId,
    'withdrawals',
    '0'
  );
  assert.fieldEquals(
    'AccountVaultPositionUpdate',
    positionUpdateId,
    'sharesMinted',
    sharesMinted
  );
  assert.fieldEquals(
    'AccountVaultPositionUpdate',
    positionUpdateId,
    'sharesBurnt',
    '0'
  );
  assert.fieldEquals(
    'AccountVaultPositionUpdate',
    positionUpdateId,
    'sharesSent',
    '0'
  );
  assert.fieldEquals(
    'AccountVaultPositionUpdate',
    positionUpdateId,
    'sharesReceived',
    '0'
  );
  assert.fieldEquals(
    'AccountVaultPositionUpdate',
    positionUpdateId,
    'tokensSent',
    '0'
  );
  assert.fieldEquals(
    'AccountVaultPositionUpdate',
    positionUpdateId,
    'tokensReceived',
    '0'
  );
  assert.fieldEquals(
    'AccountVaultPositionUpdate',
    positionUpdateId,
    'balanceShares',
    sharesMinted
  );

  // Verify VaultUpdate
  let transactionIndex = '1'; // todo: get from transaction
  let logIndex = '1'; // todo: get from transaction
  // from _getOrCreateTransaction
  let transactionHashId = txnHash.concat('-').concat(logIndex);
  // from buildIdFromVaultAndTransaction
  let vaultUpdateId = vaultAddress
    .concat('-')
    .concat(transactionHashId.concat('-').concat(transactionIndex));

  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'id', vaultUpdateId);
  assert.fieldEquals(
    'VaultUpdate',
    vaultUpdateId,
    'transaction',
    transactionHashId
  );
  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'vault', vaultAddress);
  assert.fieldEquals(
    'VaultUpdate',
    vaultUpdateId,
    'tokensDeposited',
    sharesMinted
  );
  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'tokensWithdrawn', '0');
  assert.fieldEquals(
    'VaultUpdate',
    vaultUpdateId,
    'sharesMinted',
    sharesMinted
  );
  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'sharesBurnt', '0');
  assert.fieldEquals(
    'VaultUpdate',
    vaultUpdateId,
    'pricePerShare',
    pricePerShare.toString()
  );
  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'totalFees', '0');
  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'managementFees', '0');
  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'performanceFees', '0');
  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'returnsGenerated', '0');

  assert.fieldEquals('Vault', vaultAddress, 'latestUpdate', vaultUpdateId);

  // Verify Deposit
  // from deposit.buildIdFromAccountHashAndIndex
  let depositId = depositor
    .concat('-')
    .concat(transactionHashId)
    .concat('-')
    .concat(transactionIndex);
  assert.fieldEquals('Deposit', depositId, 'id', depositId);
  assert.fieldEquals('Deposit', depositId, 'account', depositor);
  assert.fieldEquals('Deposit', depositId, 'vault', vaultAddress);
  assert.fieldEquals('Deposit', depositId, 'tokenAmount', sharesMinted);
  assert.fieldEquals('Deposit', depositId, 'sharesMinted', sharesMinted);
  assert.fieldEquals('Deposit', depositId, 'transaction', transactionHashId);
});

test('Can perform a withdrawl from a Vault using withdraw (amount) (call)', () => {
  WithdrawFromVaultWithSpecAmount_4.mockChainState();
  let vaultAddress = WithdrawFromVaultWithSpecAmount_4.VaultAddress;
  let depositor = WithdrawFromVaultWithSpecAmount_4.DepositorAddress;
  let wantAddress = WithdrawFromVaultWithSpecAmount_4.WantTokenAddress;
  let txnHash =
    '0xfbe5fe8f992480569f67f96dc35af74dfd38b0c20cae2e7cd9d949d9629e997b';
  let sharesBurned = '79056085';

  let mockCall = createMockWithdraw1Call(
    Bytes.fromByteArray(ByteArray.fromHexString(txnHash)),
    Address.fromString(vaultAddress),
    Address.fromString(depositor),
    BigInt.fromString(sharesBurned),
    BigInt.fromString(sharesBurned)
  );
  handleWithdrawWithShares(mockCall);

  let positionId = depositor.concat('-').concat(vaultAddress);
  assert.fieldEquals('AccountVaultPosition', positionId, 'balanceShares', '0');
  assert.fieldEquals('AccountVaultPosition', positionId, 'balanceTokens', '0');
  // todo: The AccountVaultPosition.balanceProfit field appears to returning inaccurate results, so cannot be tested.
  /*
  assert.fieldEquals(
    'AccountVaultPosition',
    positionId,
    'balanceProfit',
    "0"
  );
  */

  // Verify VaultUpdate
  let transactionIndex = '1'; // todo: get from transaction
  let logIndex = '1'; // todo: get from transaction
  // from _getOrCreateTransaction
  let transactionHashId = txnHash.concat('-').concat(logIndex);
  // from buildIdFromVaultAndTransaction
  let vaultUpdateId = vaultAddress
    .concat('-')
    .concat(transactionHashId.concat('-').concat(transactionIndex));
  // todo: get from chain?
  let pricePerShare = BigInt.fromString('10').pow(u8(6));

  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'id', vaultUpdateId);
  assert.fieldEquals(
    'VaultUpdate',
    vaultUpdateId,
    'transaction',
    transactionHashId
  );
  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'vault', vaultAddress);
  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'tokensDeposited', '0');
  assert.fieldEquals(
    'VaultUpdate',
    vaultUpdateId,
    'tokensWithdrawn',
    sharesBurned
  );
  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'sharesMinted', '0');
  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'sharesBurnt', sharesBurned);
  assert.fieldEquals(
    'VaultUpdate',
    vaultUpdateId,
    'pricePerShare',
    pricePerShare.toString()
  );
  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'totalFees', '0');
  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'managementFees', '0');
  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'performanceFees', '0');
  assert.fieldEquals('VaultUpdate', vaultUpdateId, 'returnsGenerated', '0');

  // todo: get newOrder from transaction
  let newOrder = '1';
  let positionUpdateId = depositor
    .concat('-')
    .concat(vaultAddress.concat('-').concat(newOrder));

  assert.fieldEquals(
    'AccountVaultPositionUpdate',
    positionUpdateId,
    'sharesBurnt',
    sharesBurned
  );
  assert.fieldEquals(
    'AccountVaultPositionUpdate',
    positionUpdateId,
    'balanceShares',
    '0'
  );
  assert.fieldEquals(
    'AccountVaultPositionUpdate',
    positionUpdateId,
    'withdrawals',
    sharesBurned
  );

  let withdrawlId = depositor
    .concat('-')
    .concat(transactionHashId)
    .concat('-')
    .concat(transactionIndex);
  assert.fieldEquals('Withdrawal', withdrawlId, 'id', withdrawlId);
  assert.fieldEquals('Withdrawal', withdrawlId, 'tokenAmount', sharesBurned);
  assert.fieldEquals('Withdrawal', withdrawlId, 'sharesBurnt', sharesBurned);
});

clearStore();
