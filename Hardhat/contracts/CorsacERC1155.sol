// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ICorsacContract.sol";
import "./ERC1155Tradable.sol";

contract CorsacERC1155 is ICorsacERC1155 {
    constructor() {}

    function createContract(
        string memory _name,
        string memory _symbol,
        string memory _uri,
        address factory
    ) external override returns (address) {
        ERC1155Tradable tCon1155 = new ERC1155Tradable(
                _name,
                _symbol,
                _uri,
                factory
            );

        tCon1155.transferOwnership(factory);

        emit CreatedCorsacERC1155(factory, address(tCon1155));
        return address(tCon1155);
    }
}
