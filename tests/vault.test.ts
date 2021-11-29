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
import { createMockDeposit1Call } from './util/vaultCalls';
import { createMockAddStrategyV1Call } from './util/strategyCalls';
import { createMockNewVaultEvent } from './util/vaultEvents';
import {
  handleDeposit,
  handleAddStrategy,
} from '../src/mappings/vaultMappings';
import { CreateMockUSDCVault_1 } from './fixtures/CreateMockUSDCVault_1';
import { AddStrategyToUSDCVault_2 } from './fixtures/AddStrategyToUSDCVault_2';
import { DepositToVaultWithSpecAmount_3 } from './fixtures/DepositToVaultWithSpecAmount_3';
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
  CreateMockUSDCVault_1();
  // from CreateMockUSDCVault_1. Eventually this should be de-duplicated
  let vaultAddress = '0x5f18c75abdae578b483e5f43f12a39cf75b973a9';
  let wantTokenAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
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
  AddStrategyToUSDCVault_2();
  // from AddStrategyToUSDCVault_2
  let vaultAddress = '0x5f18c75abdae578b483e5f43f12a39cf75b973a9';
  let strategyAddress = '0x4d7d4485fd600c61d840ccbec328bfd76a050f87';

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
  DepositToVaultWithSpecAmount_3();
  // from DepositToVaultWithSpecAmount_3
  let depositor = '0x253c5cbdd08838dad5493d511e17aa1ac5eab51b';
  let txnHash =
    '0xc1c33bd1a42e6c57134275be180376ef79d4e3b5a09162640ea3d01fb96e8ce6';
  let vaultAddress = '0x5f18c75abdae578b483e5f43f12a39cf75b973a9';
  let wantAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
  let sharesMinted = '79056085';

  let mockCall = createMockDeposit1Call(
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

clearStore();
