var mongo = require('mongodb')
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'ubiquitous-signage';

module.exports = {
  insertMongoDB: insertMongoDB
}

function sampleUpdate(){
  MongoClient.connect(url, function(err, client) {
    var db = client.db(dbName);
    var collection = db.collection('contexts');
    var o_id = new mongo.ObjectId("5a252b54f0e030db8e01e9be");
    collection.update({"_id" : o_id}, {"id" : 0, "lang" : "en"})
    client.close();
  });
}

function insertMongoDB(item){
  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    const collection = db.collection('panels');
    console.log(item.contents[0]);
    var o_id = new mongo.ObjectId(item._id);
    collection.update({"_id" : o_id}, item)
    client.close();
  });
}
