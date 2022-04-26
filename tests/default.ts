import { BigInt, ethereum, Address, Bytes } from '@graphprotocol/graph-ts';

export namespace defaults {
  export const address = Address.fromString(
    '0xa16081f360e3847006db660bae1c6d1b2e17ec2a'
  );
  export const addressString = '0xa16081f360e3847006db660bae1c6d1b2e17ec2a';
  export const addressBytes = Address.fromString(
    '0xa16081f360e3847006db660bae1c6d1b2e17ec2a'
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
    bigInt,
    bigInt
  );
  export const eventDataLogType = 'default_log_type';
  export const transaction = new ethereum.Transaction(
    addressBytes,
    bigInt,
    address,
    address,
    bigInt,
    bigInt,
    bigInt,
    addressBytes,
    bigInt // nonce
  );

  export const registryAddress = '0xe15461b18ee31b7379019dc523231c57d1cbc18c';
  export const tokenAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
  export const vaultAddress = '0xacd43e627e64355f1861cec6d3a6688b31a6f952';
  export const treasuryAddress = '0x93a62da5a14c80f265dabc077fcee437b1a0efde';

  export const senderAddress = '0x77ca952092460102b3f4e315a57c484e2490d099';
  export const anotherAddress = '0xab5801a7d398351b8be11c439e05c5b3259aec9b';

  export const strategyAddress = '0x3280499298ace3fd3cd9c2558e9e8746ace3e52d';
  export const strategistAddress = '0xea674fdde714fd979de3edf0f56aa9716b898ec8';
  export const keeperAddress = '0x736d7e3c5a6cb2ce3b764300140abf476f6cfccf';
  export const rewardsAddress = '0xc491599b9a20c3a2f0a85697ee6d9434efa9f503';
}
