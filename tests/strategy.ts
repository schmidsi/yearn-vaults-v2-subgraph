import { assert, createMockedFunction } from 'matchstick-as/assembly/index';
import { AddStrategy1Call as AddStrategyV2Call } from '../generated/Registry/Vault';
import { Strategy as StrategySchema } from '../generated/schema';
import { handleAddStrategyV2 } from '../src/mappings/vaultMappings';
import { BigInt, ethereum, log, Address } from '@graphprotocol/graph-ts';
import { defaults } from './default';

export function mockStrategyContract(
  addressString: string,
  name: string = 'UnnamedStrategy'
): void {
  log.info('[TEST] Mocking contract calls for strategy {}', [addressString]);

  let strategyAddress = Address.fromString(addressString);
  createMockedFunction(strategyAddress, 'name', 'name():(string)').returns([
    ethereum.Value.fromString(name),
  ]);

  // no idea what this is for, so mocking to whatever the default is for Vault.vy
  createMockedFunction(
    strategyAddress,
    'healthCheck',
    'healthCheck():(address)'
  ).returns([ethereum.Value.fromAddress(defaults.address)]);

  // todo: find out if this is correct
  createMockedFunction(
    strategyAddress,
    'doHealthCheck',
    'doHealthCheck():(bool)'
  ).returns([ethereum.Value.fromBoolean(true)]);
}

export function createStrategyEntityViaAddStrategyV2(
  strategyAddress: string,
  vaultAddress: string
): StrategySchema {
  log.info('[TEST] Creating mocked AddStrategyv2', ['']);
  let debtRatio = 1;
  let minDebtPerHarvest = 100;
  let maxDebtPerHarvest = 100000;
  let performanceFee = 1000;

  let mockCall = createMockAddStrategyV2Call(
    strategyAddress,
    vaultAddress,
    debtRatio,
    minDebtPerHarvest,
    maxDebtPerHarvest,
    performanceFee
  );
  mockStrategyContract(strategyAddress);

  log.info('[TEST] Calling handleAddStrategyV2 with mocked call', []);
  handleAddStrategyV2(mockCall);

  let strategy = StrategySchema.load(strategyAddress);
  assert.assertNotNull(strategy);
  return strategy as StrategySchema;
}

export function createMockAddStrategyV2Call(
  strategy: string,
  vaultAddress: string,
  debtRatio: i32,
  minDebtPerHarvest: i32,
  maxDebtPerHarvest: i32,
  performanceFee: i32
): AddStrategyV2Call {
  let mockTransaction = new ethereum.Transaction(
    defaults.address,
    defaults.bigInt,
    defaults.address,
    Address.fromString(vaultAddress),
    defaults.bigInt,
    defaults.bigInt,
    defaults.bigInt,
    defaults.addressBytes
  );

  let addStrategyV2Call = new AddStrategyV2Call(
    Address.fromString(vaultAddress),
    defaults.address,
    defaults.block,
    mockTransaction,
    [],
    []
  );

  addStrategyV2Call.inputValues = new Array();

  let strategyParam = new ethereum.EventParam(
    'strategy',
    ethereum.Value.fromAddress(Address.fromString(strategy))
  );
  let debtRatioParam = new ethereum.EventParam(
    'debtRatio',
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(debtRatio))
  );
  let minDebtPerHarvestParam = new ethereum.EventParam(
    'minDebtPerHarvest',
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(minDebtPerHarvest))
  );
  let maxDebtPerHarvestParam = new ethereum.EventParam(
    'maxDebtPerHarvest',
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(maxDebtPerHarvest))
  );
  let performanceFeeParam = new ethereum.EventParam(
    'performanceFee',
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(performanceFee))
  );

  addStrategyV2Call.inputValues.push(strategyParam);
  addStrategyV2Call.inputValues.push(debtRatioParam);
  addStrategyV2Call.inputValues.push(minDebtPerHarvestParam);
  addStrategyV2Call.inputValues.push(maxDebtPerHarvestParam);
  addStrategyV2Call.inputValues.push(performanceFeeParam);

  return addStrategyV2Call;
}
