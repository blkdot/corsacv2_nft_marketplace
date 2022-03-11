// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC721Tradable {

    /**
     * this function is called to mint ERC721 token
     */
    function mintTo(address _to, string memory uri) external;
    function getTokenId() external view returns(uint256);
}