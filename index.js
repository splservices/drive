
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const { google } = require('googleapis');
const drive = google.drive('v3');
const key = require('./private_key.json');
const path = require('path');
const fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key, ["https://www.googleapis.com/auth/drive"],
    null
  );
  jwtClient.authorize((authErr) => {
    if (authErr) {
      console.log("error : " + authErr);
      return;
    } else {
      console.log("Authorization accorded");
    }
  });

app.get('/files',(req, res)=>{
    var parents = "1DN2QZOtnggk7M0nlnA0vTA0OldfRYx3e" //folder ID
    drive.files.list({

        auth: jwtClient,
        pageSize: 10,
        q: "'" + parents + "' in parents and trashed=false",
        fields: 'files(id, name)',
    }, (err, response) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = response.data.files;
        if (files.length) {
        console.log('Files:');
        files.map((file) => {
            console.log(`${file.name} (${file.id})`);
        });
        res.send(files)
        } else {
        console.log('No files found.');
        }
    });
})

app.post('/file', (req, res)=>{
    // upload file in specific folder
    var folderId = "enter here the folder you target";
    var fileMetadata = {
    'name': 'text.txt',
    parents: [folderId]
    };
    var media = {
    mimeType: 'text/plain',
    body: fs.createReadStream(path.join(__dirname, './text.txt'))
    };
    drive.files.create({
    auth: jwtClient,
    resource: fileMetadata,
    media: media,
    fields: 'id'
    }, function(err, file) {
    if (err) {
        // Handle error
        console.error(err);
    } else {
        console.log('File Id: ', file.id);
    }
    });
})

  app.listen(3000, ()=>{
      console.log(`Server is running at 3000`)
  })