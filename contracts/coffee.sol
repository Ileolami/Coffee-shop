//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

contract Coffee {
    uint256 public constant coffeePrice = 0.002 ether;
    uint256 public totalCoffeesSold;
    uint256 public totalEtherReceived;

    event CoffeePurchased(address indexed buyer, uint256 quantity, uint256 totalCost);

    function buyCoffee(uint256 quantity) public payable {
        console.log("buyCoffee called with quantity:", quantity);

      require( quantity > 0, "Quantity must be greater than zero");
        uint256 totalCost = coffeePrice * quantity;
        console.log("Total cost calculated:", totalCost);
        require(msg.value >= totalCost, "Not enough ether sent");

        // Update total coffees sold and total ether received
        totalCoffeesSold += quantity;
        totalEtherReceived += totalCost;
        console.log("Total coffees sold updated:", totalCoffeesSold);
        console.log("Total ether received updated:", totalEtherReceived);

        // Emit an event for the purchase
        emit CoffeePurchased(msg.sender, quantity, totalCost);
        console.log("CoffeePurchased event emitted");

        // Refund any excess ether sent
        if (msg.value > totalCost) {
            uint256 refundAmount = msg.value - totalCost;
            console.log("Refunding excess ether:", refundAmount);
            payable(msg.sender).transfer(refundAmount);
        }
    }

    // Function to get the total number of coffees sold
    function getTotalCoffeesSold() public view returns (uint256) {
        console.log("getTotalCoffeesSold called");
        return totalCoffeesSold;
    }

    // Function to get the total amount of ether received
    function getTotalEtherReceived() public view returns (uint256) {
        console.log("getTotalEtherReceived called");
        return totalEtherReceived;
    }

    // Fallback function to handle ether sent directly to the contract
    receive() external payable {
        console.log("Ether sent directly to contract, reverting");
        revert("Please use the buyCoffee function to purchase coffee");
    }
}