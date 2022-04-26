import { createMockedFunction, log, MockedFunction } from 'matchstick-as';
import { defaults } from '../default';
import { ethereum, BigInt, Address } from '@graphprotocol/graph-ts';
import { bigIntExponential, cloneMap, fatalTestError, logMap } from '../util';
import { GenericStateStub } from './genericStateStub';

export class TokenStub extends GenericStateStub {
  static DefaultTokenAddress: string = defaults.tokenAddress;

  nativeAddress: Address;
  nativeOracleAddress: Address;

  name: string = 'Dai Stablecoin';
  decimals: string = '18';
  symbol: string = 'DAI';
  private _balances: Map<string, string> = new Map<string, string>();
  usdcValue: string = '1000000';
  oracleAddress: string = '0x83d95e0d5f402511db06817aff3f9ea88224b030';

  static DefaultToken(address: string): TokenStub {
    return new TokenStub(
      address, // token address
      null, // token name
      null, // token decimals
      null, // token symbol
      null, // token balances
      null, // token usdc value
      null // price oracle address
    );
  }

  clone(): TokenStub {
    return new TokenStub(
      this.address,
      this.name,
      this.decimals,
      this.symbol,
      cloneMap(this._balances),
      this.usdcValue,
      this.oracleAddress
    );
  }

  constructor(
    address: string,
    name: string | null,
    decimals: string | null,
    symbol: string | null,
    balances: Map<string, string> | null,
    usdcValue: string | null,
    oracleAddress: string | null
  ) {
    super(address);
    this.nativeAddress = Address.fromString(this.address);

    if (name) {
      this.name = name;
    }
    if (decimals) {
      this.decimals = decimals;
    }
    if (symbol) {
      this.symbol = symbol;
    }
    if (balances) {
      this._balances = balances;
    }
    if (usdcValue) {
      this.usdcValue = usdcValue;
    }
    if (oracleAddress) {
      this.oracleAddress = oracleAddress;
    }
    this.nativeOracleAddress = Address.fromString(this.oracleAddress);

    // update stub fields
    this._updateStubField<string>('name', this.name);
    this._updateStubField<BigInt>('decimals', this.decimals);
    createMockedFunction(
      this.nativeAddress,
      'decimals',
      'decimals():(uint8)'
    ).returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(this.decimals)),
    ]);
    this._updateStubField<string>('symbol', this.symbol);

    createMockedFunction(
      this.nativeOracleAddress,
      'getPriceUsdcRecommended',
      'getPriceUsdcRecommended(address):(uint256)'
    )
      .withArgs([ethereum.Value.fromAddress(this.nativeAddress)])
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(this.usdcValue)),
      ]);

    let users = this._balances.keys();
    for (let i = 0; i < users.length; i++) {
      this.setAccountBalance(users[i], this._balances[users[i]]);
    }
  }

  hasAccountBalance(account: string): boolean {
    return this._balances.has(account);
  }

  getAccountBalance(account: string): string {
    if (this._balances.has(account)) {
      return this._balances.get(account);
    } else {
      fatalTestError('Account {} does not have a balance', [account]);
      return 'unreachable';
    }
  }

  /* 
	Use this function to populate the price oracle for a specific balance. 
	*/
  populatePriceOracleForBalance(amount: string): void {
    let amountInt = BigInt.fromString(amount);
    let value = BigInt.fromString(this.usdcValue).times(amountInt);

    let decimalDivisor = bigIntExponential(
      10,
      i32(Number.parseInt(this.decimals))
    );
    value = value.div(decimalDivisor);

    createMockedFunction(
      this.nativeOracleAddress,
      'getNormalizedValueUsdc',
      'getNormalizedValueUsdc(address,uint256):(uint256)'
    )
      .withArgs([
        ethereum.Value.fromAddress(this.nativeAddress),
        ethereum.Value.fromUnsignedBigInt(amountInt),
      ])
      .returns([ethereum.Value.fromUnsignedBigInt(value)]);
  }

  setAccountBalance(account: string, amount: string): void {
    this._balances.set(account, amount);

    let accountAddress = ethereum.Value.fromAddress(
      Address.fromString(account)
    );
    let amountInt = BigInt.fromString(amount);
    let accountBalance = ethereum.Value.fromUnsignedBigInt(amountInt);
    // mock address balance
    createMockedFunction(
      this.nativeAddress,
      'balanceOf',
      'balanceOf(address):(uint256)'
    )
      .withArgs([accountAddress])
      .returns([accountBalance]);

    this.populatePriceOracleForBalance(amount);
  }

  logBalances(): void {
    logMap(this._balances);
  }
}
