import { clearStore, test, assert } from 'matchstick-as/assembly/index';
import { BIGINT_MAX } from '../src/utils/constants';
import { defaults } from './default';
import { CreateVaultTransition } from './transitionMocks/createVaultTransition';
import { DepositWithAmountCallTransition } from './transitionMocks/depositTransition';

test('https://github.com/yearn/yearn-vaults-v2-subgraph/issues/99', () => {
  clearStore();
  let sharesMinted = '79056085';
  let amountDeposited = BIGINT_MAX;

  let recipient = defaults.senderAddress;
  let shareTokenBalances = new Map<string, string>();
  let wantTokenBalances = new Map<string, string>();
  wantTokenBalances.set(recipient, sharesMinted);

  let vaultEntity = CreateVaultTransition.DefaultVaultWithUnDepositedBalances(
    wantTokenBalances,
    shareTokenBalances
  );

  // this represents a side case where the amount deposited
  let depositTransition = new DepositWithAmountCallTransition(
    vaultEntity.stub,
    amountDeposited.toString(),
    amountDeposited.toString(),
    recipient,
    true // suppressMinimumBalanceErrors
  );

  let txn = depositTransition.mockCall.transaction;
  let transactionHashId = txn.txnHash.concat('-').concat(txn.logIndex);
  let depositId = recipient
    .concat('-')
    .concat(transactionHashId)
    .concat('-')
    .concat(txn.txnIndex);

  // Verify Deposit amount is equal to sharesMinted, not BIGINT_MAX
  assert.fieldEquals('Deposit', depositId, 'tokenAmount', sharesMinted);
});
