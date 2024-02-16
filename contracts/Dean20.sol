// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IDean20.sol";

contract Dean20 is IDean20 {

    string private s_tokenName;
    string private s_tokenSymbol;
    uint256 private s_totalSupply;
    address private s_owner;
    uint8 private s_tokenDecimal;
    uint256 private immutable MAX_SUPPLY;

    mapping(address account => uint256 balance) private balances;
    mapping(address account => mapping(address spender => uint256)) private allowances;

    event Transfer(address from, address to, uint256 value);

    constructor() {
        s_tokenName = "Dean20";
        s_tokenSymbol = "DTK";
        s_tokenDecimal = 18;
        s_owner = tx.origin;
        MAX_SUPPLY = 30000000000000000000000000;

        uint256 initialSupply = 1000000000000000000000000;
        require(initialSupply <= MAX_SUPPLY, "Maximum Token Supply Reached");
        s_totalSupply = s_totalSupply + initialSupply;
        balances[msg.sender] = balances[msg.sender] + initialSupply;
    }

    function onlyOwner() private view { //done
        require(msg.sender == s_owner);
    }

    function getTokenDecimal() external view returns (uint8) {   //done
        return s_tokenDecimal;
    }

    function name() external view returns (string memory) {    //done
        return s_tokenName;
    }

    function symbol() external view returns (string memory) {   //done
        return s_tokenSymbol;
    }

    function decimals() external view returns (uint8) {     //done
        return s_tokenDecimal;
    }

    function totalSupply() external view returns (uint256) {        //done
        return revDecimals(s_totalSupply);
    }

    function balanceOf(address _user) external view returns (uint256 balance) {     //done
        return revDecimals(balances[_user]);
    }

    function transfer(address _to, uint256 _value) external returns (bool success) {
        require(_to != address(0), "You cannot sender fund to Zero address");
        require(msg.sender != address(0), "Zero address cannot call this function");

        uint256 deduction = doDecimals(_value) + (doDecimals(_value) * (100 / 10));

        //burn 10% of the amount sent as charges
        balances[msg.sender] = balances[msg.sender] - deduction;
        s_totalSupply = s_totalSupply - (doDecimals(_value) * (100 / 10));

        balances[_to] = balances[_to] + doDecimals(_value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success) {
        require(_to != address(0), "You cannot sender fund to Zero address");
        require(msg.sender != address(0), "Zero address cannot call this function");
        require(allowances[_from][_to] >= doDecimals(_value), "Insufficient Allowance Balance");


        uint256 deduction = doDecimals(_value) + (doDecimals(_value) * (100 / 10));

        balances[_from] = balances[_from] - deduction;
        allowances[_from][_to] = allowances[_from][_to] - doDecimals(_value);

        s_totalSupply = s_totalSupply - (doDecimals(_value) * (100 / 10));

        balances[_to] = balances[_to] + doDecimals(_value);
        return true;
    }

    function approve(address _spender, uint256 _value) external returns (bool success) {
        require(msg.sender != address(0), "Zero address cannot call this method");
        require(_spender != address(0), "Zero address cannot be spender");
        require(balances[msg.sender] >= doDecimals(_value));
        allowances[msg.sender][_spender] = doDecimals(_value);
        return true;
    }

    function allowance(address _owner, address _spender) external view returns (uint256 remaining) {
        return revDecimals(allowances[_owner][_spender]);
    }

    function mint(address _account, uint256 _amount) public {
        onlyOwner();
        uint256 tempSupply = s_totalSupply + doDecimals(_amount);
        require(tempSupply <= MAX_SUPPLY, "Maximum Token Supply Reached");

        s_totalSupply = s_totalSupply + doDecimals(_amount);
        balances[_account] = balances[_account] + doDecimals(_amount);
    }

    function burn(address _account, uint96 _amount) external {

        require(msg.sender != address(0), "Zero address cannot call this method");
        balances[_account] = balances[_account] - doDecimals(_amount);
        s_totalSupply = s_totalSupply - doDecimals(_amount);

        balances[address(0)] = balances[address(0)] + doDecimals(_amount);
    }

    function doDecimals(uint _amount) private pure returns (uint256) {
        return _amount * (10 ** 18);
    }

    function revDecimals(uint _amount) private pure returns (uint256) {
        return _amount / (10 ** 18);
    }
}