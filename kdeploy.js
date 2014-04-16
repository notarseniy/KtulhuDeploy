/* KtulhuDeploy by Kern0 (Arseniy Maximov <localhost@kern0.ru>
 * Licensed under MIT License:
  The MIT License (MIT)

  Copyright (c) 2014 Arseniy Maximov <localhost@kern0.ru> (http://kern0.ru)

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
 *
 * GitHub: https://github.com/Kern0/KtulhuDeploy
 */

var express = require('express'),
	http = require('http'),
	path = require('path'),
	_ = require('underscore'),
	range_check = require('range_check'),
	request = require('request');

var execFile = require('child_process').execFile;

var cfg = require('./config.js');
global.cfg = cfg;



var app = express();

// all environments
app.set('port', cfg.port);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('*', function (req, res) {
	return res.json(404, {
		message: 'Not Found',
		status: 404
	});
});

app.post('*', function (req, res) {
	if (req.body.payload || req.body.ref) {
		request({
			url: 'https://api.github.com/meta',
			headers: {
				'User-Agent': 'KtulhuDeploy'
			}
		}, function (err, response, body) {
			if (!err && response.statusCode == 200) {
				var ipHeader = req.headers['x-real-ip'] || req.ip || '127.0.0.1',
					ip = (ipHeader !== '127.0.0.1') ? ipHeader.split(',')[0] : ipHeader,
					responseJson = JSON.parse(body);

				//console.log(ip, ipHeader, req.headers);

				responseJson.hooks.push('127.0.0.0/8');

				if (range_check.in_range(ip, responseJson.hooks)) {
					var payload;
					if (req.body.payload) {
						payload = JSON.parse(req.body.payload);
					} else {
						payload = req.body;
					}

					var repoName = payload.repository.name.toLowerCase(),
						origRepoName = payload.repository.name;

					if (_.contains(cfg.applications.enabled, origRepoName) && 'refs/heads/' + cfg.applications[origRepoName].repo_branch === payload.ref) {
						execFile(cfg.applications[origRepoName].execute, {
							cwd: cfg.applications[origRepoName].directory
						}, function (err, stdout, stderr) {
							if (err) {
								if (err.code === 'EACCES') {
									return res.json(500, {
										message: 'We don\'t have rights for executing: EACCES',
										status: 500
									});
								}
								if (err.code === 1) {
									console.log('[ERROR][' + repoName + '] Script exited with error code: 1. Stderr:\n', stderr, '\n');
									return res.json(500, {
										message: 'Script exited with error code: 1',
										status: 500
									});
								}
								throw err;
							}

							console.log('[DEPLOY][' + repoName + 'Successfully deployed to server.');
							res.json({
								message: 'Successfully deployed ' + repoName + ' to server.',
								status: 200
							});
						});
					} else if (!(_.contains(cfg.applications.enabled, origRepoName))) {
						return res.json(400, {
							message: 'Wrong repository',
							status: 400
						});
					} else if (!('refs/heads/' + cfg.applications[origRepoName].repo_branch === payload.ref)) {
						return res.json(400, {
							message: 'Wrong branch',
							status: 400
						});
					} else {
						return res.json(400, {
							message: 'Wrong request',
							status: 400
						});
					}
				} else {
					res.json(403, {
						message: 'Access denied',
						status: 400
					});
				}
			}
		});
	} else {
		return res.json(400, {
			message: 'Wrong request',
			status: 400
		});
	}
});

http.createServer(app).listen(app.get('port'), function () {
	console.log('[START] Started at ' + app.get('port') + ' port');
});
