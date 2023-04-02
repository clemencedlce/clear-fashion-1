/*Connect the node.js server*/

const fs = require('fs');

const MONGODB_COLLECTION = 'clearfashionCollection';



const { MongoClient} = require('mongodb');
const MONGODB_URI = "mongodb+srv://clemencedlce:abc@cluster0.mcdh7dc.mongodb.net/?retryWrites=true&w=majority";
const MONGODB_DB_NAME = 'clearfashion';
const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
const db = client.db(MONGODB_DB_NAME)

// Insert the products into the database 

async function insertProducts() {
  //const products = [];
  const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
  const db = client.db(MONGODB_DB_NAME);

  var data = fs.readFileSync("C:/Users/Floryne/Web Architecture/clear-fashion/server/AllProducts.json");
  const products = JSON.parse(data);
  
  const collection = db.collection('products');
  await collection.deleteMany({});
  const result = await collection.insertMany(products);

  console.log(result)

  process.exit(0);
}

//insertProducts();

async function findProducts(dbUrl) {


  const client = await MongoClient.connect(dbUrl);
  const db = client.db(MONGODB_DB_NAME);

  const brand = 'DedicatedBrand';
  const maxPrice = 100;
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  
  const brandProducts = await db.collection('products').find({ brand }).toArray();
  console.log(`Brand products: ${brandProducts.length}`);
  
  const cheapProducts = await db.collection('products').find({ price: { $lt: maxPrice } }).toArray();
  console.log(`Cheap products: ${cheapProducts.length}`);

  const priceSortedProducts = await db.collection('products').find().sort({ price: 1 }).toArray();
  console.log(`Price sorted products: ${priceSortedProducts.length}`);

  const dateSortedProducts = await db.collection('products').find().sort({ scrapedAt: -1 }).toArray();
  console.log(`Date sorted products: ${dateSortedProducts.length}`);

  const recentProducts = await db.collection('products').find({ scrapedAt: { $gte: twoWeeksAgo } }).toArray();
  console.log(`Recent products: ${recentProducts.length}`);

  await client.close();
}

// Find all products related to a given brand

const brand = 'Montlimart';

const collection = db.collection('products');
const result1 = await collection.find({brand})

console.log(result1);

// Find all products less than 100$

const result2 = await collection.find({price: {$lt: Price}}).toArray();
console.log(result2);

// Find all products sorted by price 

const result3 = await collection.find().sort({price: -1}).toArray();
console.log(result3);

// Find all products sorted by date 

const result4 = await collection.find().sort({date: -1}).toArray(); 
console.log(result4);

// Find all products scraped less than 2 weeks 



