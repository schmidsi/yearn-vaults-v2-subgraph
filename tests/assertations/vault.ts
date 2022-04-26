import { assert } from 'matchstick-as';
import { MockBlock } from '../mappingParamBuilders/mockBlock';
import { NewReleaseEventBuilder } from '../mappingParamBuilders/registryParamBuilder';
import { MockTransaction } from '../mappingParamBuilders/mockTransaction';
import { VaultStub } from '../stubs/vaultStateStub';
import { validateTransactionState } from './transaction';

// validates that the vault stub matches the entity. Useful for sanity checking stubs or validating that a vault entity was created correctly.
export function validateVaultStub(vaultStub: VaultStub): void {
  assert.fieldEquals('Vault', vaultStub.address, 'id', vaultStub.address);
  assert.fieldEquals(
    'Vault',
    vaultStub.address,
    'token',
    vaultStub.wantToken.address
  );
  assert.fieldEquals(
    'Vault',
    vaultStub.address,
    'shareToken',
    vaultStub.shareToken.address
  );
  assert.fieldEquals(
    'Vault',
    vaultStub.address,
    'rewards',
    vaultStub.rewardsAddress
  );
  assert.fieldEquals(
    'Vault',
    vaultStub.address,
    'sharesSupply',
    vaultStub.totalSupply
  );
  assert.fieldEquals(
    'Vault',
    vaultStub.address,
    'managementFeeBps',
    vaultStub.managementFee
  );
  assert.fieldEquals(
    'Vault',
    vaultStub.address,
    'performanceFeeBps',
    vaultStub.performanceFee
  );
  assert.fieldEquals(
    'Vault',
    vaultStub.address,
    'activation',
    vaultStub.activation
  );
  assert.fieldEquals(
    'Vault',
    vaultStub.address,
    'apiVersion',
    vaultStub.apiVersion
  );
}

export function validateRegistryCreatedVault(
  releaseParams: NewReleaseEventBuilder
): void {
  assert.fieldEquals(
    'Vault',
    releaseParams.templateAddress,
    'id',
    releaseParams.templateAddress
  );
  assert.fieldEquals(
    'Vault',
    releaseParams.templateAddress,
    'transaction',
    releaseParams.transaction.entityId
  );
  assert.fieldEquals(
    'Vault',
    releaseParams.templateAddress,
    'classification',
    'Released'
  );
  assert.fieldEquals(
    'Vault',
    releaseParams.templateAddress,
    'apiVersion',
    releaseParams.apiVersion
  );
  assert.fieldEquals(
    'Vault',
    releaseParams.templateAddress,
    'isTemplateListening',
    'true'
  );
  assert.fieldEquals(
    'Vault',
    releaseParams.templateAddress,
    'registry',
    releaseParams.registryAddress
  );

  validateTransactionState(releaseParams.transaction, releaseParams.block);
}
