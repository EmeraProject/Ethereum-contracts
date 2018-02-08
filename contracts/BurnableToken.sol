pragma solidity 0.4.19;

import "./StandardToken.sol";
import "./AddressesBurn.sol";

contract BurnableToken is StandardToken, AddressesBurn {

  mapping(address => bool) allowedAddressesForBurn;

  uint256 public burned;

  event Burn(address indexed burner, uint256 value);
  event BurnAll(address indexed burner, uint256 value);

  function BurnableToken() public {
    allowedAddressesForBurn[burn1] = true;
    allowedAddressesForBurn[burn2] = true;
    allowedAddressesForBurn[burn3] = true;
    allowedAddressesForBurn[burn4] = true;
    allowedAddressesForBurn[burn5] = true;
    allowedAddressesForBurn[burn6] = true;
    allowedAddressesForBurn[burn7] = true;
    allowedAddressesForBurn[burn8] = true;
    allowedAddressesForBurn[burn9] = true;
    allowedAddressesForBurn[burn10] = true;
    allowedAddressesForBurn[burn11] = true;
    allowedAddressesForBurn[burn12] = true;
    allowedAddressesForBurn[burn13] = true;
    allowedAddressesForBurn[burn14] = true;
    allowedAddressesForBurn[burn15] = true;
    allowedAddressesForBurn[burn16] = true;
    allowedAddressesForBurn[burn17] = true;
    allowedAddressesForBurn[burn18] = true;
    allowedAddressesForBurn[burn19] = true;
    allowedAddressesForBurn[burn20] = true;
    allowedAddressesForBurn[burn21] = true;
    allowedAddressesForBurn[burn22] = true;
    allowedAddressesForBurn[burn23] = true;
    allowedAddressesForBurn[burn24] = true;
    allowedAddressesForBurn[burn25] = true;
    allowedAddressesForBurn[burn26] = true;
    allowedAddressesForBurn[burn27] = true;
    allowedAddressesForBurn[burn28] = true;
    allowedAddressesForBurn[burn29] = true;
    allowedAddressesForBurn[burn30] = true;
    allowedAddressesForBurn[burn31] = true;
    allowedAddressesForBurn[burn32] = true;
    allowedAddressesForBurn[burn33] = true;
    allowedAddressesForBurn[burn34] = true;
    allowedAddressesForBurn[burn35] = true;
    allowedAddressesForBurn[burn36] = true;
    allowedAddressesForBurn[burn37] = true;
    allowedAddressesForBurn[burn38] = true;
    allowedAddressesForBurn[burn39] = true;
    allowedAddressesForBurn[burn40] = true;
    allowedAddressesForBurn[burn41] = true;
    allowedAddressesForBurn[burn42] = true;
    allowedAddressesForBurn[burn43] = true;
    allowedAddressesForBurn[burn44] = true;
    allowedAddressesForBurn[burn45] = true;
    allowedAddressesForBurn[burn46] = true;
    allowedAddressesForBurn[burn47] = true;
    allowedAddressesForBurn[burn48] = true;
    allowedAddressesForBurn[burn49] = true;
    allowedAddressesForBurn[burn50] = true;
  }

  function isAllowed(address _address) public constant returns (bool) {
    return allowedAddressesForBurn[_address];
  }

  /*/**
  * @dev Burns a specific amount of tokens.
  * @param _value The amount of token to be burned.
  */
  function burn(uint256 _value) public {
    require(isAllowed(msg.sender));
    require(_value > 0);
    require(_value <= balances[msg.sender]);

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
    require(isAllowed(msg.sender));
    address burner = msg.sender;
    uint256 value = balances[burner];
    balances[burner] = 0;
    totalSupply_ = totalSupply_.sub(value);
    burned = burned.add(value);
    BurnAll(burner, value);
    Transfer(burner, 0x0, value);
  }
}
