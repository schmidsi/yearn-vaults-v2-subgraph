import { BigInt } from '@graphprotocol/graph-ts';
import { assert, log } from 'matchstick-as';

// This function is used to halt tests in a way that the tests's logs are still flushed to console.
// If we were to terminate the test using log.critical, the console would only have the critical log message
// and would be missing all of the other logs from the test.
export function fatalTestError(template: string, params: Array<string>): void {
  log.error(template, params);
  assert.stringEquals('Check most recent log error', '');
}

export function bigIntExponential(base: i32, exponent: i32): BigInt {
  let bigIntBase = BigInt.fromI32(base);
  let product = BigInt.fromI32(1);

  for (let i = 0; i < exponent; i++) {
    product = product.times(bigIntBase);
  }
  return product;
}

export function toHexStringPadded(value: BigInt): string {
  let s = value.toHex();
  if (s.length % 2 == 0) {
    return '0x' + s;
  } else {
    return '0x0' + s;
  }
}

// need this function because the assemblyscript map initializer seems to be broken
// let copiedMap = new Map(sourceMap) constructor is typed incorrectly.
// and let copiedMap = new Map<K,V>(sourceMap) is not implemented.
export function cloneMap<K, V>(sourceMap: Map<K, V>): Map<K, V> {
  let newMap = new Map<K, V>();

  let keys = sourceMap.keys();
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    newMap.set(key, sourceMap.get(key));
  }
  return newMap;
}

export function logMap(m: Map<string, string>): void {
  log.info('--Dumping Map--', []);
  let keys = m.keys();
  for (let i = 0; i < keys.length; i++) {
    let k = keys[i];
    let v = m.get(k);
    log.info('--> {} : {}', [k, v]);
  }
}

export class BalanceHelper {
  static addBalance(
    balances: Map<string, string>,
    account: string,
    amount: string
  ): Map<string, string> {
    if (!balances.has(account)) {
      fatalTestError(
        'The account {} does not have a prior balance specified. Cannot add {} to it.',
        [account, amount]
      );
    }

    let prevAccountBalance = BigInt.fromString(balances.get(account));
    let amountToAdd = BigInt.fromString(amount);

    let newBalance = prevAccountBalance.plus(amountToAdd);

    let newBalances = cloneMap(balances);
    newBalances.set(account, newBalance.toString());
    return newBalances;
  }

  static subtractBalance(
    balances: Map<string, string>,
    account: string,
    amount: string
  ): Map<string, string> {
    if (!balances.has(account)) {
      fatalTestError(
        'The account {} does not have a prior balance specified. Cannot add {} to it.',
        [account, amount]
      );
    }

    let prevAccountBalance = BigInt.fromString(balances.get(account));
    let amountToSubtract = BigInt.fromString(amount);

    if (prevAccountBalance.lt(amountToSubtract)) {
      fatalTestError(
        'The account {} only has {} tokens while {} tokens are being deducted. Result would be negative.',
        [account, prevAccountBalance.toString(), amountToSubtract.toString()]
      );
    }

    let newBalance = prevAccountBalance.minus(amountToSubtract);

    let newBalances = cloneMap(balances);
    newBalances.set(account, newBalance.toString());
    return newBalances;
  }
}
