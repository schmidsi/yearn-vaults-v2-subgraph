import { clearStore, test, assert } from 'matchstick-as/assembly/index';
import { NewReleaseEventBuilder } from './mappingParamBuilders/registryParamBuilder';
import { handleNewReleaseInner } from '../src/mappings/registryMappings';
import { VaultStub } from './stubs/vaultStateStub';
import { Address } from '@graphprotocol/graph-ts';
import { validateTransactionState } from './assertations/transaction';
import {
  validateRegistryCreatedVault,
  validateVaultStub,
} from './assertations/vault';
import { TokenStub } from './stubs/tokenStateStub';

test('Test handleNewRelease', () => {
  // set up the chain state for the test
  clearStore();

  let vaultParams = new VaultStub(
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
    TokenStub.DefaultToken(VaultStub.DefaultAddress), // shareToken
    TokenStub.DefaultToken(TokenStub.DefaultTokenAddress), // wantToken
    null //withdrawlQueue
  );

  let newReleaseEvent = new NewReleaseEventBuilder(
    null, // registry address
    null, // release id
    vaultParams.shareToken.address, // template address
    null, // api Version
    null, // transaction
    null // block
  );
  let registryAddressStr = newReleaseEvent.registryAddress;
  let registryAddress = Address.fromString(registryAddressStr);

  handleNewReleaseInner(registryAddress, newReleaseEvent.mock);

  // check the registry entity
  assert.fieldEquals('Registry', registryAddressStr, 'id', registryAddressStr);
  assert.fieldEquals(
    'Registry',
    registryAddressStr,
    'timestamp',
    newReleaseEvent.block.timestamp + '000'
  );
  assert.fieldEquals(
    'Registry',
    registryAddressStr,
    'blockNumber',
    newReleaseEvent.block.blockNumber
  );
  assert.fieldEquals(
    'Registry',
    registryAddressStr,
    'transaction',
    newReleaseEvent.transaction.entityId
  );

  // check the transaction entity
  validateTransactionState(newReleaseEvent.transaction, newReleaseEvent.block);

  // check vault stub
  validateVaultStub(vaultParams);

  validateRegistryCreatedVault(newReleaseEvent);
});
