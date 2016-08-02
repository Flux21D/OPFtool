var path = require('path'); //File System
fs=require('fs'); //FileSystem
var argv=require('optimist').argv; //Arguments
var writetofile=require('./libs/writetofile'); //file writer
var readfile=require('./libs/readfile'); //file read
var cheerio=require('cheerio');
var underscore=require('./libs/underscore.js'); 
var input = argv.i;
var gr = argv.g;
var v = argv.v;
var t = argv.t;
var ID = argv.ID;
var L = argv.l;
var C = argv.c;
var P = argv.p;
var R = argv.r;
var audio = argv.a;
var O = argv.o;

var guideRequired = false;
var audioBook = false;
var version = '3.0';
var title = "Title";
var isbn = "ISBN";
var language = "en-US";
var creator = "creator";
var publisher = "publisher";
var rights = "Rights";
var orientation = "auto";

if(v){
	version = v + '.0';
}
if(t){
	title = t;
}
if(ID){
	isbn = ID;
}
if(L){
	language = L;
}
if(C){
	creator = C;
}
if(P){
	publisher = P;
}
if(R){
	rights = R;
}
if(O){
	orientation = O;
}

if(gr == true){
	guideRequired = true;
}
if(audio == true){
	audioBook = true;
}

/* Global Variable */
var i=0;
var maniFestTag = '<manifest>';
var spineTag = '<spine toc="ncx">';
var metadata = '<?xml version="1.0" encoding="UTF-8"?>' + '\n' + '<package xmlns="http://www.idpf.org/2007/opf" version="' + version + '" unique-identifier="bookid">';
var guideTag = '';
var TitleLevelerrorLog = '';
var coverImageFound = false;
var smilFileFound = false;
var coverfileFound = false;
var backcoverfileFound = false;
var htmlpageIDArray = [];

Traverse_TitleWise_Folder(input); //Starting Function 

/* Read input Folder and if OEBPS Folder found then pass the Folder Path to next function (Traverse_OEBPS_Folders()) */
function Traverse_TitleWise_Folder(startPath){
	
	//If given path not exist script will stop with error Log 
	if(!fs.existsSync(startPath)){
		return
	}
	
	// Read the given input folder
	var files = fs.readdirSync(startPath);
	
	// Loop the files/folders within the input folder
	for(var f=0; f<files.length; f++){
		
		var filename = path.join(startPath,files[f]);
		var stat = fs.lstatSync(filename);
		
		// If Directory founded inside the root folder
		if(stat.isDirectory()){
			
			// If OEBPS folder founded in the title level folder
			if(files[f] == "OEBPS"){
				
				Traverse_OEBPS_Folders(files[f],filename,filename); //Send the OEBPS folder sent to this function				
				spineUpdate(); //Function to update the Spine Tag
				
				metaDataUpdate(); //MetaData Update Function 
				
				//"cover.jpg" or "frontcover.jpg" not found in the OEBPS folder
				if(!coverImageFound){
					TitleLevelerrorLog = TitleLevelerrorLog + '\n' + ' cover image file not found in the input OEBPS Folder "' + filename.toString().replace(input + '\\','').replace('\\' + files[f],'') + '"';
				}
				
				maniFestTag = maniFestTag + '\n' + '<\/manifest>\n';
				if(backcoverfileFound){
					spineTag = spineTag + '\n' + '<itemref idref="' + 'backcover-html' + '" linear="yes"/>';
				}
				spineTag = spineTag + '\n' + '<\/spine>'
				opfContent = metadata + '\n' + maniFestTag + spineTag + '\n' + guideTag + '\n</package>';
				
				fs.writeFileSync(filename + '\\content.opf',opfContent); //Write the OPF file
				fs.writeFileSync(input + '\\TitleLevel_Error_Log' + filename.toString().replace(input + '\\','').replace('\\' + files[f],'') + '.txt',TitleLevelerrorLog); //Write the Title Level Error Log

			}
			else{
				Traverse_TitleWise_Folder(filename); // Loop the function once again if OEBPS Folder not found
			}
		}
	}
}

/* Read OEBPS Folder and pass the Folder Path to next function (FileChecking()) */
function Traverse_OEBPS_Folders(file,filePath,OEBPSFolder){
	
	//If given path not exist script will stop with error Log 
	if(!fs.existsSync(filePath)){
		return
	}
	
	// Read the given OEBPS folder
	var files = fs.readdirSync(filePath);
	
	// Loop the files/folders within the OEBPS folder
	for(var f=0; f<files.length; f++){
		var filename = path.join(filePath,files[f]);
		var stat = fs.lstatSync(filename);
		
		//If Directory founded inside the OEBPS folder 
		if(stat.isDirectory()){
			Traverse_OEBPS_Folders(files[f],filename,OEBPSFolder);
		}
		else{
			//If "cover.jpg" or "frontcover.jpg" not found in the OEBPSFolder
			if(files[f].toString() == 'cover.jpg' || files[f].toString() == 'frontcover.jpg'){
				coverImageFound = true;
			}
			FileChecking(files[f],filename,OEBPSFolder); //Sent all the files within OEBPS folder to this Function
		}
	}
}


/* Read all the files and pass the attributes value to next function (itemTag()) */
function FileChecking(file,filePath,OEBPSFolder){
	i++;
	
	//File Path Defining
	if(filePath.toString().replace(OEBPSFolder + '\\','').replace(/\\/g,'/') == file){
		href = filePath.toString().replace(OEBPSFolder + '\\','').replace(/\\/g,'/');
	}
	else{
		href = filePath.toString().replace(OEBPSFolder + '\\','').replace(/\\/g,'/');
	}
	
	//If File name has the extension of ".ncx"
	if(file.toString().indexOf('.ncx')>0){
		itemTag('ncx-' + i,href,'application/x-dtbncx+xml','',false,false);
	}
	
	//If File name has the extension of ".css"
	else if(file.toString().indexOf('.css')>0){
		itemTag('css-' + i,href,'text/css','',false,false);
	}
	
	//If File name has the extension of ".mp3"
	else if(file.toString().indexOf('.mp3')>0){
		itemTag('audio-' + i,href,'audio/mpeg','',false,false);
	}
	
	//If File name has the extension of ".otf"
	else if(file.toString().indexOf('.otf')>0){
		itemTag('font-' + i,href,'application/opentype','',false,false);
	}
	
	//If File name has the extension of ".ttf"
	else if(file.toString().indexOf('.ttf')>0){
		itemTag('font-' + i,href,'application/truetype','',false,false);
	}
	
	//If File name has the extension of ".jpg"
	else if(file.toString().indexOf('.jpg')>0){
		
		//If File name has the extension of "cover.jpg"
		if(file == 'cover.jpg' && file == 'frontcover.jpg'){
			itemTag('cover-image',href,'image/jpeg','',false,false);
		}
		else {
			itemTag('image' + i,href,'image/jpeg','',false,false);
		}
	}
	
	//If File name has the extension of ".png"
	else if(file.toString().indexOf('.png')>0){
		
		//If File name has the extension of "cover.png"
		if(file == 'cover.png' && file == 'frontcover.png'){
			itemTag('cover-image',href,'image/png','',false,false);
		}
		else {
			itemTag('image-' + i,href,'image/png','',false,false);
		}
	}
	
	//If File name has the extension of ".html" or ".xhtml"
	else if((file.toString().indexOf('.html')>0)){
		
		//Find the nav.html file and update in the manifest
		if(file == 'nav.html'){
			itemTag('nav-1',href,'application/html+xml','',false,true)
		}
		
		//Find the cover.html file and update in the manifest
		else if(file == 'cover.html' || file == 'frontcover.html'){
			Finding_Page_Wise_Smil_File(OEBPSFolder,file); //Function declared to find the smil file for each html file.
			coverfileFound = true;
			if(smilFileFound){
				itemTag('cover-html',href,'application/html+xml','cover-smil',true,false);
			}
			else{
				itemTag('cover-html',href,'application/html+xml','',false,false)
			}
			if(guideRequired == true){
				guideTag = guideTag + '\n' + '<guide>\n<reference type="cover" title="cover" href="' + href + '"/>' + '\n</guide>';
			}
			else{
				guideTag = '';
			}
		}
		//Find the backcover.html file and update in the manifest
		else if(file == 'backcover.html' || file == 'back_cover.html'){
			Finding_Page_Wise_Smil_File(OEBPSFolder,file); //Function declared to find the smil file for each html file.
			backcoverfileFound = true;
			if(smilFileFound){
				itemTag('backcover-html',href,'application/html+xml','backcover-smil',true,false);
			}
			else{
				itemTag('backcover-html',href,'application/html+xml','',false,false)
			}
		}
		
		//other HTML files
		else{
			Finding_Page_Wise_Smil_File(OEBPSFolder,file); //Function declared to find the smil file for each html file.
			htmlPageID(file,href,OEBPSFolder,'html'); //Function to check the html files and update in the manifest
		}
	}

	//If File name has the extension of ".xhtml"
	else if((file.toString().indexOf('.xhtml')>0)){
		
		//Find the nav.html file and update in the manifest
		if(file == 'nav.xhtml'){
			itemTag('nav-1',href,'application/xhtml+xml','',false,true)
		}
		
		//Find the cover.html file and update in the manifest
		else if(file == 'cover.xhtml' || file == 'frontcover.xhtml'){
			Finding_Page_Wise_Smil_File(OEBPSFolder,file); //Function declared to find the smil file for each html file.
			coverfileFound = true;
			if(smilFileFound){
				itemTag('cover-html',href,'application/xhtml+xml','cover-smil',true,false);
			}
			else{
				itemTag('cover-html',href,'application/xhtml+xml','',false,false)
			}
			if(guideRequired == 1 || guideRequired == '1'){
				guideTag = guideTag + '\n' + '<guide>\n<reference type="cover" title="cover" href="' + href + '"/>' + '</guide>';
			}
			else{
				guideTag = '';
			}
		}
		//Find the backcover.html file and update in the manifest
		else if(file == 'backcover.xhtml'){
			Finding_Page_Wise_Smil_File(OEBPSFolder,file); //Function declared to find the smil file for each html file.
			backcoverfileFound = true;
			if(smilFileFound){
				itemTag('backcover-html',href,'application/xhtml+xml','backcover-smil',true,false);
			}
			else{
				itemTag('backcover-html',href,'application/xhtml+xml','',false,false)
			}
		}
		
		//other HTML files
		else{
			Finding_Page_Wise_Smil_File(OEBPSFolder,file); //Function declared to find the smil file for each html file.
			htmlPageID(file,href,OEBPSFolder,'xhtml'); //Function to check the html files and update in the manifest
		}
	}
	
	else if(file.toString().indexOf('.smil')>0){
		if(file == 'cover.smil' || file == 'frontcover.smil'){
			itemTag('cover-smil',href,'application/xhtml+xml','',false,false)
		}
		else if(file == 'backcover.smil'){
			itemTag('backcover-smil',href,'application/xhtml+xml','',false,false)
		}
		else{
			smilPageID(file,href,OEBPSFolder); //Function to check the smil file and update in the manifest
		}
	}
}

// Function to check the OEBPSFolder, whether the file name of HTML and file name of SMIL files are same
function Finding_Page_Wise_Smil_File(startPath,htmlfileName){
	var smilPath = "";
	if(!fs.existsSync(startPath)){
		return
	}
	
	var files = fs.readdirSync(startPath);
	for(var f=0; f<files.length; f++){
		var filename = path.join(startPath,files[f]);
		var stat = fs.lstatSync(filename);
		if(stat.isDirectory()){
			Finding_Page_Wise_Smil_File(filename,htmlfileName);
		}
		else{
			if(files[f].toString().replace('.smil','') == htmlfileName.toString().replace('.html','').replace('.xhtml','')){
				smilFileFound = true;
			}
			else{
			}
		}
	}
}

// Function to check the pageID and update the HTML files into the manifest of OPF file
function htmlPageID(htmlFile,href,OEBPSFolder,extension){
	var pageNumber = htmlFile.toString().replace('page','').replace('.html','').replace('.xhtml','');
	var pageID = null;
	//Finding the single digit page HTML Files 1-9
	if(pageNumber<10){
		if(pageNumber == pageNumber.toString().match(/[0-9]/g)){
			pageID = 'page00' + pageNumber;
		}
		else if(pageNumber.toString().match(/^00/g)){
			pageID = 'page' + pageNumber;
		}
		else{
			TitleLevelerrorLog = TitleLevelerrorLog + '\n' + 'Correct Format of Page HTML file not found in the input OEBPS Folder "' + OEBPSFolder.toString().replace(input + '\\','').replace('OEBPS','') + '" on ' + htmlFile + '\n';
		}
	}

	//Finding the single digit page HTML Files 10-99
	else if(pageNumber>10 && pageNumber<100){
		if(pageNumber == pageNumber.toString().match(/[0-9]+/g)){
			pageID = 'page0' + pageNumber;
		}
		else if(pageNumber.toString().match(/^0/g)){
			pageID = 'page' + pageNumber;
		}
		else{
			TitleLevelerrorLog = TitleLevelerrorLog + '\n' + 'Correct Format of Page HTML file not found in the input OEBPS Folder "' + OEBPSFolder.toString().replace(input + '\\','').replace('OEBPS','') + '" on ' + htmlFile + '\n';
		}
	}

	//Finding the single digit page HTML Files 100-999
	else if(pageNumber>=100){
		if(pageNumber == pageNumber.toString().match(/[0-9]+/g)){
			pageID = 'page' + pageNumber;
		}
		else{
			TitleLevelerrorLog = TitleLevelerrorLog + '\n' + 'Correct Format of Page HTML file not found in the input OEBPS Folder "' + OEBPSFolder.toString().replace(input + '\\','').replace('OEBPS','') + '" on ' + htmlFile + '\n';
		}
	}
	//Finding the single digit page not matching the script requirement
	else{
		TitleLevelerrorLog = TitleLevelerrorLog + '\n' + 'Correct Format of Page HTML file not found in the input OEBPS Folder "' + OEBPSFolder.toString().replace(input + '\\','').replace('OEBPS','') + '" on ' + htmlFile + '\n';
	}

	if(pageID!=null){
		//Audio pages
		if(smilFileFound){
			itemTag(pageID,href,'application/' + extension + '+xml','smil-' + pageID.toString().replace('page',''),true,false);
		}
		//Without Audio pages
		else{
			itemTag(pageID,href,'application/xhtml+xml','',false,false)
		}
		htmlpageIDArray.push(pageID);
	}
}

// Function to check the pageID and update the Smil files into the manifest of OPF file
function smilPageID(smilFile,href,OEBPSFolder){
	
	var pageNumber = smilFile.toString().replace('page','').replace('.smil','');
	var pageID = null;

		if(pageNumber<10){
			if(pageNumber == pageNumber.toString().match(/[0-9]/g)){
				pageID = 'page00' + pageNumber;
			}
			else if(pageNumber.toString().match(/^00/g)){
				pageID = 'page' + pageNumber;
			}
			else{
				TitleLevelerrorLog = TitleLevelerrorLog + '\n' + 'Correct Format of Page smil file not found in the input OEBPS Folder "' + OEBPSFolder.toString().replace(input + '\\','').replace('OEBPS','') + '" on ' + smilFile + '\n';
			}
		}
		else if(pageNumber>10 && pageNumber<100){
			if(pageNumber == pageNumber.toString().match(/[0-9]+/g)){
				pageID = 'page0' + pageNumber;
			}
			else if(pageNumber.toString().match(/^0/g)){
				pageID = 'page' + pageNumber;
			}
			else{
				TitleLevelerrorLog = TitleLevelerrorLog + '\n' + 'Correct Format of Page smil file not found in the input OEBPS Folder "' + OEBPSFolder.toString().replace(input + '\\','').replace('OEBPS','') + '" on ' + smilFile + '\n';
			}
		}
		else if(pageNumber>100){
			if(pageNumber == pageNumber.toString().match(/[0-9]+/g)){
				pageID = 'page' + pageNumber;
			}
			else{
				TitleLevelerrorLog = TitleLevelerrorLog + '\n' + 'Correct Format of Page smil file not found in the input OEBPS Folder "' + OEBPSFolder.toString().replace(input + '\\','').replace('OEBPS','') + '" on ' + smilFile + '\n';
			}
		}
		else{
			TitleLevelerrorLog = TitleLevelerrorLog + '\n' + 'Correct Format of Page smil file not found in the input OEBPS Folder "' + OEBPSFolder.toString().replace(input + '\\','').replace('OEBPS','') + '" on ' + smilFile + '\n';
		}
	
	
	if(pageID!=null){
		itemTag('smil-' + pageID.toString().replace('page',''),href,'application/smil+xml','',false,false);
	}
}

/* Item Tag Attributes Update */
function itemTag(id,href,mediaType,mediaOverlay,mediaOverlayFound,propertiesFound){
	if(mediaOverlayFound == true && propertiesFound == false){
		maniFestTag = maniFestTag + '\n' + '<item id="' + id + '" href="' + href + '" media-type="' + mediaType + '" media-overlay="' + mediaOverlay + '"/>';
	}
	if(propertiesFound == true && mediaOverlayFound == false){
		maniFestTag = maniFestTag + '\n' + '<item id="' + id + '" href="' + href + '" media-type="' + mediaType + '" properties="' + 'nav' + '"/>';
	}
	if(mediaOverlayFound == false && propertiesFound == false){
		maniFestTag = maniFestTag + '\n' + '<item id="' + id + '" href="' + href + '" media-type="' + mediaType + '"/>';
	}
}


// Spine Section update
function spineUpdate(){
	
	if(coverfileFound){
		spineTag = spineTag + '\n' + '<itemref idref="' + 'cover-html' + '" linear="yes"/>';
		
	}
	htmlpageIDArray.sort();
	for(var id=0;id<htmlpageIDArray.length; id++){
		spineTag = spineTag + '\n' + '<itemref idref="' + htmlpageIDArray[id] + '" linear="yes"/>';
	}
}

//Meta data update
function metaDataUpdate(){
	
	metadata = metadata + '\n' + '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" >';
	metadata = metadata + '\n' + '<dc:title>' + title + '</dc:title>';
	metadata = metadata + '\n' + '<dc:identifier id="bookid">' + isbn + '</dc:identifier>'
	metadata = metadata + '\n' + '<dc:creator>' + creator + '</dc:creator>'
	metadata = metadata + '\n' + '<dc:publisher>' + publisher + '</dc:publisher>'
	metadata = metadata + '\n' + '<dc:rights>' + rights + '</dc:rights>'
	metadata = metadata + '\n' + '<dc:language>' + language + '</dc:language>';
	metadata = metadata + '\n' + '<meta property="rendition:layout">pre-paginated</meta>'
	metadata = metadata + '\n' + '<meta property="rendition:orientation">' + orientation + '</meta>'
	metadata = metadata + '\n' + '<meta property="rendition:spread">both</meta>'
	metadata = metadata + '\n' + '<meta name="cover" content="cover-image"/>';
	if(audioBook == true){
		metadata = metadata + '\n' + '<meta property="media:active-class">-epub-media-overlay-active</meta>' + '\n' + '</metadata>';
	}
	else{
		metadata = metadata + '\n' + '</metadata>';
	}
}