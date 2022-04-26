import { defaults } from '../default';
import { MockTransaction } from './mockTransaction';
import { MockBlock } from './mockBlock';
import { NewRelease } from '../../generated/Registry/Registry';
import { BigInt, ethereum, log, Address } from '@graphprotocol/graph-ts';
import { ParamFactoryBase } from './paramFactoryBase';

export class NewReleaseEventBuilder extends ParamFactoryBase {
  static DefaultAddress: string = defaults.registryAddress;

  registryAddress: string;
  releaseId: string;
  templateAddress: string;
  apiVersion: string;
  mock: NewRelease;

  constructor(
    registryAddress: string | null,
    releaseId: string | null,
    templateAddress: string | null,
    apiVersion: string | null,
    transaction: MockTransaction | null,
    block: MockBlock | null
  ) {
    /*    if (transaction) {
      this.transaction = transaction;
    } else {
			this.transaction = new MockTransaction(
				null, // fromAddress
				this.registryAddress, // toAddress
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
    if (block) {
      this.block = block;
    } else {
			this.block = MockBlock.NewDefaultBlock();
		}*/
    super(transaction, block);

    if (registryAddress) {
      this.registryAddress = registryAddress;
    } else {
      this.registryAddress = NewReleaseEventBuilder.DefaultAddress;
    }
    if (releaseId) {
      this.releaseId = releaseId;
    } else {
      this.releaseId = '1';
    }
    if (templateAddress) {
      this.templateAddress = templateAddress;
    } else {
      this.templateAddress = defaults.address.toHexString();
    }
    if (apiVersion) {
      this.apiVersion = apiVersion;
    } else {
      this.apiVersion = '0.0.0';
    }

    // create the mock itself
    let eventParams = new Array<ethereum.EventParam>();

    eventParams.push(
      new ethereum.EventParam(
        'release_id',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(this.releaseId))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'template',
        ethereum.Value.fromAddress(Address.fromString(this.templateAddress))
      )
    );

    eventParams.push(
      new ethereum.EventParam(
        'api_version',
        ethereum.Value.fromString(this.apiVersion)
      )
    );

    let releaseEvent = new NewRelease(
      Address.fromString(this.registryAddress),
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
