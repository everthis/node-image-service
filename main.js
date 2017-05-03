/*
 * node image service
 */
let path = require('path');
let Koa = require('koa');
let fs = require('fs');
let gm = require('gm');
let koaStatic = require('koa-static');
let Router = require('koa-router');
let koaBody = require('koa-body');

let uploadDir = path.join(__dirname, 'uploads');
let app = new Koa();
let router = new Router();

let defaultRes = {
	status: '',
	message: [],
	data: {}
};

let koaBodyMW = koaBody({
	multipart: true,
	formidable: {
		uploadDir,
		keepExtensions: true,
		onFileBegin: function(name, file) {
			file.dir = path.dirname(file.path);
			file.publicOriginal = path.basename(file.path);
			file.publicAvatar = file.publicOriginal.replace(/(\.[\w\d_-]+)$/i, '_thumbnail$1');
		}
	}
});

function res() {
	return function(fbd, status, msg) {
		defaultRes.status = defaultRes.status === 'error' ? 'error' : status;
		if(msg) defaultRes.message.push(msg);
		if(fbd.publicOriginal) defaultRes.data.original = fbd.publicOriginal;
		if(fbd.publicAvatar) defaultRes.data.thumbnail = fbd.publicAvatar;
		return defaultRes;
	}
}

function process(fbd) {
	let resCb = res();
	if (fbd.size === 0 || fbd.name === '') {
		fs.unlink(fbd.path);
		return resCb(fbd, 'error', 'no file input')
	}
	if ( ['image/jpeg', 'image/png'].indexOf(fbd.type) === -1 ) {
		return resCb(fbd, 'error', 'only jpeg/png allowed.')
	}
	gm(fbd.path)
	.resize(240, 240)
	.noProfile()
	.write(path.join(fbd.dir, fbd.publicAvatar), function (err) {
	  if (err) console.log(err);
	});
	return resCb(fbd, 'sucess');
}

router.post('/upload', koaBodyMW,
  (ctx, next) => {
    let bd = ctx.request.body;
    let fbd = bd.files.file;
    ctx.body = process(fbd);
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.use(koaStatic(path.join(__dirname, '/public')));

app.listen(3000, '0.0.0.0', function () {
  console.log('Example app listening on port 3000!')
});
