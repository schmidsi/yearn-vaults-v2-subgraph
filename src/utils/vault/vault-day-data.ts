import {
  Token,
  Transaction,
  Vault,
  VaultDayData,
  VaultUpdate,
} from '../../../generated/schema';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { BIGINT_ZERO } from '../constants';
import { usdcPricePerToken } from '../oracle/usdc-oracle';
import { getTimeInMillis } from '../commons';
import { log } from 'matchstick-as';

export function updateVaultDayData(
  transaction: Transaction,
  vault: Vault,
  vaultUpdate: VaultUpdate
): void {
  let timestamp = transaction.timestamp;
  let dayIndex = getDayIndexFromTimestamp(timestamp);
  let vaultDayID = getDayIDFromIndex(vault.id, dayIndex);

  let vaultDayData = VaultDayData.load(vaultDayID);
  if (vaultDayData === null) {
    log.debug('[VaultDayData] No VaultDayData found for {}. Creating.', [
      vaultDayID,
    ]);
    vaultDayData = new VaultDayData(vaultDayID);
    vaultDayData.timestamp = getTimeInMillis(getDayStartTimestamp(timestamp));
    vaultDayData.vault = vault.id;
    vaultDayData.pricePerShare = vaultUpdate.currentPricePerShare;
    vaultDayData.deposited = BIGINT_ZERO;
    vaultDayData.withdrawn = BIGINT_ZERO;
    vaultDayData.totalReturnsGenerated = BIGINT_ZERO;
    vaultDayData.totalReturnsGeneratedUSDC = BIGINT_ZERO;
    vaultDayData.dayReturnsGenerated = BIGINT_ZERO;
    vaultDayData.dayReturnsGeneratedUSDC = BIGINT_ZERO;
  }
  let usdcPrice = usdcPricePerToken(Address.fromString(vault.token));
  vaultDayData.tokenPriceUSDC = usdcPrice;

  vaultDayData.pricePerShare = vaultUpdate.currentPricePerShare;
  vaultDayData.deposited = vaultDayData.deposited.plus(
    vaultUpdate.tokensDeposited
  );
  vaultDayData.withdrawn = vaultDayData.withdrawn.plus(
    vaultUpdate.tokensWithdrawn
  );
  vaultDayData.dayReturnsGenerated = vaultDayData.dayReturnsGenerated.plus(
    vaultUpdate.returnsGenerated
  );

  let underlying = Token.load(vault.token);
  // @ts-ignore
  let u8Decimals = u8(underlying!.decimals);
  let priceDivisor = BigInt.fromI32(10).pow(u8Decimals);

  vaultDayData.dayReturnsGeneratedUSDC = vaultUpdate.returnsGenerated
    .times(usdcPrice)
    .div(priceDivisor);

  // Multiple days can pass between a vaultDayData being posted, so we look up to maxSearchDepth days in the past.
  // In the future, should use a better approach.
  let daysInPast = 1;
  let maxSearchDepth = 100;
  while (daysInPast <= maxSearchDepth) {
    let previousVaultDayData = VaultDayData.load(
      getDayIDFromIndex(vault.id, dayIndex.minus(BigInt.fromI32(daysInPast)))
    );
    if (previousVaultDayData !== null) {
      vaultDayData.totalReturnsGenerated = previousVaultDayData.totalReturnsGenerated.plus(
        vaultDayData.dayReturnsGenerated
      );
      vaultDayData.totalReturnsGeneratedUSDC = previousVaultDayData.totalReturnsGeneratedUSDC.plus(
        vaultDayData.dayReturnsGenerated.times(usdcPrice).div(priceDivisor)
      );
      break;
    } else {
      daysInPast += 1;
      if (daysInPast > maxSearchDepth) {
        vaultDayData.totalReturnsGenerated = vaultDayData.dayReturnsGenerated;
        vaultDayData.totalReturnsGeneratedUSDC = vaultDayData.dayReturnsGenerated
          .times(usdcPrice)
          .div(priceDivisor);
      }
    }
  }

  vaultDayData.save();
}

export function getDayIndexFromTimestamp(timestamp: BigInt): BigInt {
  return timestamp.div(BigInt.fromI32(86400000));
}

export function getDayIDFromIndex(vaultID: string, dayID: BigInt): string {
  return (
    vaultID
      .toString()
      .concat('-')
      // @ts-ignore
      .concat(dayID.toString())
  );
}

function getDayStartTimestamp(timestamp: BigInt): BigInt {
  let milliSecsInDay = BigInt.fromI32(86400000);
  return timestamp.div(milliSecsInDay).times(milliSecsInDay);
}
