var express=require('express');
var http = require('http');
var url = require('url');
var path = require('path');
var querystring = require('querystring');
var crypto = require('crypto')
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
				console.log('Error in getting details of file\n');	
				res.status(500).send("Error in getting details of the file" );
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


/** This will add the users in the table, with whom the file has to be shared
	request parameter will contain file name, loggedInUser and the name of the user with whom you want to share
	*/
app.post('/updateSharedUsers', function (request,response){
	connection = createNewConnection();
    "use strict";
    var jsonData = request.body;
	var jsonDataOutput;
	jsonDataOutput = { post: [] };	
	
	fileName = jsonData.filename;
	loggedInUser = jsonData.loggedUserName;
	userName = jsonData.username;
	console.log("File Name is: " + fileName);
	console.log("LoggedIn user is: " + loggedInUser);
	console.log("Username with whom you want to share: " + userName);
	
	//check if the user with whom you want to share have an account in this application
	connection.query('SELECT count(*) AS total from userinformation where username = "' + userName + '"' , function(err, rows, fields){
		if(!err && rows[0].total == 1){
			console.log("UserName found in database");	
			connection.query('SELECT usersSharedWith from filedetails where filename = "' + fileName + '" AND fileowner = "' + loggedInUser + '"', function(err, rows, fields){
							
  			if (!err){
   				var userList= rows[0].usersSharedWith;
    			console.log('The existing userList is: ', userList);
				if(userList == null || userList == ""){
				// if no one is in shared list
				// TODO: Investigate if an entry is required in database for non shared files or not. One way to get details of file is by querying S3
				//Initially (when file is not shared with anyone) "null" will be written in database for each file.
					var query = connection.query('update filedetails SET usersSharedWith = ";'+ userName +'" where filename = "' + fileName +'" AND fileowner = "' + loggedInUser + '"' , 	function(err, rows,fields) {
									
  						if(err){
							console.log("Error in updating first shared user for the file: " + fileName + " " + err.message);
							response.status(500).send('Error in updating first shared user for the file');
    					}else{
     						console.log('successfully added the first shared user for the file ' + fileName);
							jsonDataOutput.post.push({message:'successfully added the first shared user.'});
					 		response.status(200).send(JSON.stringify(jsonDataOutput));
						}
					});
				}else{
				// already there are some users in the shared list
					pattern1 = ';' + userName + ';' ;
					pattern2 = userName + ';' ;
					pattern3 = ';' + userName;
					
					if(userList.indexOf(pattern1) > -1 || userList.indexOf(pattern2) > -1 || userList.indexOf(pattern3) > -1) {
						console.log('User already exists in shared list of users');
						response.status(500).send("User already exists in shared list of users");
					}else{
						userList1 = userList + pattern3;
						var query = connection.query('update filedetails SET usersSharedWith = "'+ userList1 +'" where filename = "' + fileName +'" AND fileowner = "' + loggedInUser + '"', function(err, rows,fields) {
										console.log("This is being printed in update file details else method.");
  						if(err){
							console.log("Error while adding a user in the existing shared list of users " + err.message);
							response.status(500).send('Error while adding a user in the existing shared list of users');
    					}else{
     						console.log('successfully added username to existing shared list users');
							jsonDataOutput.post.push({message:'successfully added username to existing shared list users'});
							//response.write(JSON.stringify(jsonDataOutput));
							//response.end();	
							response.status(200).send(JSON.stringify(jsonDataOutput));	
									
						}
						});
					}
				}
				//console.log(JSON.stringify(jsonDataOutput));
       			//response.write(JSON.stringify(jsonDataOutput));
				//connection.end();
        		//response.end();			
			}
  			else{
    			console.log('Error while getting existing list of shared users for file: ' + fileName);
			}
			//connection.end();
        	//response.end();	
	});	

		}else{
			if(err){
				console.log("Error occured while checking if the shared user has account: " + err.message);
				response.status(500).send("Error while checking if the shared user has account");
				connection.end();
        		response.end();	
			}else{
				console.log("Username " + userName + " don't have account in application");	
				response.status(404).send( "Username " + userName + " don't have account in application" );
				connection.end();
        		response.end();	
			}	
		}
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
				res.status(500).send({ message: "Error in getting link of the file" });
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



/** This will generate unique URL of a particular file
	req parameter will contain logged User Name and the filename for which the details are to be fetched
	*/
app.post('/generateUrl',function(req,res){
	 	console.log('doing generate URL');
	 
		var jsonDataInput = req.body;
		var fileName = jsonDataInput.filename;
		var loggedUserName = jsonDataInput.loggedUserName;
		var identityString = loggedUserName + fileName;
		console.log('Logged User: ' + loggedUserName + ' filename : ' + fileName);
	
    	var jsonData;
   		jsonData = { post: [] };
		
		
	var shasum = crypto.createHash('sha1');
	shasum.update(identityString);
	var hashString = shasum.digest('hex')
	console.log(hashString);
					
	jsonData.post.push({ url : hashString});
	res.write(JSON.stringify(jsonData));
	res.end();
					
}); 


