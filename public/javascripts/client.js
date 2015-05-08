
// This works on On CLick event of Get Details for a file
$(document).ready(function () {
		$('#GetDetails').click(function () {
        $.ajax({ url: 'fetch', type: 'POST',
            data: { filename: document.getElementById("nameOfFile").innerHTML,loggedUserName: document.getElementById("loggedUserName").innerHTML },
			//data: [{ filename: $('#filename').val(), username: $('#username').val()}],
            error: function (e, textStatus, errorThrown) {
                console.log('error is: ' + e.responseText, textStatus, '//', errorThrown);
				cosole.log('error occurred');
            },
            success: function (json) {
				var jsonData;
				try{
					jsonData = JSON.parse(json);
				} catch(err){
					console.log("Error parsing json." + err.message);
					console.log("Error message: " + err.message);	
				}
				var sharedUsers = $('#shared_users');
                var add;
                add = $('<div class="post"></div>');
                // SECURITY HOLE: Avoid posting raw HTML from record
                add.html('<b>FileName: </b> ' + jsonData.post[0].filename + '<br />'
                    + '<b>File Owner: </b> ' + jsonData.post[0].fileowner + '<br />'
					+ '<b>Creation Date: </b> ' + jsonData.post[0].creationdate + '<br />'
					+ '<b>Shared Users: </b> ' + jsonData.post[0].usersSharedWith + '<br />');
					console.log(add);
				sharedUsers.append(add);
            }});
			return false;
    });
	
});

/**This method will be called on click of Share file. 
Input Parameters : Filename,Username with whom to be shared, logged In User name
*/
$(document).ready(function () {
    $('#ShareFile').click(function () {
        $.ajax({ url: 'updateSharedUsers', type: 'POST', 
           data: { filename:  document.getElementById("filename").innerHTML, username: $('#username').val(), loggedUserName: document.getElementById("loggedUserName").innerHTML},
            error: function (e, textStatus, errorThrown) {
				console.log('error is: ' + e.responseText, textStatus, '//', errorThrown);
				var fileSharingResult = $('#FileSharingResult');
				add = $('<div class="post"></div>');
                // SECURITY HOLE: Avoid posting raw HTML from record
                add.html('<b>Error: </b> ' + e.responseText + '<br />');
				fileSharingResult.append(add);
            },
            success: function (json) {
				var jsonData;
				var fileSharingResult = $('#FileSharingResult');
				try{
					jsonData = JSON.parse(json);
				} catch(err){
					console.log("Error parsing json." + err.message);
					console.log("Error message: " + err.message);	
				}
				add = $('<div class="post"></div>');
                // SECURITY HOLE: Avoid posting raw HTML from record
                add.html('<b>Message: </b> ' + jsonData.post[0].message + '<br />');
				fileSharingResult.append(add);
				//console.log('data updated' + jsonData.post[0].message);
            }});
			
			return false;
    });
	
});

// This works on On CLick event of Get Link for a file
$(document).ready(function () {
    //$('#fileshare').submit(function () {
		$('#GetLink').click(function () {
        $.ajax({ url: 'fetchLink', type: 'POST',
            data: { filename: document.getElementById("nameOfFile").innerHTML,loggedUserName: document.getElementById("loggedUserName").innerHTML },
            error: function (e, textStatus, errorThrown) {
                console.log('error is: ' + e.responseText, textStatus, '//', errorThrown);
				cosole.log('error occurred');
            },
            success: function (json) {
				var jsonData;
				try{
					jsonData = JSON.parse(json);
				} catch(err){
					console.log("Error parsing json coming from server: " + err.message);
				}
				var sharedUsers = $('#shared_users');
                var add;
                add = $('<div class="post"></div>');
                // SECURITY HOLE: Avoid posting raw HTML from record
                add.html('<b>File Link: </b> ' + jsonData.post[0].fileLink + '<br />');
					console.log(add);
				sharedUsers.append(add);
            }});
			return false;
    });
	
});

// This works on On CLick event of Generate Unique URL for a file
$(document).ready(function () {
    //$('#fileshare').submit(function () {
		$('#GenerateURL').click(function () {
        $.ajax({ url: 'generateUrl', type: 'POST',
            data: { filename: document.getElementById("nameOfFile").innerHTML,loggedUserName: document.getElementById("loggedUserName").innerHTML },
            error: function (e, textStatus, errorThrown) {
                console.log('error is: ' + e.responseText, textStatus, '//', errorThrown);
				cosole.log('error occurred');
            },
            success: function (json) {
				var jsonData;
				try{
					jsonData = JSON.parse(json);
				} catch(err){
					console.log("Error parsing json coming from server: " + err.message);
				}
				var sharedUsers = $('#shared_users');
                var add;
                add = $('<div class="post"></div>');
                // SECURITY HOLE: Avoid posting raw HTML from record
                add.html('<b>URL: </b> ' + jsonData.post[0].url + '<br />');
					console.log(add);
				sharedUsers.append(add);
            }});
			return false;
    });
	
});


