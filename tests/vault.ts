import { assert, createMockedFunction } from 'matchstick-as/assembly/index';
import {
  Vault as VaultSchema,
  Deposit as DepositSchema,
} from '../generated/schema';
import { NewVault } from '../generated/Registry/Registry';
import { handleNewVaultInner } from '../src/mappings/registryMappings';
import { BigInt, ethereum, log, Address } from '@graphprotocol/graph-ts';
import { newMockEvent } from 'matchstick-as';
import { mockERC20Contract } from './token';
import { defaults } from './default';

export function mockVaultContract(
  addressString: string,
  wantTokenAddress: string,
  performanceFee: i32 = defaults.i32,
  managementFee: i32 = defaults.i32,
  treasuryVault: string = defaults.addressString,
  activation: i32 = defaults.i32,
  apiVersion: string = defaults.string
): void {
  log.info('[TEST] Mocking contract calls for Vault {}', [addressString]);
  let vaultAddress = Address.fromString(addressString);

  createMockedFunction(
    vaultAddress,
    'performanceFee',
    'performanceFee():(uint256)'
  ).returns([ethereum.Value.fromI32(performanceFee)]);

  createMockedFunction(
    vaultAddress,
    'managementFee',
    'managementFee():(uint256)'
  ).returns([ethereum.Value.fromI32(managementFee)]);

  createMockedFunction(vaultAddress, 'rewards', 'rewards():(address)').returns([
    ethereum.Value.fromAddress(Address.fromString(treasuryVault)),
  ]);

  createMockedFunction(vaultAddress, 'token', 'token():(address)').returns([
    ethereum.Value.fromAddress(Address.fromString(wantTokenAddress)),
  ]);

  createMockedFunction(
    vaultAddress,
    'activation',
    'activation():(uint256)'
  ).returns([ethereum.Value.fromI32(activation)]);

  createMockedFunction(
    vaultAddress,
    'apiVersion',
    'apiVersion():(string)'
  ).returns([ethereum.Value.fromString(apiVersion)]);
}

export function createVaultEntityViaNewVaultEvent(
  vaultAddress: string,
  registryAddress: string,
  tokenAddress: string
): VaultSchema {
  let deployment_id = defaults.i32;
  let api_version = defaults.string;

  let mockEvent = createMockNewVaultEvent(
    tokenAddress,
    deployment_id,
    vaultAddress,
    api_version
  );

  mockERC20Contract(tokenAddress, 'DAI', 'DAI');
  mockERC20Contract(vaultAddress, 'yDAI', 'yDAI');

  mockVaultContract(vaultAddress, tokenAddress);

  log.info('[TEST] Calling handleNewVaultInner with mocked event', []);
  handleNewVaultInner(Address.fromString(registryAddress), mockEvent);

  log.info('[TEST] Loading the newly created vault', []);
  let v = VaultSchema.load(vaultAddress);
  assert.assertNotNull(v);
  return v as VaultSchema;
}

export function createMockNewVaultEvent(
  token: string,
  deployment_id: i32,
  vault: string,
  api_version: string
): NewVault {
  log.info('[TEST] Creating mock NewVaultEvent. Vault: {}  Want Token: {}', [
    vault,
    token,
  ]);

  let mockEvent = newMockEvent();
  let newVaultEvent = new NewVault(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
  newVaultEvent.parameters = new Array();

  let tokenParam = new ethereum.EventParam(
    'token',
    ethereum.Value.fromAddress(Address.fromString(token))
  );
  let deployment_idParam = new ethereum.EventParam(
    'deployment_id',
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(deployment_id))
  );
  let vaultParam = new ethereum.EventParam(
    'vault',
    ethereum.Value.fromAddress(Address.fromString(vault))
  );
  let api_versionParam = new ethereum.EventParam(
    'api_version',
    ethereum.Value.fromString(api_version)
  );

  newVaultEvent.parameters.push(tokenParam);
  newVaultEvent.parameters.push(deployment_idParam);
  newVaultEvent.parameters.push(vaultParam);
  newVaultEvent.parameters.push(api_versionParam);

  return newVaultEvent;
}
