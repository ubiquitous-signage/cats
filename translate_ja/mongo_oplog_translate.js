var MongoOplog = require('mongo-oplog');
var async = require('async');
var translate = require('./gcp_translate_word.js');
var dbstore = require('./mongo_db_manager.js')
const oplog = MongoOplog('mongodb://127.0.0.1:27017/local', { ns: 'ubiquitous-signage.panels' })
var countForContent = 0
var countForTranslate = 0

oplog.tail();

oplog.on('op', data => {
    console.log("op");
});

oplog.on('insert', doc => {
  console.log('insert');
  if (doc.o.type == "table") {
    console.log(doc.o.contents[0]);
    separateTableToContent(doc.o);
  } else if (doc.o.type == "plain") {
    translateNormalContent(doc.o);
  }
});

oplog.on('update', doc => {
  console.log("update");
  if (doc.o.type == "table") {
    separateTableToContent(doc.o);
  } else if (doc.o.type == "plain") {
    translateNormalContent(doc.o);
  }
});

async function separateTableToContent(item){
  var isChanged = false
  //titleの翻訳
  if (item.title.en == "") {
    isChanged = true
    await translateText(item.title)
    .then(function(payload){
      item.title = payload
    })
  }
  //content(table)の翻訳
  async.forEachOf(item.contents, function(element, index, callback){
    async.forEachOf(element, function(content, childIndex, callback){
      if (content.type == "String") {
        if (content.payload.en == ""){
          isChanged = true
          translateText(content.payload).then(function(translatedText){
            if (translatedText == "") {
              isChanged = false
              callback()
            }
            content.payload = translatedText
            element[childIndex] = content
            callback()
          })
        }
      } else {
        callback()
      }
    }, function(err){
      if (err) {
        console.log(err);
        return
      }
      item.contents[index] = element;
      callback();
    }
  )
}, function(err){
  if (err) {
    console.log(err);
    return
  }
  if (!isChanged) {return} //翻訳されたものがない
  if (isChanged == true) {
    updateDB(item);
  }
}
)}

async function translateNormalContent(item){
  var isChanged = false
  if (item.title.en == "") {
    isChanged = true
    await translateText(item.title)
    .then(function(text){
      item.title = text
    })
  }
  if (item.contents.en == "") {
    console.log('esddddddddds');
    isChanged = true
    await translate.translateText(item.contents.ja)
    .then(function(translatedText){
      console.log(translatedText);
      if (translatedText == "") {
        isChanged = false
      } else {
        item.contents.en = translatedText
      }
    })
  }
  if (isChanged == true) {
    console.log('normalの翻訳');
    console.log(item);
    updateDB(item);
  }
}

function translateText(payload){
  return new Promise(resolve => {
    if (payload.en == "") {
      translate.translateText(payload.ja)
      .then(function(translatedText){
        payload.en = translatedText
        resolve(payload)
      }).catch(function(err){
        console.log(err);
        reject(err)
      })
    }
  })
}

function updateDB(item){
  dbstore.insertMongoDB(item)
}

oplog.on('error', error => {
  console.log("error");
  console.log(error);
});

oplog.on('end', () => {
  console.log('Stream ended');
});

oplog.stop(() => {
  console.log('server stopped');
});
