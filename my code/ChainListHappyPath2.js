var ChainList = artifacts.require("./ChainList.sol");

// test suite--// test suites to test the different functions and functionalities of our contracts
contract('ChainList', function(accounts){
  var chainListInstance; //state variable
  var seller = accounts[1]; //you have to types of accounts: buyer account and seller account
  var buyer = accounts[2]; //seller account
  var articleName1 = "article 1";
  var articleDescription1 = "Description for article 1";
  var articlePrice1 = 10;
  var articleName2 = "article 2";
  var articleDescription2 = "Description for article 2";
  var articlePrice2 = 20;
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy; //to make sure enough funds are there
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;  //and correct funds are transferred between parties
     //the following tests are set up to make sure each feature behaves and functions the way we want them to work
  it("should be initialized with empty values", function() { //the state of our contract when accessed
    return ChainList.deployed().then(function(instance) { //get an instance of our smart contract
      chainListInstance = instance; //save instance in global variable chainListInstance
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) { //then test the following parameters
      assert.equal(data.toNumber(), 0, "number of articles must be zero"); //these assertions tests each individual feature of our smart contract
      return chainListInstance.getArticlesForSale();
    }).then(function(data){
      assert.equal(data.length, 0, "there  should not be any article for sale");
    });
  });

  it("should let us sell a first article", function(){
    return chainlist.deployed().the(function(instance){ //to get our deplyed instance
      chainListInstance = instance; //save it in chainListInstance variable
      return chainListInstance.sellArticle(
        articleName1,
        articleDescription1,
         web3.toWei(articlePrice1, "ether"),
        {from: seller}
      );
    }).then(function(receipt){ //chian another promise
      // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered"); //check the length of array containing events
      assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle"); //check event sell log
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller); //seller must be seller
      assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice, "ether"));

      return  chainListInstance.getNumberOfArticles(); // to check the state of the contract was altered successfully
    }).then(function(data) { // fucntion that checks data to be equal 1
      assert.equal(data, 1, "number of articles must be one");

      return chainListInstance.getArticlesForSale(); //
    }).then(function(data) {
      assert.equal(data.length, 1, "there must be one article for sale");
      assert.equal(data[0].toNumber(), 1, "article id must be 1"); //check the value of identifier

      return chainListInstance.articles(data[0]); //check to see the article was saved in mapping
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller); //make sure seller is in index 1
      assert.equal(data[2], 0x0, "buyer must be empty"); // cause he just sold the article so he does not have any articles for sale
      assert.equal(data[3], articleName1, "article name must be " + articleName1);
      assert.equal(data[4], articleDescription1, "article description must be " + articleDescription1);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice1, "ether"), "article price must be " + web3.toWei(articlePrice1, "ether"));
    });
  });

  it("should let us sell a second article", function(){ //copied and pasted this from
    return chainlist.deployed().the(function(instance){ //to get our deplyed instance
      chainListInstance = instance; //save it in chainListInstance variable
      return chainListInstance.sellArticle(
        articleName2,
        articleDescription2,
         web3.toWei(articlePrice2, "ether"),
        {from: seller}
      );
    }).then(function(receipt){ //chian another promise
      // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered"); //check the length of array containing events
      assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle"); //check event sell log
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller); //seller must be seller
      assert.equal(receipt.logs[0].args._name, articleName2, "event article name must be " + articleName2);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice, "ether"));

      return  chainListInstance.getNumberOfArticles(); // to check the state of the contract was altered successfully
    }).then(function(data) { // fucntion that checks data to be equal 1
      assert.equal(data, 2, "number of articles must be two");

      return chainListInstance.getArticlesForSale(); //
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be two article for sale");
      assert.equal(data[1].toNumber(), 2, "article id must be 2"); //check the value of identifier

      return chainListInstance.articles(data[0]); //check to see the article was saved in mapping
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 2, "article id must be 2");
      assert.equal(data[1], seller, "seller must be " + seller); //make sure seller is in index 1
      assert.equal(data[2], 0x0, "buyer must be empty"); // cause he just sold the article so he does not have any articles for sale
      assert.equal(data[3], articleName2, "article name must be " + articleName2);
      assert.equal(data[4], articleDescription2, "article description must be " + articleDescription2);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice2, "ether"), "article price must be " + web3.toWei(articlePrice2, "ether"));
    });
  });

         //these are tests to make sure our accounts behave the way we want them to
  it("should buy an article", function(){ //this is to test buyArticle feature we just added
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance; //instance is saved in chainListInstance global variable
      // record balances of seller and buyer before the buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber(); //this means converted to javascrip number
      return chainListInstance.buyArticle(1, { //when this instance is mined then function on line 51 is called
        from: buyer,
        value: web3.toWei(articlePrice1, "ether")
      });
    }).then(function(receipt){ //these assertions tests the article triggers the correct event and the correct data
      assert.equal(receipt.logs.length, 1, "one event should have been triggered"); //these are to test the event functions
      assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should be LogBuyArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "article id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be " + buyer); // the buyer must be the buyer
      assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice1, "ether"));


      // record balances of buyer and seller after the buy--that's why the variable for these difinition were created at top
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      // check the effect of buy on balances of buyer and seller, accounting for gas
      assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, "seller should have earned " + articlePrice1 + " ETH");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "buyer should have spent " + articlePrice1 + " ETH");
          // calling the buy function costs gas to buyer
      return chainListInstance.getArticlesForSale(); // return means to getArticel instance and record it
    }).then(function(data){ // tests the modifications that functions makes on contract state
      assert.equal(data.length, 1, "there should now be only 1 article left for sale");
      assert.equal(data[0].toNumber(), 2, "article 2 should be the only article left for sale");

      return chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data.toNumber(), 2, "there should still be 2 articles in total");
    }); // these tests 5 things at once 1. trigger right event, 2 test accounts for gas 3 check modifications articles makes on state
  }); //4 number of articles 5 total number os articles is 2
});
