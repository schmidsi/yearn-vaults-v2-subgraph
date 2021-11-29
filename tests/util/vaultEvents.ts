import { NewVault } from '../../generated/Registry/Registry';
import {
  BigInt,
  ethereum,
  log,
  Address,
  Bytes,
  ByteArray,
} from '@graphprotocol/graph-ts';
import { newMockEvent } from 'matchstick-as';

export function createMockNewVaultEvent(
  token: Address,
  deployment_id: i32,
  vault: Address,
  api_version: string
): NewVault {
  log.info('[TEST] Creating mock NewVaultEvent. Vault: {}  Want Token: {}', [
    vault.toHexString(),
    token.toHexString(),
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
    ethereum.Value.fromAddress(token)
  );
  let deployment_idParam = new ethereum.EventParam(
    'deployment_id',
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(deployment_id))
  );
  let vaultParam = new ethereum.EventParam(
    'vault',
    ethereum.Value.fromAddress(vault)
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
