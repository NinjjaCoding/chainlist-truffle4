pragma solidity ^0.4.18;

contract ChainList { //state variable
  // custom types
  struct Article { //the following fields will all be grouped together
    uint id; //article id number allows to identify each item in array position it is stored in
    address seller; //these allow to identify each item
    address buyer;
    string name;
    string description;
    uint256 price;
  }

  // state variables
  mapping (uint => Article) public articles; //this will store a list of article which will be accessible through an unsinged integer key
  uint articleCounter; // this will helps us keep track of size of mapping--getter is automatically created

  // events
  event LogSellArticle(  //takes associated data and records it
    uint indexed _id,
    address indexed _seller, //these are the value we give values we need
    string _name,
    uint256 _price
  );
  event LogBuyArticle(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
  );

  // sell an article
  function sellArticle(string _name, string _description, uint256 _price) public {
    // a new article--//first create a new article Counter
    articleCounter++; //++ increments article counter by 1
     // then we need to store a new artice inside the article mapping

    articles[articleCounter] = Article(  //this is where it is stored
      articleCounter, // the counter = article id and is referenced by its key in mapping
      msg.sender, //this and below fields are stored in mapping array
      0x0,
      _name,
      _description,
      _price
    );

    LogSellArticle(articleCounter, msg.sender, _name, _price); // we added articleCounter in event log
  }

  // fetch the number of articles in the contract
  function getNumberOfArticles() public view returns (uint) {
    return articleCounter;
  }

  // fetch and return all article IDs for articles still for sale
  function getArticlesForSale() public view returns (uint[]) {
    // prepare output array
    uint[] memory articleIds = new uint[](articleCounter);
      //this stored in memory and not storage--less expensive
    uint numberOfArticlesForSale = 0;
    // iterate over articles
    for(uint i = 1; i <= articleCounter;  i++) { //if we do not have a buyer yet then we add its identifier to our array and increment the counter
      // keep the ID if the article is still for sale
      if(articles[i].buyer == 0x0) { // if we do not have a buyer
        articleIds[numberOfArticlesForSale] = articles[i].id; //then obtian article id
        numberOfArticlesForSale++;
      }
    }

    // copy the articleIds array into a smaller forSale array
    uint[] memory forSale = new uint[](numberOfArticlesForSale);
    for(uint j = 0; j < numberOfArticlesForSale; j++) {
      forSale[j] = articleIds[j];
    }
    return forSale;
  }

  // buy an article--// to buy an article function with modifiers & verifications
  function buyArticle(uint _id) payable public {
    // we check whether there is an article for sale
    require(articleCounter > 0);

    // we check that the article exists
    require(_id > 0 && _id <= articleCounter);

    // we retrieve the article
    Article storage article = articles[_id];

    // we check that the article has not been sold yet
    require(article.buyer == 0X0);

    // we don't allow the seller to buy his own article
    require(msg.sender != article.seller);

    // we check that the value sent corresponds to the price of the article
    require(msg.value == article.price);

    // keep buyer's information
    article.buyer = msg.sender;

    // the buyer can pay the seller
    article.seller.transfer(msg.value);

    // trigger the event--// trigger the event---we updated all the fields to include multipe sellers and article
    LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
  }
}
