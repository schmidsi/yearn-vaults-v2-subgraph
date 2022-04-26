import { MockBlock } from './mockBlock';
import { MockTransaction } from './mockTransaction';

export class ParamFactoryBase {
  transaction: MockTransaction;
  block: MockBlock;

  constructor(transaction: MockTransaction | null, block: MockBlock | null) {
    if (transaction) {
      this.transaction = transaction;
    } else {
      this.transaction = MockTransaction.NewDefaultTxn();
    }

    if (block) {
      this.block = block;
    } else {
      this.block = MockBlock.NewDefaultBlock();
    }
  }
}
