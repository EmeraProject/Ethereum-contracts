pragma solidity ^0.4.15;

import "./AddressesBurn.sol";
import "./AddressesWithdraw.sol";

/**
 * @title ERC20Basic interface
 * @dev Basic version of ERC20 interface
 */
contract ERC20Basic {
  uint256 public totalSupply;
  function balanceOf(address who) constant returns (uint256);
  function transfer(address to, uint256 value) returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}

/**
 * @title ERC20 interface
 * @dev Standard version of ERC20 interface
 */
contract ERC20 is ERC20Basic {
  function allowance(address owner, address spender) constant returns (uint256);
  function transferFrom(address from, address to, uint256 value) returns (bool);
  function approve(address spender, uint256 value) returns (bool);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  function mul(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal constant returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal constant returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }

  function mod(uint256 a, uint256 b) internal constant returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a % b;
    //uint256 z = a / b;
    assert(a == (a / b) * b + c); // There is no case in which this doesn't hold
    return c;
  }

}

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions.
 */
contract Ownable {

  address public owner;

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function Ownable() {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) onlyOwner public {
    require(newOwner != address(0));
    OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}

contract Restrictable is Ownable {
    
    address public restrictedAddress;
    
    event RestrictedAddressChanged(address indexed restrictedAddress);
    
    function Restrictable() {
        restrictedAddress = address(0);
    }
    
    //that function could be called only ONCE!!! After that nothing could be reverted!!! 
    function setRestrictedAddress(address _restrictedAddress) onlyOwner public {
      restrictedAddress = _restrictedAddress;
      RestrictedAddressChanged(_restrictedAddress);
      transferOwnership(_restrictedAddress);
    }
    
    modifier notRestricted(address tryTo) {
        if(tryTo == restrictedAddress) {
            revert();
        }
        _;
    }
}

/**
 * @title ERC20Basic Token
 * @dev Implementation of the basic token.
 */

contract BasicToken is ERC20Basic, Restrictable {

  using SafeMath for uint256;

  mapping(address => uint256) balances;

  /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) notRestricted(_to) public returns (bool) {
    require(_to != address(0));
    require(_value <= balances[msg.sender]);
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) public constant returns (uint256 balance) {
    return balances[_owner];
  }

}

/**
 * @title Standard ERC20 Token
 * @dev Implementation of the standard token.
 * @dev Based on code by FirstBlood: https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
contract StandardToken is ERC20, BasicToken {

  mapping (address => mapping (address => uint256)) internal allowed;

  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amout of tokens to be transfered
   */
  function transferFrom(address _from, address _to, uint256 _value) notRestricted(_to) public returns (bool) {
    require(_to != address(0));
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);

    // Check is not needed because sub(_allowance, _value) will already throw if this condition is not met
    // require (_value <= _allowance);

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    Transfer(_from, _to, _value);
    return true;
  }
  
  function approve(address _spender, uint256 _value) public returns (bool) {

    // To change the approve amount you first have to reduce the addresses`
    //  allowance to zero by calling `approve(_spender, 0)` if it is not
    //  already 0 to mitigate the race condition described here:
    //  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    require((_value == 0) || (allowed[msg.sender][_spender] == 0));

    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifing the amount of tokens still available for the spender.
   */
  function allowance(address _owner, address _spender) public constant returns (uint256 remaining) {
    return allowed[_owner][_spender];
  }

 /**
   * approve should be called when allowed[_spender] == 0. To increment
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   */
  function increaseApproval (address _spender, uint _addedValue) public returns (bool success) {
    allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(_addedValue);
    Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

  function decreaseApproval (address _spender, uint _subtractedValue) public returns (bool success) {
    uint oldValue = allowed[msg.sender][_spender];
    if (_subtractedValue > oldValue) {
      allowed[msg.sender][_spender] = 0;
    } else {
      allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
    }
    Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

}


/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is Ownable {
  event Pause();
  event Unpause();
  bool public paused = false;
  /**
   * @dev modifier to allow actions only when the contract IS paused
   */
  modifier whenNotPaused() {
    require(!paused);
    _;
  }
  /**
   * @dev modifier to allow actions only when the contract IS NOT paused
   */
  modifier whenPaused() {
    require(paused);
    _;
  }
  /**
   * @dev called by the owner to pause, triggers stopped state
   */
  function pause() onlyOwner whenNotPaused public {
    paused = true;
    Pause();
  }
  /**
   * @dev called by the owner to unpause, returns to normal state
   */
  function unpause() onlyOwner whenPaused public {
    paused = false;
    Unpause();
  }

}

/**
 * @title Mintable token
 * @dev ERC20 Token, with mintable token creation
 * Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
 */
contract MintableToken is StandardToken {

  event Mint(address indexed to, uint256 amount);

  /**
   * @dev Function to mint tokens
   * @param _to The address that will recieve the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount) onlyOwner public returns (bool) {
    totalSupply = totalSupply.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    Mint(_to, _amount);
    Transfer(0x0, _to, _amount);
    return true;
  }

}

contract BurnableToken is StandardToken, AddressesBurn {
    
    mapping(address => bool) allowedAddressesForBurn;
    
    uint256 public burned;

    event Burn(address indexed burner, uint256 value);
    event BurnAll(address indexed burner, uint256 value);

    function BurnableToken() {
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
        burned = 0;
    }

    function isAllowed(address _address) public constant returns (bool) {
        if(allowedAddressesForBurn[_address]) {
            return true;
        }
        return false;
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
        totalSupply = totalSupply.sub(_value);
        burned = burned.add(_value);
        Burn(burner, _value);
		Transfer(burner, 0x0, _value);
    }

    function burnAll() public {
        require(isAllowed(msg.sender));
        address burner = msg.sender;
        uint256 value = balances[burner];
        balances[burner] = 0;
        totalSupply = totalSupply.sub(value);
        burned = burned.add(value);
        BurnAll(burner, value);
		Transfer(burner, 0x0, value);
    }
    
    function getTotalSupply() public returns(uint256) {
        return totalSupply;
    }
}

contract GEMERAToken is MintableToken, BurnableToken {

  string public constant name = "GEMERA TOKEN";

  string public constant symbol = "GEMA";

  uint32 public constant decimals = 8;

}

contract GEMERATokenSale is Ownable, Pausable, AddressesWithdraw {

    using SafeMath for uint256;

    address[5] wallets; //wallets for withdraw funds collecting from smart contract - 50%-20%-11%-10%-9%

    GEMERAToken public token = GEMERAToken(0xd97c302e9b5ee38ab900d3a07164c2ad43ffc044);

    uint256 public start;

    uint256 public period;

    uint256 public rate;

    uint256 public bonusPercentage;

    uint256 public lastTimeRateChange;

    uint256 public hardCapRound;

    uint256 public remainTokens;

    uint256 public weiRaised;

    uint256 private currentRate;
    
    struct statElem {
        address beneficiary;
        uint256 tokenSale;
        uint256 tokenBonus;
        uint256 purshaseAmount;
    }

    mapping(uint256 => statElem) statistics;

    uint256 public currentStatCount;

    uint256 public maxStatCount;

    event TokenPurchase(address indexed sender, address indexed beneficiary, uint256 purchase, uint256 tokens);
    event WalletWeis1(uint256 a0, uint256 a, uint256 b, uint256 c, uint256 d, uint256 e);

	//Change for Prod
    modifier salesActive() {
        bool withinPeriod = now >= start && now <= start + period * 10 * 1 minutes;
        require(withinPeriod && !paused);
        _;
    }

    function GEMERATokenSale() {
        hardCapRound = 0;
        remainTokens = 0;
        weiRaised = 0;
        wallets[0] = withdraw1;
        wallets[1] = withdraw2;
        wallets[2] = withdraw3;
        wallets[3] = withdraw4;
        wallets[4] = withdraw5;
        currentStatCount = 0;
        maxStatCount = 0;
        start = 0;
        period = 0;
		rate = 0;
		bonusPercentage = 0;
		lastTimeRateChange = 0;
		currentRate = 0;
    }
    
    function cancelRoundSale() public onlyOwner {
       
        currentStatCount = 0;
        maxStatCount = 0;
        start = 0;
        period = 0;
		rate = 0;
		bonusPercentage = 0;
		lastTimeRateChange = 0;
		currentRate = 0;
		hardCapRound = 0;
    }

	// Change for Prod
    function setupNewRoundParams(uint256 _start, uint256 _period, uint256 _rate, uint256 _bonusPercentage, uint256 _hardCap) onlyOwner public returns (bool) {
        require(remainTokens == 0 || start + period * 1 minutes < now || start > now);
        require(_start >= now && _period > 0);
        require(_rate >= 100000000);
        require(_bonusPercentage <= 100 && _bonusPercentage >= 0);
		require(_hardCap >= 0);
        require(!paused);
        start = _start;
        period = _period;
        rate = _rate;
        bonusPercentage = _bonusPercentage;
        lastTimeRateChange = now;
        hardCapRound = _hardCap.mul(100000000).add(remainTokens);
        remainTokens = hardCapRound;
        currentRate = calcCurrentRate();
        currentStatCount = 0;
    }

    function calcCurrentRate() internal constant returns (uint256) {
        uint256 fractionalRate;
        fractionalRate = rate.div(100000000);
        return fractionalRate;
    }

	// change for Prod
    function tryToChangeRate(uint256 _rate) onlyOwner public returns (bool) {
        require(now > lastTimeRateChange + 2 minutes);
        require(_rate >= 100000000);
        rate = _rate;
        currentRate = calcCurrentRate();
        lastTimeRateChange = now;
        return true;
    }

    function () payable {
        buyTokens(msg.sender);
    }

    function buyTokens(address beneficiary) payable salesActive {
        require(beneficiary != 0x0);
		require((remainTokens > 0 ) && msg.value >= 10000000000000000);

        uint256 refund;
        uint256 purchase;

        uint256 weiAmount = msg.value;
        uint256 tokensForSale = weiAmount.div(currentRate);
        uint256 bonusTokens = tokensForSale.mul(bonusPercentage).div(100);
        uint256 tokens = tokensForSale.add(bonusTokens);
        
        if (remainTokens < tokens) {
            uint256 tempPercentage = bonusPercentage.add(100);
            tokensForSale = remainTokens.mul(100).div(tempPercentage);
            bonusTokens = remainTokens - tokensForSale;
            tokens = remainTokens;
            purchase = currentRate.mul(tokensForSale);
            refund = weiAmount.sub(purchase);
        } else {
            refund = weiAmount.mod(currentRate);
            purchase = weiAmount.sub(refund);
        }

		forwardFunds(purchase);
		refundFunds(refund);

        token.mint(beneficiary, tokens);
        TokenPurchase(msg.sender, beneficiary, purchase, tokens);

        if (currentStatCount == maxStatCount) {
            maxStatCount = maxStatCount.add(1);
        }
        currentStatCount = currentStatCount.add(1);
        statElem storage newStatElem = statistics[currentStatCount];
        newStatElem.beneficiary = beneficiary;
        newStatElem.tokenSale = tokensForSale;
        newStatElem.tokenBonus = bonusTokens;
        newStatElem.purshaseAmount = purchase;

        remainTokens = remainTokens.sub(tokens);
        weiRaised = weiRaised.add(purchase);

    }

    function forwardFunds(uint256 _purchase) private {
        uint256[5] memory walletWeis;

        walletWeis[0] = _purchase.mul(50).div(100);
        walletWeis[1] = _purchase.mul(20).div(100);
        walletWeis[2] = _purchase.mul(11).div(100);
        walletWeis[3] = _purchase.mul(10).div(100);
        walletWeis[4] = _purchase.mul(9).div(100);
        uint256 walletAdditionalWei = _purchase.sub(walletWeis[0]).sub(walletWeis[1]).sub(walletWeis[2]).sub(walletWeis[3]).sub(walletWeis[4]);

        walletWeis[0] = walletWeis[0].add(walletAdditionalWei);
        WalletWeis1(_purchase,walletWeis[0],walletWeis[1],walletWeis[2],walletWeis[3],walletWeis[4]);
        for(uint256 i=0; i<5; i++) {
            if(walletWeis[i] != 0) {
                wallets[i].transfer(walletWeis[i]);
            }
        }
    }

    function refundFunds(uint256 _refund) private {
        if (_refund != 0) {
            msg.sender.transfer(_refund);
        }
    }

    function getStat(uint256 index) public constant returns (address, uint256, uint256, uint256) {
        return (statistics[index].beneficiary, statistics[index].tokenSale, statistics[index].tokenBonus, statistics[index].purshaseAmount);
    }
    
    function additionalTokenYearlyCreation() public onlyOwner {
        uint256 tokCurrentSupply = token.getTotalSupply();
        remainTokens = remainTokens.add(tokCurrentSupply.mul(5).div(1000));
    }
    
   function resetremainingtokens() public onlyOwner {
        require(start + period * 1 minutes < now || start > now);
        remainTokens = 0 ;
   }

}
