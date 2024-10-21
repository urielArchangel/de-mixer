// SPDX-License-Identifier:UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./verifier.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";

interface IWETH9 {
    // Deposit ETH and receive WETH
    function deposit() external payable;

    // Withdraw WETH and receive ETH
    function withdraw(uint256 amount) external;

    // Standard ERC20 functions
    function transfer(address to, uint256 value) external returns (bool);

    function approve(address spender, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);

    function balanceOf(address owner) external view returns (uint256);
}

contract Mixer {
    ISwapRouter public uniswapRouter;
    IQuoter public quoter;
    address public WETH9; // Address of the WETH9 token
    uint256 public currentRoot;
    uint8 public constant MERKLE_TREE_DEPTH = 7;
    uint256[] public roots;
    uint256[] public commitments;
    mapping(uint256 => bool) public nulifierHashs;
    Groth16Verifier public verifier;
    event Deposit(uint256 indexed commitment, uint256 indexed root);
    event Withdrawal(address indexed recipient, uint256 nulifierHash);

    constructor(address _verifier, address _uniswapRouter, address _WETH9,address _quoter) {
        verifier = Groth16Verifier(_verifier);
        uniswapRouter = ISwapRouter(_uniswapRouter);
        WETH9 = _WETH9;
        quoter = IQuoter(_quoter);
    }

    function depositBase(uint256 _commitment, uint256 _root) external payable {
        require((msg.value > 0), "Deposit amount must be greater than 0");
        commitments.push(_commitment);
        currentRoot = _root;
        roots.push(_root);
        emit Deposit(_commitment, _root);
    }

    function getAmountOutMinimum(
        address tokenIn,
        uint256 amountIn,
        uint24 poolFee,
        uint256 slippageTolerance
    ) public returns (uint256) {
        uint256 expectedOutput = quoter.quoteExactInputSingle(
            tokenIn, // ERC20 token you're swapping from
            WETH9, // WETH (ETH equivalent in Uniswap)
            poolFee, // Pool fee (3000 for 0.3%)
            amountIn, // Amount of tokens to swap
            0 // No price limit
        );

        // Apply slippage tolerance
        uint256 minEthOut = (expectedOutput * (100 - slippageTolerance)) / 100;

        return minEthOut;
    }

    function depositERC20(
        address token,
        uint256 amount,
        uint256 _commitment,
        uint256 _root
    ) external {
        require(amount > 0, "Amount must be greater than 0");

        // Transfer ERC-20 tokens from the user to the contract
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        // Approve the Uniswap V3 router to spend the tokens
        IERC20(token).approve(address(uniswapRouter), amount);

        // Uniswap V3 exact input swap: swap ERC20 tokens for ETH
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: token,
                tokenOut: WETH9, // Use WETH9 to swap to ETH
                fee: 3000, // Pool fee (0.3%)
                recipient: address(this), // Contract receives the ETH
                deadline: block.timestamp + 15, // Transaction deadline
                amountIn: amount, // The amount of tokens to swap
                amountOutMinimum: getAmountOutMinimum(token, amount, 3000, 1), // Minimum ETH to receive
                sqrtPriceLimitX96: 0 // No price limit
            });

        uint256 ethReceived = uniswapRouter.exactInputSingle{value: 0}(params);

        // Convert WETH9 to ETH
        IWETH9(WETH9).withdraw(ethReceived);

        // Proceed with the same logic as depositBase, using the received ETH
        require(ethReceived > 0, "No ETH received from swap");
        commitments.push(_commitment);
        currentRoot = _root;
        roots.push(_root);

        emit Deposit(_commitment, _root);
    }

    function withdrawBase(
        uint256 _nulifierHash,
        address payable _recipient,
        uint256 _amount,
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[1] calldata pubSignals
    ) external {
        require(!nulifierHashs[_nulifierHash], "Has been used");
        require(
            verifier.verifyProof(_pA, _pB, _pC, pubSignals),
            "Invalid zk proof"
        );
        require(pubSignals[0] == 0, "Invalid zk proof");
        nulifierHashs[_nulifierHash] = true;
        (bool success, ) = _recipient.call{value: _amount}("");
        require(success, "Error transfering");
        emit Withdrawal(_recipient, _nulifierHash);
    }


    function withdrawERC20(
    uint256 _nulifierHash,
    address payable _recipient,
    uint256 _amount,
    address tokenOut,  // ERC-20 token to withdraw as
    uint24 poolFee,  // Uniswap pool fee (e.g., 3000 for 0.3%)
    uint[2] calldata _pA,
    uint[2][2] calldata _pB,
    uint[2] calldata _pC,
    uint[1] calldata pubSignals
) external {
    require(!nulifierHashs[_nulifierHash], "Has been used");
    require(verifier.verifyProof(_pA, _pB, _pC, pubSignals), "Invalid zk proof");
    require(pubSignals[0] == 0, "Invalid zk proof");
    nulifierHashs[_nulifierHash] = true;

    // Convert ETH to WETH9
    IWETH9(WETH9).deposit{value: _amount}();

    // Approve the Uniswap V3 router to spend WETH9
    IWETH9(WETH9).approve(address(uniswapRouter), _amount);

    // Calculate minimum tokenOut amount with slippage tolerance
    uint256 expectedOutput = quoter.quoteExactInputSingle(
        WETH9, // Token to swap (ETH via WETH9)
        tokenOut, // Token to receive
        poolFee, // Pool fee (e.g., 3000 for 0.3%)
        _amount, // Amount of WETH9 (ETH) to swap
        0 // No price limit
    );

    // Apply slippage tolerance (e.g., 1% slippage)
    uint256 minTokenOut = expectedOutput * 99 / 100;

    // Swap WETH9 to the ERC-20 token
    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
        tokenIn: WETH9,
        tokenOut: tokenOut,
        fee: poolFee,
        recipient: _recipient,  // Send the tokens directly to the recipient
        deadline: block.timestamp + 15,  // Transaction deadline
        amountIn: _amount,  // Amount of ETH (in WETH9) to swap
        amountOutMinimum: minTokenOut,  // Minimum tokens to receive after slippage
        sqrtPriceLimitX96: 0  // No price limit
    });

    // Perform the swap
    uint256 tokenReceived = uniswapRouter.exactInputSingle(params);
    require(tokenReceived > 0, "Swap failed");

    emit Withdrawal(_recipient, _nulifierHash);
}


    function getCommitments() public view returns (uint256[] memory) {
        uint8 startIndex = 0;
        uint256 endIndex = commitments.length;
        uint256[] memory subset = new uint256[](endIndex);

        for (uint256 i = startIndex; i < endIndex; i++) {
            subset[i] = commitments[i];
        }

        return subset;
    }

    function getRoots() public view returns (uint256[] memory) {
        uint8 startIndex = 0;
        uint256 endIndex = commitments.length;
        uint256[] memory subset = new uint256[](endIndex);

        for (uint256 i = startIndex; i < endIndex; i++) {
            subset[i] = roots[i];
        }

        return subset;
    }
}
