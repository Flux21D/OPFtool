var path = require('path'); //File System
fs=require('fs'); //FileSystem
var argv=require('optimist').argv; //Arguments
var writetofile=require('./writetofile'); //file writer
var readfile=require('./readfile'); //file writer
var cheerio=require('cheerio');
var underscore=require('./underscore.js'); //file writer

module.exports = function(opfContent) {

	console.log(opfContent);

}