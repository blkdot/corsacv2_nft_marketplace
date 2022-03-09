// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ICorsacContract.sol";
import "./TradableERC721.sol";

contract CorsacERC721 is ICorsacERC721 {
    constructor() {}

    function createContract(
        string memory _name,
        string memory _symbol,
        string memory _uri,
        address factory
    ) external override returns (address) {
        TradableERC721 tCon721 = new TradableERC721(
            _name,
            _symbol,
            _uri,
            factory
        );

        tCon721.transferOwnership(factory);

        emit CreatedCorsacERC721(factory, address(tCon721));
        return address(tCon721);
    }
}
