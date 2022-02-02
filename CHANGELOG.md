# Change Log

All notable changes to the subgraph will be documented in this file.

## [Unreleased] - yyyy-mm-dd

### Added

- Vault Deposit event support for vaults v0.4.4+
- Vault Withdraw event support for vaults v0.4.4+
- Added logic for Vault-centric health checks
  - Added a HealthCheck entity for Vault-centric health checks
  - Added VaultUpdate.healthCheck field
- Added event handlers for Strategy.doHealthCheck and Strategy.healthCheck

### Changed

- AddStrategyV1/AddStrategyV2 call handlers have been replaced with Event handlers.

### Fixed
