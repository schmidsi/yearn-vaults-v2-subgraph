import { Address, ethereum, BigInt } from '@graphprotocol/graph-ts';
import { createMockedFunction, log } from 'matchstick-as';
import { ZERO_ADDRESS } from '../../src/utils/constants';
import { defaults } from '../default';
import { TokenStub } from './tokenStateStub';
import { GenericStateStub } from './genericStateStub';
import { VaultStub } from './vaultStateStub';

export class StrategyStub extends GenericStateStub {
  static DefaultAddress: string = defaults.strategyAddress;

  static DefaultStrategyStub(vaultStub: VaultStub): StrategyStub {
    return new StrategyStub(
      null, // name
      vaultStub.shareToken.address, // vaultAddress
      StrategyStub.DefaultAddress, // address
      null, // apiVersion
      true, // isActive
      vaultStub.wantToken, // wantToken
      null, // health check
      false, // doHealthCheck
      false, // emergencyExit
      null, // strategist
      null, // keeper
      null // rewards
    );
  }

  private _name: string;
  public get name(): string {
    return this._name;
  }
  public set name(value: string) {
    this._updateStubField<string>('name', value);
    this._name = value;
  }

  private _apiVersion: string;
  public get apiVersion(): string {
    return this._apiVersion;
  }
  public set apiVersion(value: string) {
    this._updateStubField<string>('apiVersion', value);
    this._apiVersion = value;
  }

  private _isActive: boolean;
  public get isActive(): boolean {
    return this._isActive;
  }
  public set isActive(value: boolean) {
    this._updateStubField<boolean>('isActive', value.toString());
    this._isActive = value;
  }

  private _healthCheck: string;
  public get healthCheck(): string {
    return this._healthCheck;
  }
  public set healthCheck(value: string) {
    this._updateStubField<Address>('healthCheck', value);
    this._healthCheck = value;
  }
  private _doHealthCheck: boolean;
  public get doHealthCheck(): boolean {
    return this._doHealthCheck;
  }
  public set doHealthCheck(value: boolean) {
    this._updateStubField<boolean>('doHealthCheck', value.toString());
    this._doHealthCheck = value;
  }

  private _emergencyExit: boolean;
  public get emergencyExit(): boolean {
    return this._emergencyExit;
  }
  public set emergencyExit(value: boolean) {
    this._updateStubField<boolean>('emergencyExit', value.toString());
    this._emergencyExit = value;
  }

  private _strategist: string;
  public get strategist(): string {
    return this._strategist;
  }
  public set strategist(value: string) {
    this._updateStubField<Address>('strategist', value);
    this._strategist = value;
  }

  private _totalAssets: string;
  public get totalAssets(): string {
    return this._totalAssets;
  }
  public set totalAssets(value: string) {
    this._updateStubField<BigInt>('totalAssets', value);
    this._totalAssets = value;
  }

  private _vaultAddress: string;
  public get vaultAddress(): string {
    return this._vaultAddress;
  }
  public set vaultAddress(value: string) {
    this._updateStubField<Address>('vault', value);
    this._vaultAddress = value;
  }

  private _keeper: string;
  public get keeper(): string {
    return this._keeper;
  }
  public set keeper(value: string) {
    this._updateStubField<Address>('keeper', value);
    this._keeper = value;
  }

  private _rewards: string;
  public get rewards(): string {
    return this._rewards;
  }
  public set rewards(value: string) {
    this._updateStubField<Address>('rewards', value);
    this._rewards = value;
  }

  //keeper: string;
  //delegatedAssets: string;
  //estimatedTotalAssets: string;

  wantToken: TokenStub;

  clone(): StrategyStub {
    return new StrategyStub(
      this.name,
      this.address,
      this.vaultAddress,
      this.apiVersion,
      this.isActive,
      this.wantToken,
      this.healthCheck,
      this.doHealthCheck,
      this.emergencyExit,
      this.strategist,
      this.keeper,
      this.rewards
    );
  }

  constructor(
    name: string | null,
    address: string | null,
    vaultAddress: string,
    apiVersion: string | null,
    isActive: boolean,
    wantToken: TokenStub | null,
    healthCheck: string | null,
    doHealthCheck: boolean,
    emergencyExit: boolean,
    strategist: string | null,
    keeper: string | null,
    rewards: string | null
  ) {
    let _addressToUse = StrategyStub.DefaultAddress;
    if (address) {
      _addressToUse = address;
    }
    super(_addressToUse);
    this._vaultAddress = vaultAddress;
    if (wantToken) {
      this.wantToken = wantToken;
    } else {
      this.wantToken = TokenStub.DefaultToken(TokenStub.DefaultTokenAddress);
    }
    if (name) {
      this._name = name;
    } else {
      this._name = 'Default Strategy';
    }
    if (apiVersion) {
      this._apiVersion = apiVersion;
    } else {
      this._apiVersion = '0.0.0';
    }
    if (healthCheck) {
      this._healthCheck = healthCheck;
    } else {
      this._healthCheck = ZERO_ADDRESS;
    }
    this._doHealthCheck = doHealthCheck;
    this._isActive = isActive;

    if (strategist) {
      this._strategist = strategist;
    } else {
      this._strategist = defaults.strategistAddress;
    }

    if (keeper) {
      this._keeper = keeper;
    } else {
      this._keeper = defaults.keeperAddress;
    }

    if (rewards) {
      this._rewards = rewards;
    } else {
      this._rewards = defaults.rewardsAddress;
    }

    // figure out totalAssets by querying the wantToken balance
    if (this.wantToken.hasAccountBalance(this.address)) {
      this._totalAssets = this.wantToken.getAccountBalance(this.address);
    } else {
      this._totalAssets = '0';
    }

    // update stubs by triggering each field's setter
    this.name = this._name;
    this.vaultAddress = this._vaultAddress;
    this.isActive = this._isActive;
    this.apiVersion = this._apiVersion;
    this.healthCheck = this._healthCheck;
    this.doHealthCheck = this._doHealthCheck;
    this.strategist = this._strategist;
    this.emergencyExit = this._emergencyExit;
    this.totalAssets = this._totalAssets;
    this.keeper = this._keeper;
    this.rewards = this._rewards;

    // these don't have setters so we directly update them
    this._updateStubField<Address>('token', this.wantToken.address);
    this._updateStubField<Address>('want', this.wantToken.address);
  }
}
