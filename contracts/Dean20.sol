// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IDean20} from "contracts/IDean20.sol";

contract Dean20 is IDean20 {

    string private s_tokenName;
    string private s_tokenSymbol;
    uint256 private s_totalSupply;
    address private s_owner;
    uint8 private s_tokenDecimal;
    uint256 private constant MAX_SUPPLY = 30000000000000000000000000;

    mapping(address account => uint256 balance) private balances;
    mapping(address account => mapping(address spender => uint256)) private allowances;
    event Transfer(address from, address to, uint256 value);

    constructor() {
        s_tokenName = "Dean20";
        s_tokenSymbol = "DTK";
        s_tokenDecimal = 18;
        s_owner = tx.origin;
        // mint(s_owner, 1000000000000000000000000);

        uint256 initialSupply = 1000000000000000000000000;
        require(initialSupply <= MAX_SUPPLY, "Maximum Token Supply Reached");
        s_totalSupply = s_totalSupply + initialSupply;
        balances[msg.sender] = balances[msg.sender] + initialSupply;
    }

    function onlyOwner() private view {
        require(msg.sender == s_owner);
    }

    function getTokenName() external view returns(string memory) {
        return s_tokenName;
    }
    function getTokenSymbol() external view returns(string memory) {
        return s_tokenSymbol;
    }
    function getTokenDecimal() external view returns(uint8) {
        return s_tokenDecimal;
    }

    function getTotalSupply() external view returns(uint256) {
        return s_totalSupply;
    }

    function name() external  view returns (string memory) {
        return s_tokenName;
    }

    function symbol() external view returns (string memory) {
        return s_tokenSymbol;
    }

    function decimals() external view returns (uint8) {
        return s_tokenDecimal;
    }

    function totalSupply() external view returns (uint256) {
        return s_totalSupply;
    }

    function balanceOf(address _user) external view returns (uint256 balance) {
        return balances[_user];
    }

    function transfer(address _to, uint256 _value) external returns (bool success) {
        require(_to != address(0), "You cannot sender fund to Zero address");
        require(msg.sender != address(0), "Zero address cannot call this function");
        require(balances[msg.sender] >= _value, "Insufficient balance");

        balances[msg.sender] = balances[msg.sender] - _value;
        balances[_to] = balances[_to] + _value;
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success) {

        /*
        i will check first if the _to is given approved to spend
        if the _to is approved to spend, then transfer _value to _to
        if _to is not approved to spend, check if msg.sender is approved to spend
        if yes, then transfer to _to
        */
        require(allowances[_from][_to] >= _value, "Insufficient Balance");
        allowances[_from][_to] = allowances[_from][_to] - _value;
        balances[_to] = _value;
        return true;
    }

    function approve(address _spender, uint256 _value) external returns (bool success) {
        //check that the owner has more than the value he's approving
        //other sanity checks
        allowances[msg.sender][_spender] = doDecimals(_value);
        return true;
    }

    function allowance(address _owner, address _spender) external view returns (uint256 remaining) {
        return allowances[_owner][_spender];
    }

    function mint(address _account, uint256 _amount) public   {
        //check that only user can call this function
        //after all the checks
       onlyOwner();
        uint256 tempSupply = s_totalSupply + doDecimals(_amount);
        require(tempSupply <= MAX_SUPPLY, "Maximum Token Supply Reached");

        s_totalSupply = s_totalSupply + doDecimals(_amount);
        balances[_account] = balances[_account] + doDecimals(_amount);
    }

    function burn(address _account, uint96 _amount) external {
        //after all the checks

           balances[_account] = balances[_account] - _amount;
           s_totalSupply = s_totalSupply - _amount;

           balances[address(0)] = balances[address(0)] + _amount;
    }

    function doDecimals(uint _amount) private pure returns (uint256) {
        return _amount * (10 ** 18);
    }
}