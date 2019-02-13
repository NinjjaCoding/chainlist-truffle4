pragma solidity ^0.4.18;

contract Ownable { //to hold contract owener address
  // state variables
  address owner;

  // modifiers
  modifier onlyOwner() { //to change the bahavior of kill function
    require(msg.sender == owner);
    _; //
  }

  // constructor to save the owener address
  function Ownable() public {
    owner = msg.sender; //now that we did tthis on a base contract
  } //we can now extend this in the chain contract..externalize it
} //now we make some adjustments in ChainList.sol
