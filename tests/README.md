# Yearn Vaults Subgraph Tests

Testing the subgraph is a complicated endeavour given the amount of statefulness in subgraphs and lack of testing tools in the space.

The goal is to test the various mapping handlers to make sure the state mutations they emit are valid and accurate.

## Problem Background

You need 4 sets of information in order to conduct a single test:

1. The state of the blockchain at height N
2. The state of the subgraph at height N-1 (before the test takes place)
3. An Event or Call from block N that will cause a mutation in the subgraph's state
4. The state of the subgraph at height N (your test will assert that its ending state matches this)

Given the large number of contracts/data fields that may need to be accessed during a mapping handler, manually mocking all of the data fields/subgraph entities for each test is not viable.

Previously, we would use a tool to build "fixtures" that represent the chain state of all relevant contracts at a given block height. Before running a test, fixtures would be activated, mapping handlers would be run, and the generated subgraph entities would be validated by the test.

This approach worked fine for simple tests, but more advanced tests require many fixtures & intermediate mapping handlers; requiring 500-1000 lines of code for some tests. Chain state fixtures were also difficult to create - they require the test writer to find precise transactions on-chain that represent the transitions they want to test, and figuring out what fields the fixture needs to resolve is a painful trial-and-error process.

## How these tests work

There are 3 types of classes that are used to prepare & execute tests.

### Transition Classes

Transition classes are used to encapsulate complex state transitions that are must occur before a test is run.

Assume you want to write a test that validates the Deposit entity. Before starting this test, the subgraph would need to be prepared by using the following steps:

1. Chain state mocks for Vault share/want tokens would have to be set up, along with oracle responses for every potential oracle request.
2. A chain state mock for the Vault itself would have to be set up
3. The Vault subgraph entity would need to be initialized by calling the Registry.handleNewRelease mapping handler. Any RPC calls this handler makes would need to be determined ahead of time and mocked.
4. The chain state mock for the Vault's want token would need to be updated to reflect a user having a 100 DAI balance.
5. A param class for the Deposit call handler would need to be prepared.
6. The Deposit call handler is called using the newly created param class.
7. The final state of the Vault, VaultUpdate, Deposit, Account, and AccountPosition, Transaction entites needs to be determined.
8. Finally, the state of the subgraph after the handleDeposit can be compared to the calculated state from step 7.

Needless to say, writing all that code to test a simple Deposit transaction is not viable, especially for more complex tests.

The goal of a Transition class is to abstract the above steps away into clean, reusable classes. Each transition class usually performs the following steps:

1. Figure out how a transaction will change any State Stubs, clone them, and update them.
2. Create a Param Class that will be consumed by the mapping handler.
3. Call the mapping handler.

For a simple example, check out the `createVaultTransition` class

### Param Builders

When an event happens on-chain that a subgraph wants to index, the node running the graph extracts information about the event, packs it into a class, then calls a mapping handler, passing it the newly created class.

Tests often have to create these param classes in order to call mapping handlers. Param classes require a lot of boilerplate code to create, so this is abstracted away in the classes under `./mappingParamBuilders`

For the most part, param builder classes should created/managed by Transition classes. The only reason a test should need to directly create/interact with a param builder class is because there is no Transition class to abstract it away, or because for whatever reason, a Transition class cannot be created.

### State Stubs

Mapping handlers need more than just event data to do their job; they also need to make various RPC queries. For testing, we can mock RPC queries and their responses using State Stubs. Each State Stub class corresponds with a type of smart contract(Vault, Strategy, Token, etc).

When a State Stub is created, it will mock all of the functions/views the contract implements. If a certain contract has dependencies on other contracts, its State Stub will create additional State Stubs for dependencies if they aren't provided in the constructor.

For example, the Vault state stub has two contracts it is dependent on, the ERC20 for its Want token, and the ERC20 for its share token. When creating a Vault State stub using `DefaultVaultStub()`, it will automatically initialize state stubs for each token it is dependent on.

#### Modifying State Stub Values

Once a State Stub is instantiated, the return values of its functions can be changed using one of the following methods:

1. [Recommended] Calling stub.clone(), then using the setter for the relevant field.
2. Using the setter for the relevant field.

Stubs are classes, and classes are passed by reference. Changing a stub's fields without calling clone first will impact every class that has a reference to a stub, which is usually quite a few.

Stubs should only be cloned+modified by Transition classes.
