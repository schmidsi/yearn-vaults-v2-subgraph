import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Token, Vault } from '../../../generated/schema';
import { Vault as VaultContract } from '../../../generated/Registry/Vault';
import { usdcPrice } from './usdc-oracle';

export class YShareOracle {
  GetNormalizedValueUSDC(shareToken: Token, quantity: BigInt): BigInt | null {
    let vault = Vault.load(shareToken.id);

    if (!vault) {
      // address doesn't correspond with any vaults we're aware of
      return null;
    } else {
      let vaultContract = VaultContract.bind(Address.fromString(shareToken.id));
      let pps = vaultContract.pricePerShare();
      let wantTokenEquivalent = quantity.times(pps);

      let wantToken = Token.load(vault.token);
      return usdcPrice(wantToken!, wantTokenEquivalent);
    }
  }
}
