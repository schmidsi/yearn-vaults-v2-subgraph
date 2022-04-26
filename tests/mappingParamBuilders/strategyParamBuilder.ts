import { MockTransaction } from './mockTransaction';
import { MockBlock } from './mockBlock';
import { BigInt, ethereum, Address } from '@graphprotocol/graph-ts';
import {
  StrategyAdded,
  StrategyReported as StrategyReported_v0_3_0_v0_3_1_Event,
} from '../../generated/Registry/Vault';
import { Harvested } from '../../generated/templates/Vault/Strategy';
import { ParamFactoryBase } from './paramFactoryBase';

export class StrategyAddedEventBuilder extends ParamFactoryBase {
  vaultAddress: string;
  strategyAddress: string;
  debtLimit: string;
  performanceFee: string;
  rateLimit: string;

  mock: StrategyAdded;

  constructor(
    vaultAddress: string,
    strategyAddress: string,
    debtLimit: string,
    performanceFee: string,
    rateLimit: string,
    transaction: MockTransaction | null,
    block: MockBlock | null
  ) {
    super(transaction, block);

    this.vaultAddress = vaultAddress;
    this.debtLimit = debtLimit;
    this.performanceFee = performanceFee;
    this.rateLimit = rateLimit;
    this.strategyAddress = strategyAddress;

    // create the mock itself
    let eventParams = new Array<ethereum.EventParam>();

    eventParams.push(
      new ethereum.EventParam(
        'strategy',
        ethereum.Value.fromAddress(Address.fromString(this.strategyAddress))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'debtLimit',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(this.debtLimit))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'rateLimit',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(this.rateLimit))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'performanceFee',
        ethereum.Value.fromUnsignedBigInt(
          BigInt.fromString(this.performanceFee)
        )
      )
    );

    let releaseEvent = new StrategyAdded(
      Address.fromString(this.vaultAddress),
      BigInt.fromString(this.transaction.logIndex),
      BigInt.fromString(this.transaction.txnIndex),
      'default_log_type',
      this.block.mock,
      this.transaction.mock,
      eventParams
    );

    this.mock = releaseEvent;
  }
}

export class HarvestedEventBuilder {
  profit: string;
  loss: string;
  debtPayment: string;
  debtOutstanding: string;
  strategy: string;

  transaction: MockTransaction = MockTransaction.NewDefaultTxn();
  block: MockBlock = MockBlock.NewDefaultBlock();

  mock: Harvested;

  constructor(
    strategy: string,
    profit: string,
    loss: string,
    debtPayment: string,
    debtOutstanding: string,
    transaction: MockTransaction | null,
    mockBlock: MockBlock | null
  ) {
    if (transaction) {
      this.transaction = transaction;
    }
    if (mockBlock) {
      this.block = mockBlock;
    }

    this.strategy = strategy;
    this.profit = profit;
    this.loss = loss;
    this.debtPayment = debtPayment;
    this.debtOutstanding = debtOutstanding;

    let eventParams = new Array<ethereum.EventParam>();

    eventParams.push(
      new ethereum.EventParam(
        'profit',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(profit))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'loss',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(loss))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'debtPayment',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(debtPayment))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'debtOutstanding',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(debtOutstanding))
      )
    );

    let harvestEvent = new Harvested(
      Address.fromString(this.strategy),
      BigInt.fromString(this.transaction.logIndex),
      BigInt.fromString(this.transaction.txnIndex),
      'default_log_type',
      this.block.mock,
      this.transaction.mock,
      eventParams
    );

    this.mock = harvestEvent;
  }
}

export class StrategyReported_v0_3_0_v0_3_1EventBuilder {
  vault: string;
  strategy: string;
  gain: string;
  loss: string;
  totalGain: string;
  totalLoss: string;
  totalDebt: string;
  debtAdded: string;
  debtLimit: string;

  transaction: MockTransaction = MockTransaction.NewDefaultTxn();
  block: MockBlock = MockBlock.NewDefaultBlock();

  mock: StrategyReported_v0_3_0_v0_3_1_Event;

  constructor(
    vault: string,
    strategy: string,
    gain: string,
    loss: string,
    totalGain: string,
    totalLoss: string,
    totalDebt: string,
    debtAdded: string,
    debtLimit: string,
    transaction: MockTransaction | null,
    mockBlock: MockBlock | null
  ) {
    if (transaction) {
      this.transaction = transaction;
    }
    if (mockBlock) {
      this.block = mockBlock;
    }

    this.vault = vault;
    this.strategy = strategy;
    this.gain = gain;
    this.loss = loss;
    this.totalGain = totalGain;
    this.totalLoss = totalLoss;
    this.totalDebt = totalDebt;
    this.debtAdded = debtAdded;
    this.debtLimit = debtLimit;

    let eventParams = new Array<ethereum.EventParam>();

    eventParams.push(
      new ethereum.EventParam(
        'strategy',
        ethereum.Value.fromAddress(Address.fromString(this.strategy))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'gain',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(gain))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'loss',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(loss))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'totalGain',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(totalGain))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'totalLoss',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(totalLoss))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'totalDebt',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(totalDebt))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'debtAdded',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(debtAdded))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'debtLimit',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(debtLimit))
      )
    );

    let reportEvent = new StrategyReported_v0_3_0_v0_3_1_Event(
      Address.fromString(this.vault),
      BigInt.fromString(this.transaction.logIndex),
      BigInt.fromString(this.transaction.txnIndex),
      'default_log_type',
      this.block.mock,
      this.transaction.mock,
      eventParams
    );

    this.mock = reportEvent;
  }
}
