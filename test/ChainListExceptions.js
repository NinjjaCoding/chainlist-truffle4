// contract to be tested
var ChainList = artifacts.require("./ChainList.sol"); //of course we need the artifacts from file to communicate errors, throws and exceptions
                                                        //for example what happens when someone tries to pay less than item value? we need responses.
// test suite
contract("ChainList", function(accounts){ // this is rrelated to accounts so we need to define our acconts and how our accounts will repsond
  var chainListInstance; //we will need to know the current state of articls so need the Cha global variable
  var seller = accounts[1]; //we have to define each accounts...if we had other accounts in our contract those will need to be defined too
  var buyer = accounts[2];
  var articleName = "article 1"; // i think this was the default item
  var articleDescription = "Description for article 1";
  var articlePrice = 10;

  // no article for sale yet
  it("should throw an exception if you try to buy an article when there is no article for sale yet", function() { // if nothing to buy people shold not be able to buy
    return ChainList.deployed().then(function(instance) {   // 1st we need the instance to know if item is available
      chainListInstance = instance; // get and save the chainListInstance in the global variable
      return chainListInstance.buyArticle(1, { //if it is for sale then
        from: buyer, //obtain from buyer payment
        value: web3.toWei(articlePrice, "ether") // for article price in ether
      });
    }).then(assert.fail) //if it fails--the item is not available
    .catch(function(error){ //then catch the error
      assert(true); //assert that it is not available
    }).then(function() { //access getNumberOfArticles folder from chainListInstance folder
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) { //that data must be zero and saved
      assert.equal(data.toNumber(), 0, "number of articles must be 0");
    });
  });

  // buy an article that does not exist
  it("should throw an exception if you try to buy an article that does not exist", function(){
    return ChainList.deployed().then(function(instance){ //again we always get the instance
      chainListInstance = instance; //save it in chainListInstance glabla variable
      return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), { from: seller }); //show item description, name and price in ether
    }).then(function(receipt){ //save the receipt
      return chainListInstance.buyArticle(2, {from: seller, value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail) // if it fails
    .catch(function(error) { //catch the error in call back function
      assert(true); //make sure that is true
    }).then(function() {
      return chainListInstance.articles(1); //return item status from chainListInstance global variable
    }).then(function(data) { // i need to find out why we are manking these assertions or are these data being saveing in these files?
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });

  // buying an article you are selling
  it("should throw an exception if you try to buy your own article", function() {
    return ChainList.deployed().then(function(instance){ //as usual we must always get the instance
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, {from: seller, value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail) //this should fail
    .catch(function(error){ //then catch the error and log
      assert(true);
    }).then(function() {
      return chainListInstance.articles(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1"); //data [0] is the id
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });

  // incorrect value
  it("should throw an exception if you try to buy an article for a value different from its price", function() {
    return ChainList.deployed().then(function(instance){ //we have to first check to see if the item is available
      chainListInstance = instance; // save it in our global folder
      return chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice + 1, "ether")}); //that's why we need from: buyer added there
    }).then(assert.fail) //makes sure value is there if it fails then
    .catch(function(error){ //then catch and store the result
      assert(true);
    }).then(function() {
      return chainListInstance.articles(1); //
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    }); //the seller is in data[1], the buyer is in data [2]
  });

  // article has already been sold
  it("should throw an exception if you try to buy an article that has already been sold", function() {
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice, "ether")}); //
    }).then(function(){
      return chainListInstance.buyArticle(1, {from: web3.eth.accounts[0], value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return chainListInstance.articles(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], buyer, "buyer must be " + buyer);
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });
});
