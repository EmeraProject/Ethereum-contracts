pragma solidity 0.4.19;

import "./GEMERAToken.sol";
import "./Pausable.sol";
import "./SafeMath.sol";

contract GEMERA is Pausable {
  using SafeMath for uint;

  GEMERAToken public token;

  struct statElem {
    address beneficiary;
    uint tokenSale;
    uint tokenBonus;
    uint purshaseAmount;
  }
  struct user {
    bool state;
    bool addr;
  }

  mapping(uint => statElem) public statistics;
  mapping(address => user) public whiteList;
  address[] public whiteUsers;
  address[5] private withdrawalWallets;

  uint public start;
  uint public period;
  uint public bonusPercentage;
  uint public lastTimeRateChange;
  uint public hardCapRound;
  uint public remainTokens;
  uint public weiRaised;
  uint public currentStatCount;
  uint public maxStatCount;
  bool public fWhite;
  uint public rate;

  uint private decimals = 1E18;

  event TokenPurchase(address indexed sender, address indexed beneficiary, uint purchase, uint tokens);
  event WalletWeis(uint purchase, uint[5] wallets);

  //Change for Prod
  modifier salesActive() {
    require(now >= start && now <= start.add(period.mul(1 minutes)));
    _;
  }

  function GEMERA(address _token, address[5] _wallets) public {
    require(_token != address(0));

    token = GEMERAToken(_token);
    withdrawalWallets = _wallets;
  }

  function cancelRoundSale() public onlyOwner {
    currentStatCount = 0;
    maxStatCount = 0;
    start = 0;
    period = 0;
    bonusPercentage = 0;
    lastTimeRateChange = 0;
    rate = 0;
    hardCapRound = 0;
  }

  // Change for Prod
  function setupNewRoundParams(uint _start, uint _period, uint _rate, uint _bonusPercentage, uint _hardCap) public onlyOwner whenNotPaused {
    require(remainTokens == 0 || start.add(period.mul(1 minutes)) < now || start > now);
    require(_start >= now && _period > 0);
    require(_rate > 0);
    require(_bonusPercentage <= 100 && _bonusPercentage > 0);
    require(_hardCap > 0);

    start = _start;
    period = _period;
    bonusPercentage = _bonusPercentage;
    lastTimeRateChange = now;
    hardCapRound = _hardCap.mul(decimals).add(remainTokens);
    remainTokens = hardCapRound;
    rate = _rate;
    currentStatCount = 0;
  }

  // Change for Prod
  function tryToChangeRate(uint _rate) public onlyOwner returns(bool) {
    require(now > lastTimeRateChange.add(2 minutes));
    require(_rate > 0);

    rate = _rate;
    lastTimeRateChange = now;
    return true;
  }

  function () public payable {
    buyTokens(msg.sender);
  }

  function buyTokens(address _beneficiary) public salesActive whenNotPaused payable {
    require(_beneficiary != address(0));
    require(!fWhite || whiteList[msg.sender].state);
    require((remainTokens > 0) && msg.value >= 10 finney);

    uint refund;
    uint purchase;

    uint weiAmount = msg.value;
    uint tokensForSale = weiAmount.mul(decimals).div(rate);
    uint bonusTokens = tokensForSale.mul(bonusPercentage).div(100);
    uint tokens = tokensForSale.add(bonusTokens);

    if (remainTokens < tokens) {
      uint tempPercentage = bonusPercentage.add(100);
      tokensForSale = remainTokens.mul(100).div(tempPercentage);
      bonusTokens = remainTokens.div(tokensForSale);
      tokens = remainTokens;
      purchase = tokensForSale.mul(rate).div(decimals);
      refund = weiAmount.sub(purchase);
    } else {
      purchase = weiAmount.sub(refund);
    }


    if (currentStatCount == maxStatCount) maxStatCount = maxStatCount.add(1);
    currentStatCount = currentStatCount.add(1);
    statElem storage newStatElem = statistics[currentStatCount];
    newStatElem.beneficiary = _beneficiary;
    newStatElem.tokenSale = tokensForSale;
    newStatElem.tokenBonus = bonusTokens;
    newStatElem.purshaseAmount = purchase;

    remainTokens = remainTokens.sub(tokens);
    weiRaised = weiRaised.add(purchase);

    forwardFunds(purchase);

    TokenPurchase(msg.sender, _beneficiary, purchase, tokens);
    token.mint(_beneficiary, tokens);
    if (refund > 0) msg.sender.transfer(refund);
  }

  function forwardFunds(uint _purchase) private {
    uint[5] memory walletWeis;

    walletWeis[0] = _purchase.mul(50).div(100);
    walletWeis[1] = _purchase.mul(20).div(100);
    walletWeis[2] = _purchase.mul(11).div(100);
    walletWeis[3] = _purchase.mul(10).div(100);
    walletWeis[4] = _purchase.sub(walletWeis[0]).sub(walletWeis[1]).sub(walletWeis[2]).sub(walletWeis[3]);

    WalletWeis(_purchase, walletWeis);
    for(uint i = 0; i < 5; i++) {
      if(walletWeis[i] != 0) {
        withdrawalWallets[i].transfer(walletWeis[i]);
      }
    }
  }

  function whitelistAddress(address[] _users) public onlyOwner {
    for (uint i = 0; i < _users.length; i++) {
      if (_users[i] != address(0) && !whiteList[_users[i]].state) {
        if (!whiteList[_users[i]].addr) {
          whiteList[_users[i]].addr = true;
          whiteUsers.push(_users[i]);
        }
        whiteList[_users[i]].state = true;
      }
    }
  }

  function deleteUserFromWhitelist(address[] _users) public onlyOwner {
    for (uint i = 0; i < _users.length; i++) {
      whiteList[_users[i]].state = false;
    }
  }

  function switchWhiteFlag() public onlyOwner {
    fWhite = !fWhite;
  }

  function additionalTokenYearlyCreation() public onlyOwner {
    uint tokCurrentSupply = token.totalSupply();
    remainTokens = remainTokens.add(tokCurrentSupply.mul(5).div(1000));
  }

  function resetRemainingTokens() public onlyOwner {
    require(start.add(period.mul(1 minutes)) < now || start > now);
    remainTokens = 0;
  }

  function approveOwnership() public onlyOwner {
    token.approveOwnership();
  }

  function lengthWhiteList() public view returns(uint) {
    return whiteUsers.length;
  }

  function getWallets() public view returns(address[5]) {
    return withdrawalWallets;
  }
}
