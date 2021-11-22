import { createMockedFunction } from 'matchstick-as/assembly/index';
import { ethereum, log, Address } from '@graphprotocol/graph-ts';
import { DEFAULT_DECIMALS } from '../src/utils/constants';

export function mockERC20Contract(
  addressString: string,
  name: string,
  symbol: string,
  decimals: i32 = DEFAULT_DECIMALS
): void {
  log.info('[TEST] Mocking contract calls for ERC20 token {}', [addressString]);
  let tokenAddress = Address.fromString(addressString);

  createMockedFunction(tokenAddress, 'name', 'name():(string)').returns([
    ethereum.Value.fromString(name),
  ]);

  createMockedFunction(tokenAddress, 'symbol', 'symbol():(string)').returns([
    ethereum.Value.fromString(symbol),
  ]);

  createMockedFunction(tokenAddress, 'decimals', 'decimals():(uint8)').returns([
    ethereum.Value.fromI32(decimals),
  ]);

  createMockedFunction(
    tokenAddress,
    'try_decimals',
    'decimals():(uint8)'
  ).returns([ethereum.Value.fromI32(decimals)]);
  log.info('token address {}', [addressString]);
}
