import { BigInt, ethereum, Address, Bytes } from '@graphprotocol/graph-ts';

export namespace defaults {
  export const address = Address.fromString(
    '0xA16081F360e3847006dB660bae1c6d1b2e17eC2A'
  );
  export const addressString = '0xA16081F360e3847006dB660bae1c6d1b2e17eC2A';
  export const addressBytes = Address.fromString(
    '0xA16081F360e3847006dB660bae1c6d1b2e17eC2A'
  ) as Bytes;
  export const bigInt = BigInt.fromI32(1);
  export const string = 'this is a default string';
  export const i32 = 1;
  export const block = new ethereum.Block(
    addressBytes,
    addressBytes,
    addressBytes,
    address,
    addressBytes,
    addressBytes,
    addressBytes,
    bigInt,
    bigInt,
    bigInt,
    bigInt,
    bigInt,
    bigInt,
    bigInt
  );
  export const eventDataLogType = 'default_log_type';
}
