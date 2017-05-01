let path = require('path');
let Koa = require('koa');
let fs = require('fs');
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
			file.publicFileName = path.basename(file.path);
		}
	}
});

function res() {
	return function(fbd, status, msg) {
		defaultRes.status = defaultRes.status === 'error' ? 'error' : status;
		if(msg) defaultRes.message.push(msg);
		if(fbd.publicFileName) defaultRes.data.url = fbd.publicFileName;
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
	return resCb(fbd, 'sucess');
}

router.post('/upload', koaBodyMW,
  (ctx, next) => {
    console.log(ctx.request.body);
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
