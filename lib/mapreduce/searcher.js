var stopwords = require('natural').stopwords;
var simpleOneTokenSearch = require('./simpleOneTokenSearch.js');
var fullSearch = require('./fullSearch.js');

exports.search = function (reverseIndex, docFreqIndex, q, callback) {

  var cleanQuery = {};
  var canSearch = true;
  var singleTokenNoNavs = false;

  //remove stopwords
  cleanQuery['query'] = [];
  for (k = 0; k < q['query'].length; k++) {
    if (stopwords.indexOf(q['query'][k]) == -1) {
      cleanQuery['query'].push(q['query'][k]);
    }
  }
  if (cleanQuery['query'].length === 0) {
    canSearch = false;
  }

  //Check document frequencies
  var mostFrequent = {}; mostFrequent['value'] = 0;
  var leastFrequent = {}; leastFrequent['value'] = 0;
  var docFreq = function (qa, i) {
    docFreqIndex.get(qa[i], function (err, value) {
      if (value < leastFrequent['value'])
        leastFrequent['value'] = value;
      else if (value > mostFrequent['value'])
        mostFrequent['value'] = value;
      if (++i < qa.length)
        docFreq(qa, i);
    });
  }
  docFreq(cleanQuery['query'], 0);

  //Check for single token no navs query
  if ((cleanQuery['query'].length == 1) && (!q['navs'])) {
    var singleTokenNoNavs = true;
  }


  if (singleTokenNoNavs) {
    simpleOneTokenSearch.search(reverseIndex, docFreqIndex, q, cleanQuery, function(msg) {
      callback(msg);
    });
  }
  else {
    fullSearch.search(reverseIndex, docFreqIndex, q, function(msg) {
      callback(msg);
    });
  }
};
