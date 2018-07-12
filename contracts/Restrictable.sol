pragma solidity 0.4.19;

import "./Ownable.sol";

contract Restrictable is Ownable {

  address public restrictedAddress;

  event RestrictedAddressChanged(address indexed restrictedAddress);

  modifier notRestricted(address tryTo) {
    require(tryTo != restrictedAddress);
    _;
  }

  //that function could be called only ONCE!!! After that nothing could be reverted!!!
  function setRestrictedAddress(address _restrictedAddress) onlyOwner public {
    restrictedAddress = _restrictedAddress;
    RestrictedAddressChanged(_restrictedAddress);
    transferOwnership(_restrictedAddress);
  }
}
