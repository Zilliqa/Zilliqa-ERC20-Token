# Zilliqa Token Generation 
Preminted tokens are allocated to early \& community contributors, company, team and agencies. Detailed can be found in our blog post at https://blog.zilliqa.com/more-details-on-zilliqas-token-generation-event-4e1b78e0cf5a.  

Our token generation smart contracts have already been audited by [ChainSecurity](http://chainsecurity.com/) and 
[Zero Knowledge Labs](http://zklabs.io/). The audit reports can be found in the folder named `audit-report`.

## Deployment Flow

- Deploy `ZilliqaToken.sol`. The listing can be done by a standard private key or a multi-sig key, which is the owner of the contract. The Zilliqa token, inheriting from custom PausableToken, gets deployed by this contract. An admin account address and the total amount of tokens are passed and used to initialize the Zilliqa token. Token transfers are initially only allowed for the owner of the contract and admin account.

- The pre-minted tokens are initially assigned to the owner's account. They may be then sent to the admin address (BTC Suisse). The admin account may also transfer tokens initially. No other public account can send/receive during this period.
 
- The admin address should distribute the tokens to individual contributor accounts during this period.

- At some time T1, token.pause(false, false) may be called which will enable transfers of the zilliqa token for everyone.

- At some time in the future, token.pause(true, true) may be called by the owner. This would stop all transfers for everyone (public, admin and owner). Only token burning would be allowed at this stage.


## Deployment Config

In `/migrations/2_deploy_contracts.js`, we may specify the admin account address and total number of tokens. Eg -

```
var admin = "0x123";
var totalTokenAmount = 200;
```

## Deployment Steps

### Deploy using truffle: 

To test on the Ropsten network, execute `truffle migrate --network ropsten` which uses the existing API keys in `/truffle.js`.

To deploy on mainnet, execute `truffle migrate`.


## Per module description
The system has 1 main module - the token module.

### Token
Implemented in `ZilliqaToken.sol`. The token is fully compatible with ERC20 standard, with some additions:

1. It has a burning functionality that allows user to burn their tokens.
To optimize gas cost, an auxiliary `burnFrom` function was also implemented.
This function allows sender to burn tokens that were approved by a spender.

2. Only the owner and admin accounts are allowed to transfer tokens before the transfer period starts. No token transfer would be allowed after calling pause(true, true) in the future.

### Pause States

There are 2 flags, pausedPublic and pausedOwnerAdmin.
1. In the initial stage, pausedPublic is true and pausedOwnerAdmin is false. This means only the owner and admin can transfer tokens.
2. In the second stage, pausedPublic and pausedOwnerAdmin both are false. Everybody can transfer tokens in this stage.
3. In the final stage (lock up), pausedPublic and pausedOwnerAdmin both are true. Nobody can now transfer tokens.
4. Tokens can be burnt at any time by anyone.

2. Only the owner and admin accounts are allowed to transfer tokens before the transfer period starts. No token transfer would be allowed after calling pause(true, true) in the future.


## Use of zeppelin code
We use open-zepplin code for `SafeMath`, `Ownable`, `StandardToken` and `Pausable` logic.

