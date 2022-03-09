// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UBAToken is ERC20 {
    uint8 internal _decimals = 9;
    uint256 public INITIAL_SUPPLY = 1_000_000_000_000_000 * (10 ** _decimals);

    constructor() public ERC20("Unbreakablery", "UBA") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}