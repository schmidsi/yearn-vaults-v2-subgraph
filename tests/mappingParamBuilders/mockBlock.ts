import { ByteArray, Bytes, ethereum, BigInt } from '@graphprotocol/graph-ts';
import { defaults } from '../default';
import { toHexStringPadded } from '../util';

export class MockBlock {
  private static blockCounter: u64 = 1;

  static NewDefaultBlock(): MockBlock {
    return new MockBlock(
      null, // hash
      null, // parent hash
      null, // timestamp
      null, // gasUsed
      null, // gasLimit
      null, // baseFeePerGas
      null // blockNumber
    );
  }

  static IncrementBlock(): void {
    MockBlock.blockCounter += 1;
  }

  hash: string;
  parentHash: string;
  timestamp: string;
  gasUsed: string = '15000000';
  gasLimit: string = '15000000';
  baseFeePerGas: string = '20';
  blockNumber: string;

  mock: ethereum.Block;

  constructor(
    hash: string | null,
    parentHash: string | null,
    timestamp: string | null,
    gasUsed: string | null,
    gasLimit: string | null,
    baseFeePerGas: string | null,
    blockNumber: string | null
  ) {
    if (gasUsed) {
      this.gasUsed = gasUsed;
    }
    if (gasLimit) {
      this.gasLimit = gasLimit;
    }
    if (baseFeePerGas) {
      this.baseFeePerGas = baseFeePerGas;
    }
    if (timestamp) {
      this.timestamp = timestamp;
    } else {
      // 10s block time
      let timestampInt: u64 = 10 * MockBlock.blockCounter;
      this.timestamp = timestampInt.toString();
    }

    if (blockNumber) {
      this.blockNumber = blockNumber;
    } else {
      this.blockNumber = MockBlock.blockCounter.toString();
    }

    if (hash) {
      this.hash = hash;
    } else {
      this.hash = toHexStringPadded(BigInt.fromU64(MockBlock.blockCounter));
    }

    if (parentHash) {
      this.parentHash = parentHash;
    } else {
      this.parentHash = toHexStringPadded(
        BigInt.fromU64(MockBlock.blockCounter - 1)
      );
    }

    // create the mock
    this.mock = new ethereum.Block(
      ByteArray.fromHexString(this.hash) as Bytes,
      ByteArray.fromHexString(this.parentHash) as Bytes,
      defaults.addressBytes, // uncle hash
      defaults.address, // author
      defaults.addressBytes, // state root
      defaults.addressBytes, // txn root
      defaults.addressBytes, // receipt root
      BigInt.fromString(this.blockNumber),
      BigInt.fromString(this.gasUsed),
      BigInt.fromString(this.gasLimit),
      BigInt.fromString(this.timestamp),
      BigInt.fromU64(1), // difficulty
      BigInt.fromU64(2), // totaldifficulty
      BigInt.fromU64(3), // size
      BigInt.fromString(this.baseFeePerGas)
    );
  }
}
