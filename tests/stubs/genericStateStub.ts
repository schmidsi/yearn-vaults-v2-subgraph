import { ethereum, Address, BigInt } from '@graphprotocol/graph-ts';
import { createMockedFunction, log } from 'matchstick-as';
import { fatalTestError } from '../util';

export class GenericStateStub {
  address: string;

  constructor(contractAddress: string) {
    this.address = contractAddress;
  }

  protected _updateStubField<T>(funcName: string, v: string): void {
    // @ts-ignore
    let paramType: string = nameof<T>();
    if (paramType == 'BigInt') {
      createMockedFunction(
        Address.fromString(this.address),
        funcName,
        funcName.concat('():(uint256)')
      ).returns([
        // @ts-ignore
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(v)),
      ]);
    } else if (paramType == 'Address') {
      createMockedFunction(
        Address.fromString(this.address),
        funcName,
        funcName.concat('():(address)')
      ).returns([
        // @ts-ignore
        ethereum.Value.fromAddress(Address.fromString(v)),
      ]);
    } else if (paramType == 'String') {
      createMockedFunction(
        Address.fromString(this.address),
        funcName,
        funcName.concat('():(string)')
      ).returns([
        // @ts-ignore
        ethereum.Value.fromString(v),
      ]);
    } else if (paramType == 'bool') {
      let boolValue = false;
      if (v == 'true') {
        boolValue = true;
      }
      createMockedFunction(
        Address.fromString(this.address),
        funcName,
        funcName.concat('():(bool)')
      ).returns([
        // @ts-ignore
        ethereum.Value.fromBoolean(boolValue),
      ]);
    } else {
      fatalTestError('Cannot decode type {}', [paramType]);
    }
  }
}
