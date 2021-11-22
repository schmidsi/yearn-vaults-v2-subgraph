import { clearStore, test, assert } from 'matchstick-as/assembly/index';
import { log } from '@graphprotocol/graph-ts';
import { createRegistryV1Entity } from './registry';
import { createVaultEntityViaNewVaultEvent } from './vault';
import { createStrategyEntityViaAddStrategyV2 } from './strategy';

// NOTE: Matchstick does not gracefully handle EIP-55. Do not use EIP-55 addresses in any tests.
let registry_address = '0xa0c1a2ea0a861a967d9d0ffe2ae4012c2e053804';
let vault_address = '0xbbbbbbbbbb861a967d9d0ffe2ae4012c2e053804';
let want_token_address = '0x6b175474e89094c44da98b954eedeac495271d0f';
let strategy_address = '0xec2db4a1ad431cc3b102059fa91ba643620f0826';

test('Can create registry via NewRelease event', () => {
  let registry = createRegistryV1Entity(registry_address);
  assert.assertNotNull(registry);
});

test('Can create a Vault via NewVault event', () => {
  log.info('[TEST] Creating Vault with address {}', [vault_address]);
  let vault = createVaultEntityViaNewVaultEvent(
    vault_address,
    registry_address,
    want_token_address
  );
  assert.assertNotNull(vault);
  assert.fieldEquals('Vault', vault_address, 'registry', registry_address);
});

test('Can add a strategy to a vault using handleAddStrategyV2', () => {
  log.info('[TEST] Creating strategy with address {}', [strategy_address]);
  let strategy = createStrategyEntityViaAddStrategyV2(
    strategy_address,
    vault_address
  );
  assert.assertNotNull(strategy);
  log.info('[TEST] Strategy built successfully', []);

  assert.fieldEquals('Strategy', strategy_address, 'vault', vault_address);
  clearStore();
});
