var express=require('express');
var http = require('http');
var url = require('url');
var path = require('path');
var querystring = require('querystring');
var mysql = require('mysql');
var fs = require('fs');
var bodyParser = require("body-parser");
var app = express();

function createNewConnection(){
	return mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '\'ruby\'',
  database : 'file_information'
});
}
 
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/fileSharing.html');
});
 
 
var server=app.listen(3000,function(){
console.log("We have started our server on port 3000");
});

/** This will fetch the details of a particular file
	req parameter will contain logged User Name and the filename for which the details are to be fetched
	*/
app.post('/fetch',function(req,res){
	 	console.log('doing fetch');
	 
		var jsonDataInput = req.body;
		var fileName = jsonDataInput.filename;
		var loggedUserName = jsonDataInput.loggedUserName;
		console.log('Logged User: ' + loggedUserName + ' filename : ' + fileName);
	
		connection = createNewConnection();
		
    	"use strict";
    	var jsonData;
   		jsonData = { post: [] };
		var dbSelectStmt = connection.query("SELECT filename, fileowner, creationdate, usersSharedWith FROM filedetails where filename = '" + 	fileName + "' AND fileowner = '" + loggedUserName + "'",function(err, rows, fields){
				if(err){
				console.log('Error\n');	
				}
				else{
					var row = rows[0];
					jsonData.post.push({ filename: row.filename, fileowner: row.fileowner, creationdate: row.creationdate, usersSharedWith: row.usersSharedWith });
					res.write(JSON.stringify(jsonData));
					console.log(JSON.stringify(jsonData));
					res.end();
					connection.end(); 
				}	
		});
}); 

app.post('/updateSharedUsers', function (request,response){
	connection = createNewConnection();
    "use strict";
    var jsonData = request.body;
	var jsonDataOutput;
	jsonDataOutput = { post: [] };	
	filenameToBeUpdated = jsonData.filename;
	console.log("File to be updated: " + filenameToBeUpdated);

	userList1 = jsonData.username;
	console.log("Username(s) to be added is: " + userList1);
	connection.query('SELECT Shared_Users from file_details where filename = "' + filenameToBeUpdated + '"', function(err, rows, fields) {
  		if (!err){
   			var userList= rows[0].Shared_Users;
    		console.log('The existing userList is: ', userList);
			if(userList == null){
				// TODO: Investigate if an entry is required in database for non shared files or not. One way to get details of file is by querying S3
				//Initially (when file is not shared with anyone) "null" will be written in database for each file.
				var query = connection.query('update file_details SET Shared_Users = "'+ userList1 +'" where filename = "' + filenameToBeUpdated +'"', 
				function(err, rows,fields) {
  				if(err){
					console.log(err.message);
					jsonDataOutput.post.push({message: 'error'});
    			}else{
     				 console.log('successfully added the first user.');
					 jsonDataOutput.post.push({message: 'successfully added the first user.'});
				}
				});
		
			}else{
			pattern1 = ';' + userList1 + ';' ;
			pattern2 = userList1 + ';' ;
			pattern3 = ';' + userList1;
		if(userList.indexOf(pattern1) > -1 || userList.indexOf(pattern2) > -1 || userList.indexOf(pattern3) > -1) {
			console.log("Pattern1: " + userList.indexOf(pattern1) + "Pattern2: " + userList.indexOf(pattern2)  + " Pattern3: " + userList.indexOf(pattern3));
			console.log('User already exists');
			jsonDataOutput.post.push({message: 'User already exists'});
		}else{
			console.log('No Match found');
			userList1 = userList + pattern3;
			var query = connection.query('update file_details SET Shared_Users = "'+ userList1 +'" where filename = "' + filenameToBeUpdated +'"', 
			function(err, rows,fields) {
  			if(err){
				console.log(err.message);
				jsonDataOutput.post.push({message: 'error'});
    		}else{
     			console.log('successfully added username to existing users');
				jsonDataOutput.post.push({message: 'successfully added username to existing users'});	
			}
		});
		}
			
	}
		console.log(JSON.stringify(jsonDataOutput));
       		response.write(JSON.stringify(jsonDataOutput));
			debugger;
			connection.end();
        	response.end();			
	}
  else
    console.log('Error while performing Query.');
});	

});

/** This will fetch the link of a particular file
	req parameter will contain logged User Name and the filename for which the details are to be fetched
	*/
app.post('/fetchLink',function(req,res){
	 	console.log('doing fetch Link');
	 
		var jsonDataInput = req.body;
		var fileName = jsonDataInput.filename;
		var loggedUserName = jsonDataInput.loggedUserName;
		console.log('Logged User: ' + loggedUserName + ' filename : ' + fileName);
	
		connection = createNewConnection();
		
    	"use strict";
    	var jsonData;
   		jsonData = { post: [] };
		var dbSelectStmt = connection.query("SELECT fileLink FROM filedetails where filename = '" + 	fileName + "' AND fileowner = '" + loggedUserName + "'",function(err, rows, fields){
				if(err){
				console.log('Error while getting Link of a file ' + fileName + '\n' );	
				}
				else{
					var row = rows[0];
					jsonData.post.push({ fileLink: row.fileLink});
					res.write(JSON.stringify(jsonData));
					console.log("File Link is: " + JSON.stringify(jsonData));
					res.end();
					connection.end(); 
				}	
		});
}); 