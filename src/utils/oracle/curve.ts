import { Address, dataSource, log } from '@graphprotocol/graph-ts';
import { CalculationsCurve } from '../../../generated/templates/Vault/CalculationsCurve';
import { CalculationsCurve_v0_8_7 as CalculationsCurve_0_8_7 } from '../../../generated/templates/Vault/CalculationsCurve_v0_8_7';
import {
  ETH_MAINNET_CALCULATIONS_CURVE_ADDRESS,
  ETH_MAINNET_NETWORK,
  FTM_MAINNET_CALCULATIONS_CURVE_ADDRESS_0_8_7,
  FTM_MAINNET_NETWORK,
} from '../constants';

interface CurveOracle {
  GetPool(tokenAddress: Address): Address | null;
  GetUnderlyingCoinFromPool(tokenAddress: Address): Address | null;
}

/* Interface for the unversioned curve oracle here: https://etherscan.io/address/0x25BF7b72815476Dd515044F9650Bf79bAd0Df655#code */
export class CurveOracle_0_8_4 implements CurveOracle {
  contract: CalculationsCurve;

  constructor(oracleAddress: Address) {
    this.contract = CalculationsCurve.bind(oracleAddress);
  }

  GetPool(tokenAddress: Address): Address | null {
    let pool = this.contract.try_getPool(tokenAddress);
    if (pool.reverted) {
      return null;
    } else {
      return pool.value;
    }
  }

  GetUnderlyingCoinFromPool(poolAddress: Address): Address | null {
    let underlying = this.contract.try_getUnderlyingCoinFromPool(poolAddress);
    if (underlying.reverted) {
      return null;
    } else {
      return underlying.value;
    }
  }
}

/* Interface for the unversioned curve oracle here: https://ftmscan.com/address/0x0b53e9df372e72d8fdcdbedfbb56059957a37128#code */
export class CurveOracle_0_8_7 implements CurveOracle {
  contract: CalculationsCurve_0_8_7;

  constructor(oracleAddress: Address) {
    this.contract = CalculationsCurve_0_8_7.bind(oracleAddress);
  }

  GetPool(tokenAddress: Address): Address | null {
    let pool = this.contract.try_getPoolFromLpToken(tokenAddress);
    if (pool.reverted) {
      return null;
    } else {
      return pool.value;
    }
  }

  GetUnderlyingCoinFromPool(poolAddress: Address): Address | null {
    let underlying = this.contract.try_getUnderlyingCoinFromPool(poolAddress);
    if (underlying.reverted) {
      return null;
    } else {
      return underlying.value;
    }
  }
}

export function getCurveCalculations(): CurveOracle {
  let network = dataSource.network();
  if (network == ETH_MAINNET_NETWORK) {
    return new CurveOracle_0_8_4(
      Address.fromString(ETH_MAINNET_CALCULATIONS_CURVE_ADDRESS)
    );
  } else if (network == FTM_MAINNET_NETWORK) {
    return new CurveOracle_0_8_7(
      Address.fromString(FTM_MAINNET_CALCULATIONS_CURVE_ADDRESS_0_8_7)
    );
  } else {
    log.critical('No curve oracle on network {}', [network]);
    throw new Error('No curve oracle on network.');
  }
}
