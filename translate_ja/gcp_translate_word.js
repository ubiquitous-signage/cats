var async = require('async');
// Imports the Google Cloud client library
const Translate = require('@google-cloud/translate');

// Your Google Cloud Platform project ID
// TODO: Fix Me!!
const projectId = '******************';

// Instantiates a client
const translate = new Translate({
  projectId: projectId,
});
const target = 'en';

module.exports = {
  translateText: translateText
}

async function translateText(text){
  console.log('translate start');
  const translatedText = await translate
  .translate(text, target)
  .then(results => {
    const translation = results[0];
    return translation;
  })
  .catch(err => {
    console.log(err);
    return ""
  });
  return translatedText
}
