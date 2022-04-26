import {
  BigInt,
  ethereum,
  Address,
  Bytes,
  ByteArray,
} from '@graphprotocol/graph-ts';
import { getTransactionId } from '../../src/utils/transaction';
import { defaults } from '../default';

export class MockTransaction {
  private static txnHashCounter: u64 = 1;
  private static nextNonce: Map<string, i32> = new Map<string, i32>();
  private static nextTxLogIndex: Map<string, i32> = new Map<string, i32>();

  static NewDefaultTxn(): MockTransaction {
    return new MockTransaction(
      null, // fromAddress
      null, // toAddress
      null, // sentValue
      null, // txnHash
      null, // txnIndex
      null, // gasLimit
      null, // gasPrice
      null, // inputData
      null, // nonce
      null // logIndex
    );
  }

  fromAddress: string;
  toAddress: string;
  sentValue: string;
  txnHash: string;
  txnIndex: string;
  gasLimit: string;
  gasPrice: string;
  inputData: string;
  nonce: string;

  // This is a property of our Transaction entity, not the graph-ts Transaction class.
  logIndex: string;

  // Derived. Used for querying the Transaction entity.
  entityId: string;

  mock: ethereum.Transaction;

  constructor(
    fromAddress: string | null,
    toAddress: string | null,
    sentValue: string | null,
    txnHash: string | null,
    txnIndex: string | null,
    gasLimit: string | null,
    gasPrice: string | null,
    inputData: string | null,
    nonce: string | null,
    logIndex: string | null
  ) {
    if (fromAddress) {
      this.fromAddress = fromAddress;
    } else {
      this.fromAddress = defaults.address.toHexString();
    }
    if (toAddress) {
      this.toAddress = toAddress;
    } else {
      this.toAddress = defaults.address.toHexString();
    }
    if (sentValue) {
      this.sentValue = sentValue;
    } else {
      this.sentValue = '0';
    }
    if (txnHash) {
      this.txnHash = txnHash;
    } else {
      // enforce that each txn has a unique hash
      this.txnHash = Bytes.fromU64(
        MockTransaction.txnHashCounter
      ).toHexString();
      MockTransaction.txnHashCounter += 1;
    }
    if (gasLimit) {
      this.gasLimit = gasLimit;
    } else {
      // i64.max
      this.gasLimit = '9223372036854775807';
    }
    if (gasPrice) {
      this.gasPrice = gasPrice;
    } else {
      this.gasPrice = '20';
    }
    if (inputData) {
      this.inputData = inputData;
    } else {
      this.inputData = '0x00';
    }
    if (nonce) {
      this.nonce = nonce;
    } else {
      if (MockTransaction.nextNonce.has(this.fromAddress)) {
        let addrNonce = MockTransaction.nextNonce.get(this.fromAddress);
        this.nonce = addrNonce.toString();
        MockTransaction.nextNonce.set(this.fromAddress, addrNonce + 1);
      } else {
        MockTransaction.nextNonce.set(this.fromAddress, 1);
        this.nonce = '0';
      }
    }
    if (txnIndex) {
      this.txnIndex = txnIndex;
    } else {
      this.txnIndex = '0';
    }

    if (logIndex) {
      this.logIndex = logIndex;
    } else {
      if (MockTransaction.nextTxLogIndex.has(this.txnHash)) {
        let logIndex = MockTransaction.nextTxLogIndex.get(this.txnHash);
        this.logIndex = logIndex.toString();
        MockTransaction.nextTxLogIndex.set(this.txnHash, logIndex + 1);
      } else {
        MockTransaction.nextTxLogIndex.set(this.txnHash, 1);
        this.logIndex = '0';
      }
    }

    this.entityId = getTransactionId(
      Bytes.fromHexString(this.txnHash).toHexString(),
      this.logIndex
    );

    // create the mock
    this.mock = new ethereum.Transaction(
      ByteArray.fromHexString(this.txnHash) as Bytes,
      BigInt.fromString(this.txnIndex),
      Address.fromString(this.fromAddress),
      Address.fromString(this.toAddress),
      BigInt.fromString(this.sentValue),
      BigInt.fromString(this.gasLimit),
      BigInt.fromString(this.gasPrice),
      ByteArray.fromHexString(this.inputData) as Bytes,
      BigInt.fromString(this.nonce)
    );
  }
}
