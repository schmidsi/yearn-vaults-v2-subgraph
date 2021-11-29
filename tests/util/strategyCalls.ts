import {
  AddStrategy1Call as AddStrategyV2Call,
  AddStrategyCall as AddStrategyV1Call,
} from '../../generated/Registry/Vault';
import { BigInt, ethereum, log, Address } from '@graphprotocol/graph-ts';
import { defaults } from '../default';

export function createMockAddStrategyV1Call(
  strategy: Address,
  vaultAddress: Address,
  debtLimit: string,
  rateLimit: string,
  performanceFee: string
): AddStrategyV1Call {
  let mockTransaction = new ethereum.Transaction(
    defaults.address,
    defaults.bigInt,
    defaults.address,
    vaultAddress,
    defaults.bigInt,
    defaults.bigInt,
    defaults.bigInt,
    defaults.addressBytes
  );

  let addStrategyV1Call = new AddStrategyV1Call(
    vaultAddress,
    defaults.address,
    defaults.block,
    mockTransaction,
    [],
    []
  );

  addStrategyV1Call.inputValues = new Array();

  let strategyParam = new ethereum.EventParam(
    'strategy',
    ethereum.Value.fromAddress(strategy)
  );
  let debtLimitParam = new ethereum.EventParam(
    'debtLimit',
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(debtLimit))
  );
  let rateLimitParam = new ethereum.EventParam(
    'rateLimit',
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(rateLimit))
  );
  let performanceFeeParam = new ethereum.EventParam(
    'performanceFee',
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(performanceFee))
  );

  addStrategyV1Call.inputValues.push(strategyParam);
  addStrategyV1Call.inputValues.push(debtLimitParam);
  addStrategyV1Call.inputValues.push(rateLimitParam);
  addStrategyV1Call.inputValues.push(performanceFeeParam);

  return addStrategyV1Call;
}

export function createMockAddStrategyV2Call(
  strategy: Address,
  vaultAddress: Address,
  debtRatio: i32,
  minDebtPerHarvest: i32,
  maxDebtPerHarvest: i32,
  performanceFee: i32
): AddStrategyV2Call {
  let mockTransaction = new ethereum.Transaction(
    defaults.address,
    defaults.bigInt,
    defaults.address,
    vaultAddress,
    defaults.bigInt,
    defaults.bigInt,
    defaults.bigInt,
    defaults.addressBytes
  );

  let addStrategyV2Call = new AddStrategyV2Call(
    vaultAddress,
    defaults.address,
    defaults.block,
    mockTransaction,
    [],
    []
  );

  addStrategyV2Call.inputValues = new Array();

  let strategyParam = new ethereum.EventParam(
    'strategy',
    ethereum.Value.fromAddress(strategy)
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
