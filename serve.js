/*
 * serve the uploaded image
 */
var express = require('express');
var app = express();
app.get('/image.png', function (req, res) {
    res.sendfile(path.resolve('./uploads/image.png'));
});