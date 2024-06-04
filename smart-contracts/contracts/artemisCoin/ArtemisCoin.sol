// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import {ERC20Burnable, ERC20} from "./lib/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "./lib/access/Ownable.sol";

contract ArtemisCoin is ERC20Burnable, Ownable {
    /**** Contracts ****/

    // Construct
    constructor() ERC20("ArtemisCoin", "ARTC") Ownable(msg.sender) {
        // Mint the 50B tokens
        _mint(msg.sender, 50_000_000_000 * 10 ** 18);
    }

    function mint(address account, uint256 value) external onlyOwner {
        _mint(account, value);
    }
}
