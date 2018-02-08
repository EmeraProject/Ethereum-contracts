pragma solidity 0.4.19;

import "./GEMERAToken.sol";
import "./AddressesWithdraw.sol";
import "./Pausable.sol";
import "./SafeMath.sol";

contract GEMERA is AddressesWithdraw, Pausable {
  using SafeMath for uint;

  GEMERAToken public token;

  struct statElem {
    address beneficiary;
    uint tokenSale;
    uint tokenBonus;
    uint purshaseAmount;
  }

  mapping(uint => statElem) statistics;
  address[5] wallets; //wallets for withdraw funds collecting from smart contract - 50%-20%-11%-10%-9%

  uint public start;
  uint public period;
  uint public rate;
  uint public bonusPercentage;
  uint public lastTimeRateChange;
  uint public hardCapRound;
  uint public remainTokens;
  uint public weiRaised;
  uint private currentRate;
  uint public currentStatCount;
  uint public maxStatCount;

  event TokenPurchase(address indexed sender, address indexed beneficiary, uint purchase, uint tokens);
  event WalletWeis(uint purchase, uint[5]);

  //Change for Prod
  modifier salesActive() {
    bool withinPeriod = now >= start && now <= start.add(period.mul(10 * 1 minutes));
    require(withinPeriod && !paused);
    _;
  }

  function GEMERA(address _token) public {
    require(_token != address(0));

    token = GEMERAToken(_token);
    wallets[0] = withdraw1;
    wallets[1] = withdraw2;
    wallets[2] = withdraw3;
    wallets[3] = withdraw4;
    wallets[4] = withdraw5;
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
  function setupNewRoundParams(uint _start, uint _period, uint _rate, uint _bonusPercentage, uint _hardCap) onlyOwner public {
    require(remainTokens == 0 || start.add(period.mul(1 minutes)) < now || start > now);
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

  function calcCurrentRate() internal view returns(uint) {
    return rate.div(100000000);
  }

  // change for Prod
  function tryToChangeRate(uint _rate) public onlyOwner returns(bool) {
    require(now > lastTimeRateChange.add(2 minutes));
    require(_rate >= 100000000);

    rate = _rate;
    currentRate = calcCurrentRate();
    lastTimeRateChange = now;
    return true;
  }

  function () public payable {
    buyTokens(msg.sender);
  }

  function buyTokens(address beneficiary) public salesActive payable {
    require(beneficiary != address(0));
    require((remainTokens > 0 ) && msg.value >= 10 finney);

    uint refund;
    uint purchase;

    uint weiAmount = msg.value;
    uint tokensForSale = weiAmount.div(currentRate);
    uint bonusTokens = tokensForSale.mul(bonusPercentage).div(100);
    uint tokens = tokensForSale.add(bonusTokens);

    if (remainTokens < tokens) {
      uint tempPercentage = bonusPercentage.add(100);
      tokensForSale = remainTokens.mul(100).div(tempPercentage);
      bonusTokens = remainTokens.div(tokensForSale);
      tokens = remainTokens;
      purchase = currentRate.mul(tokensForSale);
      refund = weiAmount.sub(purchase);
    } else {
      refund = weiAmount.mod(currentRate);
      purchase = weiAmount.sub(refund);
    }

    if (currentStatCount == maxStatCount) maxStatCount = maxStatCount.add(1);
    currentStatCount = currentStatCount.add(1);
    statElem storage newStatElem = statistics[currentStatCount];
    newStatElem.beneficiary = beneficiary;
    newStatElem.tokenSale = tokensForSale;
    newStatElem.tokenBonus = bonusTokens;
    newStatElem.purshaseAmount = purchase;

    remainTokens = remainTokens.sub(tokens);
    weiRaised = weiRaised.add(purchase);

    forwardFunds(purchase);

    TokenPurchase(msg.sender, beneficiary, purchase, tokens);
    token.mint(beneficiary, tokens);
    if (refund > 0) msg.sender.transfer(refund);
  }

  function forwardFunds(uint _purchase) private {
    uint[5] memory walletWeis;

    walletWeis[0] = _purchase.mul(50).div(100);
    walletWeis[1] = _purchase.mul(20).div(100);
    walletWeis[2] = _purchase.mul(11).div(100);
    walletWeis[3] = _purchase.mul(10).div(100);
    walletWeis[4] = _purchase.mul(9).div(100);
    uint walletAdditionalWei = _purchase.sub(walletWeis[0]).sub(walletWeis[1]).sub(walletWeis[2]).sub(walletWeis[3]).sub(walletWeis[4]);

    walletWeis[0] = walletWeis[0].add(walletAdditionalWei);
    WalletWeis(_purchase, walletWeis);
    for(uint i = 0; i < 5; i++) {
      if(walletWeis[i] != 0) {
        wallets[i].transfer(walletWeis[i]);
      }
    }
  }

  function getStat(uint index) public constant returns (address, uint, uint, uint) {
    return (
      statistics[index].beneficiary,
      statistics[index].tokenSale,
      statistics[index].tokenBonus,
      statistics[index].purshaseAmount
    );
  }

  function additionalTokenYearlyCreation() public onlyOwner {
    uint tokCurrentSupply = token.totalSupply();
    remainTokens = remainTokens.add(tokCurrentSupply.mul(5).div(1000));
  }

  function resetremainingtokens() public onlyOwner {
    require(start.add(period.mul(1 minutes)) < now || start > now);
    remainTokens = 0;
  }
}
