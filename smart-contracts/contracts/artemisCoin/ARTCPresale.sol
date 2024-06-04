// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import {IERC20} from "./lib/interfaces/IERC20.sol";
import {IPair} from "./lib/dex/IPair.sol";
import {IRouter} from "./lib/dex/IRouter.sol";
import {IFactory} from "./lib/dex/IFactory.sol";
import {SafeERC20} from "./lib/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "./lib/access/Ownable.sol";

contract ARTCPresale is Ownable {
    IERC20 public artcToken;

    IERC20 private usdtToken;
    
    uint256 public allocatedAmount;
    uint256 public startTime;
    address public ethUsdtPair;
    address public univ2Router;

    struct Step{
        uint256 startTime; // in second
        uint256 period; // days
        uint256 price; // decimal 8
    }

    Step[25] private steps;

    uint256 public endStep;
    uint256 public totalSoldAmount;
    uint256 public totalFundsInUSD;
    
    mapping(address => uint256) public tokenBuyAmount;

    // Construct
    constructor(
        address _token,
        address _usdt,
        uint256 _startTime,
        uint256 _initialPrice
    ) Ownable(msg.sender) {
        artcToken = IERC20(_token);
        usdtToken = IERC20(_usdt);
        startTime = _startTime;
        endStep = 24;
        allocatedAmount = 0;

        if (block.chainid == 11155111){
            univ2Router = 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;
        }
        if (block.chainid == 1){
            univ2Router = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
        }
        address factory = IRouter(univ2Router).factory();
        ethUsdtPair = IFactory(factory).getPair(IRouter(univ2Router).WETH(), _usdt);

        steps[0] = Step(_startTime, 7 days, _initialPrice);
        uint256 stepStartTime = _startTime + 7 days;
        for (uint256 i = 1 ; i < 25 ; i ++) {
            steps[i] = Step(stepStartTime, 3 days, _initialPrice);
            stepStartTime = stepStartTime + 3 days;
        }
    }

    function depositArtcToken(uint256 _amount) public onlyOwner {
        require (_amount > 0, "wrong parameter");
        require (_amount <= artcToken.balanceOf(msg.sender), "Insufficient tokens.");
        SafeERC20.safeTransferFrom(
            artcToken,
            msg.sender,
            address(this),
            _amount
        );
        allocatedAmount += _amount;
    }

    function setUsdtToken(address _token) public onlyOwner {
        usdtToken = IERC20(_token);
    }

    function setStartTime(uint256 _startTime) public onlyOwner {
        require(startTime != _startTime, "SET_SAME_VALUE");

        startTime = _startTime;
        steps[0] = Step(_startTime, 7 days, steps[0].price);
        uint256 stepStartTime = _startTime + 7 days;
        for (uint256 i = 1 ; i < 25 ; i ++) {
            steps[i] = Step(stepStartTime, 3 days, steps[0].price);
            stepStartTime = stepStartTime + 3 days;
        }
    }
    
    // From 0 step to 24 step. 0 <= _step <25
    function setStepParameter(uint256 _step, uint256 _startTime, uint256 _period, uint256 _price) external onlyOwner {
        require (0 <= _step && _step < 25, "_step value should be between 0 and 24.");
        steps[_step] = Step(_startTime, _period, _price);
    }

    // 0 <= _endStep < 25
    function setEndStep(uint256 _endStep) external onlyOwner {
        if (_endStep >= 0 && _endStep < 25) {
            endStep = _endStep;
            return;
        }
        endStep = 24;
    }

    // 1 usdt -> _amount = 1
    function buyTokenWithUsdt(uint256 _amount) external {
        uint256 _currentStep =  this.getCurrentStep(); // 0 <= _currentStep <=26
        require (1 <= _currentStep, "The presale doesn't start yet.");
        require (_currentStep <= endStep + 1, "The presale ended");
        uint256 outAmount = (_amount * 1 ether * 100_000_000) / steps[_currentStep].price / 1000_000;

        require(allocatedAmount >= outAmount, "Insufficient $ARTC token.");

        totalSoldAmount += outAmount;
        allocatedAmount -= outAmount;

        tokenBuyAmount[msg.sender] += outAmount;

        SafeERC20.safeTransferFrom(
            usdtToken,
            msg.sender,
            address(this),
            _amount
        );
        SafeERC20.safeTransfer(artcToken, msg.sender, outAmount);
    }

    function buyTokenWithEth() payable external {
        uint256 _currentStep =  this.getCurrentStep(); // 0 <= _currentStep <=26
        require (1 <= _currentStep, "The presale doesn't start yet.");
        require (_currentStep <= endStep + 1, "The presale ended");

        (uint112 r0, uint112 r1, ) = IPair(ethUsdtPair).getReserves();
        uint256 _ethPrice = 0;
        if (address(usdtToken) == IPair(ethUsdtPair).token0()) {
            _ethPrice = ((r0 * 1 ether / r1) * 10 ** 8) / 1000_000;
        } else {
            _ethPrice = ((r1 * 1 ether / r0) * 10 ** 8) / 1000_000;
        }

        uint256 outAmount = msg.value * _ethPrice / steps[_currentStep].price;

        require(allocatedAmount >= outAmount, "Insufficient $ARTC token.");

        totalSoldAmount += outAmount;
        allocatedAmount -= outAmount;

        tokenBuyAmount[msg.sender] += outAmount;

        SafeERC20.safeTransfer(artcToken, msg.sender, outAmount);
    }

    function withdrawETH(address to, uint256 amount) external onlyOwner {
        require(
            this.getCurrentStep() > endStep + 1 || allocatedAmount == 0,
            "IN_ROUND"
        );
        uint256 balance = address(this).balance;
        require(balance >= amount, "Insufficient funds");
        payable(to).transfer(amount);
    }

    function withdrawToken(
        address to,
        uint256 amount
    ) external onlyOwner {
        require(
            this.getCurrentStep() > endStep + 1 || allocatedAmount == 0,
            "IN_ROUND"
        );
        uint256 balance = usdtToken.balanceOf(address(this));
        require(balance >= amount, "Insufficient funds");
        SafeERC20.safeTransfer(usdtToken, to, amount);
    }

    // 0 <= value <=26
    // before starting presale -> 0
    // n step -> n (1 <= n <= 25)
    // after presale finishes, 26
    function getCurrentStep() external returns(uint256) {
        if (block.timestamp < steps[0].startTime) return 0;
        for (uint256 i = 0 ; i < 25 ; i ++) {
            if (block.timestamp >= steps[i].startTime && block.timestamp < steps[i].startTime + steps[i].period) return i + 1;
        }
        return 26;
    }

    function getStepParameter(uint256 _step) external returns(uint256, uint256, uint256) {
        if (_step >= 0 && _step <25) {
            return (steps[_step].startTime, steps[_step].period, steps[_step].price);
        }
        return (0,0,0);
    }

    // 0 <= _endStep < 25
    function getEndStep() external returns(uint256) {
        return endStep;
    }

    function getStartTime() public returns(uint256) {
        return startTime;
    }

    function getEthPrice() public returns(uint256) {
        (uint112 r0, uint112 r1, ) = IPair(ethUsdtPair).getReserves();
        uint256 _ethPrice = 0;
        if (address(usdtToken) == IPair(ethUsdtPair).token0()) {
            _ethPrice = ((r0 * 1 ether / r1) * 10 ** 8) / 1000_000;
        } else {
            _ethPrice = ((r1 * 1 ether / r0) * 10 ** 8) / 1000_000;
        }
        return _ethPrice;
    }

    function getTotalUsd() public returns(uint256) {
        uint256 _usdtBalance = usdtToken.balanceOf(address(this));
        uint256 _ethPrice = this.getEthPrice();
        return _ethPrice * address(this).balance / 1 ether + _usdtBalance / 1000_000;
    }

    receive() external payable {}

    fallback() external payable {}
}