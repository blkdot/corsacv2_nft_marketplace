// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC1155Tradable {

    /**
     * this function is called to mint ERC1155 token
     */
    function create(
        address _to,
        uint256 _quantity,
        string memory _uri,
        bytes memory _data
    ) external returns (uint256);
}