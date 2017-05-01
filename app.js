/**
 * Module dependencies.
 */

var logger = require('koa-logger');
var serve = require('koa-static');
var parse = require('co-busboy');
var koa = require('koa');
var fs = require('fs');
var app = new koa();
var os = require('os');
var path = require('path');
var uploadsPath = path.join(__dirname, 'uploads')

// log requests

app.use(logger());

// custom 404

app.use(async (ctx, next) => {
  await next();
  if (this.body || !this.idempotent) return;
  this.redirect('/404.html');
});

// serve files from ./public

app.use(serve(path.join(__dirname, '/public')));

// handle uploads

app.use(async function (ctx, next) {
  // ignore non-POSTs
  if ('POST' != this.method) return await next();

  // multipart upload
  var parts = parse(this);
  var part;

  while ((part = await parts() )) {
    var stream = fs.createWriteStream(path.join(uploadsPath, Math.random().toString()));
    part.pipe(stream);
    console.log('uploading %s -> %s', part.filename, stream.path);
  }

  this.redirect('/');
});

// listen

app.listen(3000, '0.0.0.0', function () {
  console.log('Example app listening on port 3000!')
});
