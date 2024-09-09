// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

contract Coffee {
    uint256 public constant coffeePrice  = 0.0002 ether;
    uint256 public totalCoffeesSold;
    uint256 public totalEtherReceived;

    // Custom error definitions
    error QuantityMustBeGreaterThanZero();
    error InsufficientEtherSent(uint256 required, uint256 sent);
    error DirectEtherTransferNotAllowed();

    // Event to log coffee purchases
    event CoffeePurchased(address indexed buyer, uint256 quantity, uint256 totalCost);

    // Function to buy coffee
    function buyCoffee(uint256 quantity) external payable {
        if (quantity <= 0) {
            revert QuantityMustBeGreaterThanZero();
        }

        uint256 totalCost = coffeePrice * quantity;
        
        if (msg.value > totalCost) {
            revert InsufficientEtherSent(totalCost, msg.value);
        }

        // Update the total coffees sold and total ether received
        totalCoffeesSold += quantity;
        totalEtherReceived += totalCost;
        console.log("Total ether received updated:", totalEtherReceived);
        console.log("Total coffee sold updated:", totalCoffeesSold);
        // Emit the purchase event
        emit CoffeePurchased(msg.sender, quantity, totalCost);

        // Refund excess Ether sent
        if (msg.value > totalCost) {
            uint256 refundAmount = msg.value - totalCost;
            payable(msg.sender).transfer(refundAmount);
        }
    }

    // Fallback function to handle Ether sent directly to the contract
    receive() external payable {
        revert DirectEtherTransferNotAllowed();
    }

    // Public view functions to get totals
    function getTotalCoffeesSold() external view returns (uint256) {
        console.log("getTotalCoffeesSold :", totalCoffeesSold);
        return totalCoffeesSold;
    }

    function getTotalEtherReceived() external view returns (uint256) {
         console.log("getTotalEtherReceived :", totalEtherReceived);
                return totalEtherReceived;
    }
}
