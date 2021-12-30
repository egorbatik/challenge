# Summary of the solution

- [X] Setup a project and create a contract
  - [X] Only the team can deposit rewards.
  - [X] Deposited rewards go to the pool of users, not to individual users.
  - [X] Users should be able to withdraw their deposits along with their share of rewards considering the time when they deposited.
- [X] Write tests
  - The tests verify depositing rewards/stakes by the team/clients, distribution proportions of the rewards, diferent cases and combinations.
  - [X] Deploy your contract
    - Network ```ropsten```
    - Contract Address ```0xb07BEAF62Be1C61466A3BEBeCE9e8bc63270B54d```
    - Transaction Contract Creation ```0xa4747221c6a7759595610e5a9e17040947c415b37d9f937a5847dd9d3ec87c51```
- [X] Verify your contract
    - https://ropsten.etherscan.io/address/0xb07BEAF62Be1C61466A3BEBeCE9e8bc63270B54d#code
- [X] Interact (hardhat task to get the balance)
    - ```npx hardhat balance --network ropsten```
    
-----------------
# Smart Contract Challenge

## A) Challenge

### 1) Setup a project and create a contract

#### Summary

ETHPool provides a service where people can deposit ETH and they will receive weekly rewards. Users must be able to take out their deposits along with their portion of rewards at any time. New rewards are deposited manually into the pool by the ETHPool team each week using a contract function.

#### Requirements

- Only the team can deposit rewards.
- Deposited rewards go to the pool of users, not to individual users.
- Users should be able to withdraw their deposits along with their share of rewards considering the time when they deposited.

Example:

> Let say we have user **A** and **B** and team **T**.
>
> **A** deposits 100, and **B** deposits 300 for a total of 400 in the pool. Now **A** has 25% of the pool and **B** has 75%. When **T** deposits 200 rewards, **A** should be able to withdraw 150 and **B** 450.
>
> What if the following happens? **A** deposits then **T** deposits then **B** deposits then **A** withdraws and finally **B** withdraws.
> **A** should get their deposit + all the rewards.
> **B** should only get their deposit because rewards were sent to the pool before they participated.

#### Goal

Design and code a contract for ETHPool, take all the assumptions you need to move forward.

You can use any development tools you prefer: Hardhat, Truffle, Brownie, Solidity, Vyper.

Useful resources:

- Solidity Docs: https://docs.soliditylang.org/en/v0.8.4
- Educational Resource: https://github.com/austintgriffith/scaffold-eth
- Project Starter: https://github.com/abarmat/solidity-starter

### 2) Write tests

Make sure that all your code is tested properly

### 3) Deploy your contract

Deploy the contract to any Ethereum testnet of your preference. Keep record of the deployed address.

Bonus:

- Verify the contract in Etherscan

### 4) Interact with the contract

Create a script (or a Hardhat task) to query the total amount of ETH held in the contract.

_You can use any library you prefer: Ethers.js, Web3.js, Web3.py, eth-brownie_
