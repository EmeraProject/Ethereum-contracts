pragma solidity 0.4.19;

import "./MintableToken.sol";
import "./BurnableToken.sol";
import "./Restrictable.sol";

contract GEMERAToken is MintableToken, BurnableToken, Restrictable {
  string public constant name = "GEMERA TOKEN";
  string public constant symbol = "GEMA";
  uint32 public constant decimals = 18;

  function GEMERAToken(address[50] _addrs) public BurnableToken(_addrs) {}

  function transfer(address _to, uint256 _value) public notRestricted(_to) returns (bool) {
    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) public notRestricted(_to) returns (bool) {
    return super.transferFrom(_from, _to, _value);
  }
}
