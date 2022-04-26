import { assert, clearStore, log, test } from 'matchstick-as/assembly/index';
import { VaultStub } from './stubs/vaultStateStub';
import { CreateVaultTransition } from './transitionMocks/createVaultTransition';
import { defaults } from './default';
import { validateDepositStateTransition } from './assertations/vaultDeposit';
import {
  DepositCallTransition,
  DepositEventTransition,
  DepositWithAmountAndRecipientCallTransition,
  DepositWithAmountCallTransition,
} from './transitionMocks/depositTransition';
import {
  WithdrawCallTransition,
  WithdrawEventTransition,
} from './transitionMocks/withdrawTransition';
import { validateWithdrawalStateTransition } from './assertations/vaultWithdraw';
import {
  handleDepositEvent,
  handleDepositWithAmount,
  handleDepositWithAmountAndRecipient,
  handleWithdraw,
  handleWithdrawEvent,
} from '../src/mappings/vaultMappings';
import { TokenStub } from './stubs/tokenStateStub';

test('Test handleDeposit (call)', () => {
  clearStore();

  let amount = '79056085';
  let recipient = defaults.senderAddress;
  let shareTokenBalances = new Map<string, string>();
  let wantTokenBalances = new Map<string, string>();
  wantTokenBalances.set(recipient, amount);

  let vaultEntity = CreateVaultTransition.DefaultVaultWithUnDepositedBalances(
    wantTokenBalances,
    shareTokenBalances
  );

  let depositTransition = new DepositCallTransition(
    vaultEntity.stub,
    amount,
    amount,
    recipient
  );

  validateDepositStateTransition(
    defaults.senderAddress, //beneficiary
    vaultEntity.stub.address, // vault address
    vaultEntity.stub.wantToken.address, // want token
    depositTransition.mockCall.transaction.txnHash,
    amount, // expected deposit amount
    amount, // expected shares minted
    vaultEntity.stub.pricePerShare,
    depositTransition.mockCall.transaction.txnIndex,
    depositTransition.mockCall.transaction.logIndex
  );

  // only here for broken test coverage checker
  //handleDeposit(depositTransition.mockCall.mock);
});

test('Test handleDepositWithAmount (call)', () => {
  clearStore();

  let amount = '79056085';
  let recipient = defaults.senderAddress;

  let shareTokenBalances = new Map<string, string>();
  let wantTokenBalances = new Map<string, string>();
  wantTokenBalances.set(recipient, amount);

  let vaultEntity = CreateVaultTransition.DefaultVaultWithUnDepositedBalances(
    wantTokenBalances,
    shareTokenBalances
  );

  let depositTransition = new DepositWithAmountCallTransition(
    vaultEntity.stub,
    amount,
    amount,
    recipient,
    false
  );

  validateDepositStateTransition(
    defaults.senderAddress, //beneficiary
    vaultEntity.stub.address, // vault address
    vaultEntity.stub.wantToken.address, // want token
    depositTransition.mockCall.transaction.txnHash,
    amount, // expected deposit amount
    amount, // expected shares minted
    vaultEntity.stub.pricePerShare,
    depositTransition.mockCall.transaction.txnIndex,
    depositTransition.mockCall.transaction.logIndex
  );

  // only here for broken test coverage checker.
  handleDepositWithAmount(depositTransition.mockCall.mock);
});

test('Test handleDepositWithAmountAndRecipient (call)', () => {
  clearStore();

  let amount = '79056085';
  let recipient = defaults.senderAddress;
  let benefactor = defaults.anotherAddress;
  let shareTokenBalances = new Map<string, string>();
  shareTokenBalances.set(defaults.senderAddress, '0');

  let wantTokenBalances = new Map<string, string>();
  wantTokenBalances.set(VaultStub.DefaultAddress, '0');
  wantTokenBalances.set(recipient, amount);

  let vaultEntity = CreateVaultTransition.DefaultVaultWithUnDepositedBalances(
    wantTokenBalances,
    shareTokenBalances
  );

  let depositTransition = new DepositWithAmountAndRecipientCallTransition(
    vaultEntity.stub,
    amount,
    amount,
    recipient,
    benefactor
  );

  validateDepositStateTransition(
    recipient, //beneficiary
    vaultEntity.stub.address, // vault address
    vaultEntity.stub.wantToken.address, // want token
    depositTransition.mockCall.transaction.txnHash,
    amount, // expected deposit amount
    amount, // expected shares minted
    vaultEntity.stub.pricePerShare,
    depositTransition.mockCall.transaction.txnIndex,
    depositTransition.mockCall.transaction.logIndex
  );

  // only here for broken test coverage checker.
  handleDepositWithAmountAndRecipient(depositTransition.mockCall.mock);
});

test('Test handleWithdraw (call)', () => {
  clearStore();
  // set up the deposit
  let amount = '79056085';
  let shareTokenBalances = new Map<string, string>();
  let sender = defaults.senderAddress;
  let vaultAddress = VaultStub.DefaultAddress;
  shareTokenBalances.set(sender, '0');
  shareTokenBalances.set(vaultAddress, '0');

  let wantTokenBalances = new Map<string, string>();
  wantTokenBalances.set(vaultAddress, '0');
  wantTokenBalances.set(sender, amount);

  let vaultEntity = CreateVaultTransition.DefaultVaultWithUnDepositedBalances(
    wantTokenBalances,
    shareTokenBalances
  );

  let depositTransition = new DepositCallTransition(
    vaultEntity.stub,
    amount,
    amount,
    sender
  );

  // set up the withdraw
  let withdrawTransition = new WithdrawCallTransition(
    depositTransition.postDepositStub,
    amount,
    amount,
    sender
  );

  validateWithdrawalStateTransition(
    sender,
    vaultAddress,
    withdrawTransition.mockCall.transaction.txnHash,
    amount,
    amount,
    withdrawTransition.postWithdrawStub.pricePerShare,
    withdrawTransition.mockCall.transaction.txnIndex,
    withdrawTransition.mockCall.transaction.logIndex
  );

  // only here for broken test coverage checker
  handleWithdraw(withdrawTransition.mockCall.mock);
});

test('Deposit call handlers shouldnt fire if Vault apiVersion > 0.4.3', () => {
  clearStore();
  let amount = '79056085';
  let apiVersion = '0.4.4';
  let recipient = defaults.senderAddress;
  let shareTokenBalances = new Map<string, string>();
  shareTokenBalances.set(defaults.senderAddress, '0');

  let wantTokenBalances = new Map<string, string>();
  wantTokenBalances.set(VaultStub.DefaultAddress, '0');
  wantTokenBalances.set(recipient, amount);

  let vaultEntity = new CreateVaultTransition(
    new VaultStub(
      null, // total supply
      null, // total assets
      null, // total debt
      null, // price per share
      null, // performance fee
      null, // management fee
      null, // activation
      apiVersion, // apiVersion
      null, // rewardsAddress
      null, // guardianAddress
      null, // managementAddress
      null, // governanceAddress
      null, // depositLimit
      null, // availableDepositLimit
      new TokenStub( //shareToken
        VaultStub.DefaultAddress, // token address
        null, // token name
        null, // token decimals
        null, // token symbol
        shareTokenBalances, // token balances
        null, // token usdc value
        null // price oracle address
      ),
      new TokenStub( // wantToken
        TokenStub.DefaultTokenAddress, // token address
        null, // token name
        null, // token decimals
        null, // token symbol
        wantTokenBalances, // token balances
        null, // token usdc value
        null // price oracle address
      )
    ),
    null, //registryAddress
    null, //releaseId
    null //apiversion
  );

  let depositTransition = new DepositCallTransition(
    vaultEntity.stub,
    amount,
    amount,
    recipient
  );

  let transactionHashId = depositTransition.mockCall.transaction.txnHash
    .concat('-')
    .concat(defaults.bigInt.toString());
  let depositId = recipient
    .concat('-')
    .concat(transactionHashId)
    .concat('-')
    .concat(depositTransition.mockCall.transaction.txnIndex);
  assert.notInStore('Deposit', depositId);
});

test('Withdraw call handlers shouldnt fire if Vault apiVersion > 0.4.3', () => {
  clearStore();
  let amount = '79056085';
  let apiVersion = '0.4.4';
  let recipient = defaults.senderAddress;
  let shareTokenBalances = new Map<string, string>();
  shareTokenBalances.set(defaults.senderAddress, '0');

  let wantTokenBalances = new Map<string, string>();
  wantTokenBalances.set(VaultStub.DefaultAddress, '0');
  wantTokenBalances.set(recipient, amount);

  let vaultEntity = new CreateVaultTransition(
    new VaultStub(
      null, // total supply
      null, // total assets
      null, // total debt
      null, // price per share
      null, // performance fee
      null, // management fee
      null, // activation
      apiVersion, // apiVersion
      null, // rewardsAddress
      null, // guardianAddress
      null, // managementAddress
      null, // governanceAddress
      null, // depositLimit
      null, // availableDepositLimit
      new TokenStub( //shareToken
        VaultStub.DefaultAddress, // token address
        null, // token name
        null, // token decimals
        null, // token symbol
        shareTokenBalances, // token balances
        null, // token usdc value
        null // price oracle address
      ),
      new TokenStub( // wantToken
        TokenStub.DefaultTokenAddress, // token address
        null, // token name
        null, // token decimals
        null, // token symbol
        wantTokenBalances, // token balances
        null, // token usdc value
        null // price oracle address
      )
    ),
    null, //registryAddress
    null, //releaseId
    null //apiversion
  );

  let depositTransition = new DepositEventTransition(
    vaultEntity.stub,
    amount,
    amount,
    recipient
  );

  let withdrawCallTransition = new WithdrawCallTransition(
    depositTransition.postDepositStub,
    amount,
    amount,
    recipient
  );

  let transactionHashId = withdrawCallTransition.mockCall.transaction.txnHash
    .concat('-')
    .concat(defaults.bigInt.toString());
  let depositId = recipient
    .concat('-')
    .concat(transactionHashId)
    .concat('-')
    .concat(withdrawCallTransition.mockCall.transaction.txnIndex);
  assert.notInStore('Withdrawal', depositId);
});

test('Test handleDepositEvent', () => {
  clearStore();

  let amount = '79056085';
  let shareTokenBalances = new Map<string, string>();
  let sender = defaults.senderAddress;
  let vaultAddress = VaultStub.DefaultAddress;
  shareTokenBalances.set(sender, '0');
  shareTokenBalances.set(vaultAddress, '0');

  let wantTokenBalances = new Map<string, string>();
  wantTokenBalances.set(vaultAddress, '0');
  wantTokenBalances.set(sender, amount);

  let vaultEntity = CreateVaultTransition.DefaultVaultWithUnDepositedBalances(
    wantTokenBalances,
    shareTokenBalances
  );

  let depositTransition = new DepositEventTransition(
    vaultEntity.stub,
    amount,
    amount,
    sender
  );

  validateDepositStateTransition(
    sender,
    vaultAddress,
    depositTransition.postDepositStub.wantToken.address,
    depositTransition.mockEvent.transaction.txnHash,
    amount,
    amount,
    depositTransition.postDepositStub.pricePerShare,
    depositTransition.mockEvent.transaction.txnIndex,
    depositTransition.mockEvent.transaction.logIndex
  );

  // only here for broken test coverage checker
  handleDepositEvent(depositTransition.mockEvent.mock);
});

test('Test handleWithdrawEvent', () => {
  clearStore();
  let amount = '79056085';
  let shareTokenBalances = new Map<string, string>();
  let sender = defaults.senderAddress;
  let vaultAddress = VaultStub.DefaultAddress;
  shareTokenBalances.set(sender, '0');
  shareTokenBalances.set(vaultAddress, '0');

  let wantTokenBalances = new Map<string, string>();
  wantTokenBalances.set(vaultAddress, '0');
  wantTokenBalances.set(sender, amount);

  let vaultEntity = CreateVaultTransition.DefaultVaultWithUnDepositedBalances(
    wantTokenBalances,
    shareTokenBalances
  );

  let depositTransition = new DepositEventTransition(
    vaultEntity.stub,
    amount,
    amount,
    sender
  );

  let withdrawTransition = new WithdrawEventTransition(
    depositTransition.postDepositStub,
    amount,
    amount,
    sender
  );

  validateWithdrawalStateTransition(
    sender,
    vaultAddress,
    withdrawTransition.mockEvent.transaction.txnHash,
    amount,
    amount,
    withdrawTransition.postWithdrawStub.pricePerShare,
    withdrawTransition.mockEvent.transaction.txnIndex,
    withdrawTransition.mockEvent.transaction.logIndex
  );

  // only here for broken test coverage checker
  handleWithdrawEvent(withdrawTransition.mockEvent.mock);
});
