import { Address, BigInt, log, dataSource } from '@graphprotocol/graph-ts';
import { Oracle as OracleContract } from '../../../generated/Registry/Oracle';
import { Token } from '../../../generated/schema';
import { CalculationsSushiSwap as CalculationsSushiSwapContract } from '../../../generated/templates/Vault/CalculationsSushiSwap';
import { fatalTestError } from '../../../tests/util';
import {
  BIGINT_ZERO,
  ETH_MAINNET_CALCULATIONS_SUSHI_SWAP_ADDRESS,
  ETH_MAINNET_NETWORK,
  FTM_MAINNET_NETWORK,
  ETH_MAINNET_USDC_ORACLE_ADDRESS,
  FTM_MAINNET_CALCULATIONS_SUSHI_SWAP_ADDRESS,
  FTM_MAINNET_USDC_ORACLE_ADDRESS,
  ARB_MAINNET_NETWORK,
  ARB_MAINNET_USDC_ORACLE_ADDRESS,
  ARB_MAINNET_CALCULATIONS_SUSHI_SWAP_ADDRESS,
} from '../constants';
import { getCurveCalculations } from './curve';
import { YShareOracle } from './yShare';

function getSushiSwapCalculationsAddress(network: string): Address {
  let map = new Map<string, string>();
  map.set(ETH_MAINNET_NETWORK, ETH_MAINNET_CALCULATIONS_SUSHI_SWAP_ADDRESS);
  map.set(FTM_MAINNET_NETWORK, FTM_MAINNET_CALCULATIONS_SUSHI_SWAP_ADDRESS);
  map.set(ARB_MAINNET_NETWORK, ARB_MAINNET_CALCULATIONS_SUSHI_SWAP_ADDRESS);
  let address = changetype<Address>(Address.fromHexString(map.get(network)));
  return address;
}

function getOracleCalculatorAddress(network: string): Address {
  log.debug('[Oracle] Loading price oracle for network: {}', [network]);
  let map = new Map<string, string>();
  map.set(ETH_MAINNET_NETWORK, ETH_MAINNET_USDC_ORACLE_ADDRESS);
  map.set(FTM_MAINNET_NETWORK, FTM_MAINNET_USDC_ORACLE_ADDRESS);
  map.set(ARB_MAINNET_NETWORK, ARB_MAINNET_USDC_ORACLE_ADDRESS);
  let address = changetype<Address>(Address.fromHexString(map.get(network)));
  return address;
}

function getSushiSwapCalculations(): CalculationsSushiSwapContract {
  let network = dataSource.network();
  return CalculationsSushiSwapContract.bind(
    getSushiSwapCalculationsAddress(network)
  );
}

function getOracleCalculator(): OracleContract {
  let network = dataSource.network();
  return OracleContract.bind(getOracleCalculatorAddress(network));
}

export function usdcPrice(token: Token, tokenAmount: BigInt): BigInt {
  let tokenAddress = Address.fromString(token.id);
  let decimals = BigInt.fromI32(token.decimals);

  let oracleCalculatorPrice = getTokenPriceFromOracle(
    tokenAddress,
    tokenAmount
  );

  if (oracleCalculatorPrice.notEqual(BIGINT_ZERO)) {
    return oracleCalculatorPrice;
  } else {
    log.info(
      '[TokenPrice] Yearn-lens oracle did not have token price for {} {}',
      [tokenAddress.toHexString(), tokenAmount.toString()]
    );
  }

  let ppsCalculatorPrice = getTokenPriceFromPPS(token, tokenAmount);

  if (ppsCalculatorPrice.notEqual(BIGINT_ZERO)) {
    return ppsCalculatorPrice;
  } else {
    log.info(
      '[TokenPrice] PricePerShare oracle did not have token price for {} {}',
      [tokenAddress.toHexString(), tokenAmount.toString()]
    );
  }

  let sushiSwapCalculatorPrice = getTokenPriceFromSushiSwap(
    tokenAddress,
    tokenAmount,
    decimals
  );
  if (sushiSwapCalculatorPrice.notEqual(BIGINT_ZERO)) {
    return sushiSwapCalculatorPrice;
  } else {
    log.info(
      '[TokenPrice] Sushiswap oracle did not have a token price for {}',
      [tokenAddress.toHexString()]
    );
  }
  let curveCalculatorPrice = getTokenPriceFromCurve(
    tokenAddress,
    tokenAmount,
    decimals
  );
  if (curveCalculatorPrice.notEqual(BIGINT_ZERO)) {
    return curveCalculatorPrice;
  }
  log.error(
    '[TokenPrice] Cannot get token {} / {} price from calculators. Amount {}',
    [tokenAddress.toHexString(), decimals.toString(), tokenAmount.toString()]
  );
  return BIGINT_ZERO;
}

export function usdcPricePerToken(tokenAddress: Address): BigInt {
  log.debug('[Oracle] Obtaining price for token {}', [
    tokenAddress.toHexString(),
  ]);
  let oracle = getOracleCalculator();
  log.debug('[Oracle] Oracle calculator load attempted', []);
  if (oracle !== null) {
    let result = oracle.try_getPriceUsdcRecommended(tokenAddress);
    if (result.reverted) {
      log.info('[Oracle] Oracle reverted while obtaining price info for {}', [
        tokenAddress.toHexString(),
      ]);
    } else {
      log.debug('[Oracle] {} token price is {}', [
        tokenAddress.toHexString(),
        result.value.toString(),
      ]);
      return result.value;
    }
  } else {
    log.debug(
      '[Oracle] Unable to load oracle for the currently deployed network',
      []
    );
  }
  return BIGINT_ZERO;
}

function getTokenPriceFromOracle(
  tokenAddress: Address,
  tokenAmount: BigInt
): BigInt {
  let calculator = getOracleCalculator();
  log.info('[TokenPrice] Trying to get token {} price from Oracle.', [
    tokenAddress.toHexString(),
  ]);
  if (calculator !== null) {
    let result = calculator.try_getNormalizedValueUsdc(
      tokenAddress,
      tokenAmount
    );
    if (result.reverted === false) {
      return result.value;
    } else {
      log.warning(
        "[TokenPrice] Cannot get token {} price from Oracle. 'getNormalizedValueUsdc({}, {})' call failed.",
        [
          tokenAddress.toHexString(),
          tokenAddress.toHexString(),
          tokenAmount.toString(),
        ]
      );
    }
  } else {
    log.warning(
      '[TokenPrice] Cannot get token {} price from Oracle. It is undefined.',
      [tokenAddress.toHexString()]
    );
  }
  return BIGINT_ZERO;
}

function getTokenPriceFromPPS(token: Token, amount: BigInt): BigInt {
  let oracle = new YShareOracle();
  let value = oracle.GetNormalizedValueUSDC(token, amount);
  if (!value) {
    return BIGINT_ZERO;
  } else {
    return value;
  }
}

function getTokenPriceFromCurve(
  tokenAddress: Address,
  tokenAmount: BigInt,
  decimals: BigInt
): BigInt {
  let calculator = getCurveCalculations();
  log.info('[TokenPrice] Trying to get token {} price from Curve.', [
    tokenAddress.toHexString(),
  ]);
  if (calculator !== null) {
    let pool = calculator.GetPool(tokenAddress);
    if (pool) {
      log.info('[TokenPrice] Getting token {} price from Curve.', [
        tokenAddress.toHexString(),
      ]);
      let underlying = calculator.GetUnderlyingCoinFromPool(pool);
      if (underlying) {
        return getTokenPriceFromSushiSwap(underlying, tokenAmount, decimals);
      } else {
        log.warning(
          "[TokenPrice] Cannot to get token {} price from Curve. 'getUnderlyingCoinFromPool({})' Call failed.",
          [tokenAddress.toHexString(), pool.toString()]
        );
      }
    } else {
      log.warning(
        "[TokenPrice] Cannot to get token {} price from Curve. 'getPool({})' call failed.",
        [tokenAddress.toHexString(), tokenAddress.toHexString()]
      );
    }
  } else {
    log.warning(
      '[TokenPrice] Cannot get token {} price from Curve. It is undefined.',
      [tokenAddress.toHexString()]
    );
  }
  return BIGINT_ZERO;
}

function getTokenPriceFromSushiSwap(
  tokenAddress: Address,
  tokenAmount: BigInt,
  decimals: BigInt
): BigInt {
  let calculator = getSushiSwapCalculations();
  log.info('[TokenPrice] Getting token {} / {} price from SushiSwap.', [
    tokenAddress.toHexString(),
    decimals.toString(),
  ]);
  if (calculator !== null) {
    log.info('[TokenPrice] Getting token {} / {} price from SushiSwap.', [
      tokenAddress.toHexString(),
      decimals.toString(),
    ]);
    let price = calculator.try_getPriceUsdc(tokenAddress);
    if (price.reverted === false) {
      return price.value.times(tokenAmount).div(decimals);
    } else {
      log.warning(
        "[TokenPrice] Cannot get token {} / {} price from SushiSwap. 'getPriceUsdc({})' call failed.",
        [
          tokenAddress.toHexString(),
          decimals.toString(),
          tokenAddress.toHexString(),
        ]
      );
    }
  } else {
    log.warning(
      '[TokenPrice] Cannot get token {} / {} price from SushiSwap. Calculator is undefined.',
      [tokenAddress.toHexString(), decimals.toString()]
    );
  }
  return BIGINT_ZERO;
}
