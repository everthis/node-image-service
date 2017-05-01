var path = require('path');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.post('/upload', function (req, res) {
    var tempPath = req.files.file.path,
        targetPath = path.resolve('./uploads/image.png');
    if (path.extname(req.files.file.name).toLowerCase() === '.png') {
        fs.rename(tempPath, targetPath, function(err) {
            if (err) throw err;
            console.log("Upload completed!");
        });
    } else {
        fs.unlink(tempPath, function () {
            if (err) throw err;
            console.error("Only .png files are allowed!");
        });
    }
});

app.use(bodyParser({uploadDir:'/path/to/temporary/directory/to/store/uploaded/files'}));

app.get('/', function (req, res) {
  res.send('Hello World!')
})
var staticPath = path.join(__dirname, '/public');
app.use(express.static(staticPath));

app.listen(3000, '0.0.0.0', function () {
  console.log('Example app listening on port 3000!')
})


