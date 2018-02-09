pragma solidity 0.4.19;

import "./StandardToken.sol";

contract BurnableToken is StandardToken {

  mapping(address => bool) private allowedAddressesForBurn;
  address[50] public burnAddresses;
  uint256 public burned;

  event Burn(address indexed burner, uint256 value);

  function BurnableToken(address[50] _addresses) public {
    burnAddresses = _addresses;
    for (uint i; i < _addresses.length; i++) {
      if (_addresses[i] != address(0)) {
        allowedAddressesForBurn[_addresses[i]] = true;
      }
    }
  }

  function isAllowed(address _address) public view returns (bool) {
    return allowedAddressesForBurn[_address];
  }

  /*/**
  * @dev Burns a specific amount of tokens.
  * @param _value The amount of token to be burned.
  */
  function burn(uint256 _value) public {
    require(isAllowed(msg.sender));
    require(_value > 0);

    // no need to require value <= totalSupply, since that would imply the
    // sender's balance is greater than the totalSupply, which *should* be an assertion failure
    address burner = msg.sender;
    balances[burner] = balances[burner].sub(_value);
    totalSupply_ = totalSupply_.sub(_value);
    burned = burned.add(_value);
    Burn(burner, _value);
    Transfer(burner, 0x0, _value);
  }

  function burnAll() public {
    burn(balances[msg.sender]);
  }

  function getBurnAddresses() public view returns(address[50]) {
    return burnAddresses;
  }
}
