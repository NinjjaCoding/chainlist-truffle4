// contract to be tested
var ChainList = artifacts.require("./ChainList.sol");

// test suite variable--this is to test errors like someone paying less than the price of item
contract("ChainList", function(accounts){ //how the program should behave and respond
  var chainListInstance; //as always we setup the varaibles
  var seller = accounts[1]; //account 1 is assigned to seller
  var buyer = accounts[2]; //accopunt 2 is assigned to buyer
  var articleName = "article 1";
  var articleDescription = "Description for article 1";
  var articlePrice = 0;
     //below are the test cases for this project..testing to make sure buyer cannot be seller
  // shouldd not be able buy article if there is no article for sale yet
  it("should throw an exception if you try to buy an article when there is no article for sale yet", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance; //as always get the instance to get the current staus of item
      return chainListInstance.buyArticle({ //
        from: buyer,
        value: web3.toWei(articlePrice, "ether")
      });
    }).then(assert.fail) //here we expect the call to fail
    .catch(function(error){ //here we expect to catch the error
      assert(true);
    }).then(function() {
      return chainListInstance.getArticle();
    }).then(function(data) {
      assert.equal(data[0], 0x0, "seller must be empty"); //0x0 neans
      assert.equal(data[1], 0x0, "buyer must be empty"); // buyer must be empty after we sell article
      assert.equal(data[2], "", "article name must be empty");
      assert.equal(data[3], "", "article description must be empty");
      assert.equal(data[4].toNumber(), 0, "article price must be zero");
    });
  });
   //programing language is like natural human language, used in braces and backets to define the english lanhuage terms and variable
  // should not be able to buy an article you are selling...this is one of the requirement we setup on chainList.sol
  it("should throw an exception if you try to buy your own article", function() {
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), { from: seller});
    }).then(function(receipt){
      return chainListInstance.buyArticle({from: seller, value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail)
    .catch(function(error){ //catch the error with a function
      assert(true); //
    }).then(function() {
      return chainListInstance.getArticle();
    }).then(function(data) {
      assert.equal(data[0], seller, "seller must be " + seller);
      assert.equal(data[1], 0x0, "buyer must be empty");
      assert.equal(data[2], articleName, "article name must be " + articleName);
      assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });

  // incorrect value
  it("should throw an exception if you try to buy an article for a value different from its price", function() {
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice + 1, "ether")});
    }).then(assert.fail) //assert if it fails
    .catch(function(error){ //we catch the error
      assert(true);
    }).then(function() {
      return chainListInstance.getArticle();
    }).then(function(data) {
      assert.equal(data[0], seller, "seller must be " + seller);
      assert.equal(data[1], 0x0, "buyer must be empty");
      assert.equal(data[2], articleName, "article name must be " + articleName);
      assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });

  // what happens if try to buy article that has already been sold
  it("should throw an exception if you try to buy an article that has already been sold", function() {
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance; //save instance in global variable
      return chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice, "ether")}); //when this is mined
    }).then(function(){ //the buyArticle is called again
      return chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail) //this time it sould fail
    .catch(function(error){
      assert(true);
    }).then(function() {
      return chainListInstance.getArticle(); //to make sure the state is the same as before meaning sold 
    }).then(function(data) {
      assert.equal(data[0], seller, "seller must be " + seller);
      assert.equal(data[1], buyer, "buyer must be " + buyer);
      assert.equal(data[2], articleName, "article name must be " + articleName);
      assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });
});
