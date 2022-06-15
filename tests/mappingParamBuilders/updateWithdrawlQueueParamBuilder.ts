import { Address, ethereum, BigInt } from '@graphprotocol/graph-ts';
import { fatalTestError } from '../util';
import { MockBlock } from './mockBlock';
import { MockTransaction } from './mockTransaction';
import { ParamFactoryBase } from './paramFactoryBase';

/**
 * This class is used to dynamically create trigger mocks. It can only create triggers for events that have a single param representing an updated value, of which we have quite a few.
 * Eventually, we should add a way to codegen all of the mappingParamBuilders so this can be removed.
 */
export class UpdateWithdrawalQueueParamBuilder<
  EventTrigger
> extends ParamFactoryBase {
  subjectAddress: string;
  newValue: string[];

  mock: EventTrigger;

  constructor(
    subjectAddress: string,
    newValue: string[],
    transaction: MockTransaction | null,
    mockBlock: MockBlock | null
  ) {
    super(transaction, mockBlock);
    this.subjectAddress = subjectAddress;
    this.newValue = newValue;

    // create the mock itself
    let eventParams = new Array<ethereum.EventParam>();

    eventParams.push(
      new ethereum.EventParam(
        'param',
        ethereum.Value.fromAddressArray(
          newValue.map<Address>((v: string) => Address.fromString(v))
        )
      )
    );

    let event = instantiate<EventTrigger>(
      Address.fromString(this.subjectAddress),
      BigInt.fromString(this.transaction.logIndex),
      BigInt.fromString(this.transaction.txnIndex),
      'default_log_type',
      this.block.mock,
      this.transaction.mock,
      eventParams
    );

    this.mock = event;
  }
}
