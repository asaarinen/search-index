var fs = require('fs'),
level = require('level'),
indexPeek = require('./indexing/indexPeek.js'),
Matcher = require('./matchers/matcher.js').Matcher,
calibrater = require('./indexing/calibrater.js'),
indexer = require('./indexing/indexer.js'),
searcher = require('./mapreduce/searcher.js');

exports.SearchIndex = function(path) {
    
    var retobj = {};

    var reverseIndex = level(path + 'si', {valueEncoding: 'json'});
    var docFreqIndex = level(path + 'df', {valueEncoding: 'json'});

    var matcher = Matcher(path);

    retobj.indexPeek = function(start, stop, callback) {
	indexPeek.indexPeek(start, stop, reverseIndex, function(msg) {
	    callback(msg);
	});
    };


    retobj.generateMatcher = function(callback) {
	matcher.generateMatcher(reverseIndex, function(msg) {
	    callback(msg);
	});
    }
    
    
    retobj.matcher = function(beginsWith, callback) {
	matcher.matcher(beginsWith, function(msg) {
	    callback(msg);
	});
    }


    retobj.calibrate = function(callback) {
	calibrater.calibrate(reverseIndex, docFreqIndex, function(msg) {
	    callback(msg);
	});
    };
    

    retobj.deleteDoc = function(docID, callback) {
	indexer.deleteDoc(reverseIndex, docID, function(msg) {
	    callback(msg);
	});
    };
    
    
    retobj.index = function(batchString, batchName, filters, callback) {
	indexer.index(reverseIndex, batchString, batchName, filters, function(msg) {
	    callback(msg);
	});
    };


    retobj.search = function (q, callback) {
	searcher.search(reverseIndex, docFreqIndex, q, function(msg){
	    callback(msg);
	});
    };
    
    return retobj;
}

