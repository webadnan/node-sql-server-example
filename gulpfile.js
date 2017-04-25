require("babel/register");
var gulp = require('gulp');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglifyjs');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var map = require('map-stream');
var request = require('request');
var http = require('http');
var fs = require('fs');
var through = require('through');
var Buffer = require('buffer').Buffer;
var spawn = require('child-proc').spawn;
var argv = require('yargs').argv; // for args parsing
var bodyParser = require('body-parser');
var xml2js = require('xml2js');
var Q = require('q');
var BabelCore = require("babel-core");
var READLINE = require('readline');
var chalk = require('chalk');
var ConnectToSqlServer = require('./server/connect-to-sqlserver.js')
var PmsDb = require('./server/util/pms-db.js')
var PmsCache = require('./server/util/pms-cache.js')
var PmsServer = require('./server/server.js');
var EventDispatcher = require('./server/util/event-dispatcher.js')
var _UUID_ = new Date().getTime();
var pmsServer = null;
/** @type {PmsDb} */
var db = null;
var isQueryMode = false;
var EXPRESS_PORT = 4000;
var EXPRESS_ROOT = __dirname;
var LIVERELOAD_PORT = 35729;

// Gulp Tasks
//        TASK-NAME      DEPENDENCIES                             FUNCTION
gulp.task('default', [], help);
gulp.task('prod', ['js', 'less', 'index-prod', 'jshint'], function () {
});
gulp.task('dev', ['js', 'less', 'index-dev', 'jshint'], function () {
});
gulp.task('watch-dev', ['js', 'less', 'index-dev', 'jshint'], doWatchDev);
gulp.task('watch-prod', ['js', 'less', 'index-prod', 'jshint'], doWatchProd);
gulp.task('js', doJs);
gulp.task('jshint', doJsHint);
gulp.task('less', doLess);
gulp.task('index-prod', doIndexProd);
gulp.task('index-dev', doIndexDev);
gulp.task('server', doServer);
gulp.task('query', doQuery);
gulp.task('test', doTest);
gulp.task('database-filter', doDatabaseFilter);

global.SUCCESS = {result: 'success'}
global.FAILURE = {result: 'failure'}

global.assert = function(flag, msg) {
    if (!flag) {
        throw new Error(msg)
    }
}

global._Promise = function(callback){
    var defer = Q.defer();
    callback(function(){
        defer.resolve.apply(null, arguments)
    }, function(){
        defer.reject.apply(null, arguments)
    })
    return defer.promise
}

global._Promise.all = Q.all

global.logger = function(msg) {
    return function(obj){
        if (obj) console.log(msg, obj)
        else console.log(msg)
    }
}

global._ = require('lodash')

//global.cache

global.globalEvents = new EventDispatcher()


function doWatchDev() {
    startExpress();
    startLivereload();
    gulp.watch(getRootFolder() + '/app/**/*.js').on('change', function (file) {
        doJsHint(file.path);
        doJs(file.path).on('end', doIndexDev);
    });
    gulp.watch([getRootFolder() + '/app/**/*.less'], ['less']);
    gulp.watch([getRootFolder() + '/**/*.html'], ['index-dev']);
    gulp.watch([getRootFolder() + '/index.html'], notifyLivereload);
}

function doWatchProd() {
    startExpress();
    startLivereload();
    gulp.watch(getRootFolder() + '/app/**/*.js', ['js', 'index-prod']).on('change', function (file) {
        doJsHint(file.path);
    });
    gulp.watch([getRootFolder() + '/app/**/*.less'], ['less']);
    gulp.watch([getRootFolder() + '/**/*.html'], ['index-prod']);
    gulp.watch([getRootFolder() + '/index.html'], notifyLivereload);
}

function help() {
    console.log('options:');
    console.log('--reload-server');
    console.log('--folder <path>');
}


newRequire = function (module) {
    if (argv.reloadServer || process.argv.indexOf('watch-dev') !== -1) {
        console.log('reloadServer is true');
        delete require.cache[require.resolve(module)];
    }
    return require(module);
}

function getRootFolder() {
    return argv.folder || 'website';
}

function getBuildFolder() {
    return 'build-dev';
}

// steps
// 1. connect to server
// 2. cache
// 3. start express server
function startExpress() {
    // 1. connect to server
    parseXml('connection-string.xml').then(function (xml) {
        new ConnectToSqlServer().connect(xml.user[0], xml.password[0], xml.server[0], xml.database[0], xml.port[0]).then(function(con) {
            db =  new PmsDb(con)
            if (isQueryMode) {
                startUserQuery();
            } else  {
                // 2. cache
                global.cache = new PmsCache(db)
                global.cache.load().then(_startExpress, logger('error on caching'))
            }
        }, logger('Error on reading connection string. Need a connection-string.xml file to read user, password, server, database and port.'))
    })

    // 3. start express server
    function _startExpress(){
        var express = require('express');
        var app = express();
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());
        app.use(apiProxy());
        app.use(require('connect-livereload')());
        app.use(express.static(EXPRESS_ROOT));
        app.listen(EXPRESS_PORT);
        console.log('Server starting at port: ' + EXPRESS_PORT);
        console.log('!!! DONE !!!')
        startUserQuery()
    }
}

function apiProxy() {
    return function (req, res, next) {
        if (req.url.match(new RegExp('^\/api\/test'))) {
            try {
                res.end(JSON.stringify(cloneObject(req, 0)));
            } catch (err) {
                next();
            }
        } else if (req.url.match(new RegExp('^\/api\/'))) {
            getPmsServer().route(req, res, next);
        } else {
            next();
        }
    }
}

function getPmsServer() {
    if (argv.reloadServer) {
        PmsServer = newRequire('./server/server.js');
        pmsServer = null;
    }

    if (!pmsServer) {
        pmsServer = new PmsServer(db);
    }

    return pmsServer;
}

function doServer() {
    startExpress();
    startLivereload();
}

function doJs(path) {
    var srcPath = getRootFolder() + '/app/**/*.js';
    if (typeof path === 'string'){
        srcPath = path;
    }

    return gulp.src(srcPath, {base: './' + getRootFolder()})
        .pipe(es6to5())
        //.pipe(ngAnnotate())
        //.pipe(uglify()) //{mangle: false}
        //.pipe(concat('app.min.js'))
        .pipe(gulp.dest(getRootFolder() + '/' + getBuildFolder()));
}

function doJsHint(path) {
    var srcPath = getRootFolder() + '/app/**/*.js';
    if (typeof path === 'string') {
        srcPath = path;
    }
    return gulp.src(srcPath)
        .pipe(jshint({esnext: true, asi: true, expr: true}))
        .pipe(jshint.reporter('jshint-stylish'));
}

function _ignoreError(err){
    console.log(err.toString());
    this.emit('end');
}

function doLess() {
    return gulp.src(getRootFolder() + '/app/less/styles.less')
        .pipe(less())
        .on('error', _ignoreError)
        .pipe(minifyCss({keepBreaks: true})) //{keepBreaks: true}
        .pipe(gulp.dest(getRootFolder() + '/' + getBuildFolder() + '/css'))
        .pipe(notifyStylesCss());
}

function es6to5() {
    return through(
        function write(data) {    // this will be called once for each file
            //console.log()
            var code = String(data.contents);
            try{
                code = BabelCore.transform(code).code;
            } catch (err) {
                console.log(err);
            }
            data.contents = new Buffer(code);
            this.emit('data', data)
        },
        function end() {    // this will be called when there are no more files
            this.emit('end')
        }
    )
}

function filterParams(line) {
    return line.replace(/@UUID/g, _UUID_);
}

function cloneObject(obj, level) {
    if (!obj) {
        return obj;
    }

    level = level || 0;
    if (level >= 5) {
        return 'more...';
    }

    try {
        if (obj instanceof Array) {
            return obj.map(function (e) {
                return cloneObject(e, level + 1);
            });
        } else if (typeof obj === 'string' || typeof obj === 'number') {
            return obj;
        } else {
            var newobj = {};
            for (var key in obj) {
                newobj[key] = cloneObject(obj[key], level + 1);
            }
            return newobj;
        }
    } catch (err) {
        return 'error';
    }
}

// We'll need a reference to the tinylr
// object to send notifications of file changes
// further down
var lr;
function startLivereload() {
    lr = require('tiny-lr')();
    lr.listen(LIVERELOAD_PORT);
}

// Notifies livereload of changes detected
// by `gulp.watch()`
function notifyLivereload(event) {
    // `gulp.watch()` events provide an absolute path
    // so we need to make it relative to the server root
    console.log(event.path);
    var fileName = require('path').relative(EXPRESS_ROOT, event.path);
    console.log(fileName);

    lr.changed({
        body: {
            files: [fileName]
        }
    })
}

function notifyStylesCss() {
    return map(function (stream, callback) {
        if (lr) {
            lr.changed({
                body: {
                    files: [getRootFolder() + '/' + getBuildFolder() + '/css/styles.css']
                }
            });
        }
        callback(null, stream);
    });
}

function doIndexProd() {
    return gulp.src(getRootFolder() + '/index-template.html')
        .pipe(createIndexForEnv('PROD'))
        .pipe(concat('index.html'))
        .pipe(gulp.dest(getRootFolder()))
}

function doIndexDev() {
    return gulp.src(getRootFolder() + '/index-template.html')
        .pipe(createIndexForEnv('DEV'))
        .pipe(concat('index.html'))
        .pipe(gulp.dest(getRootFolder()))
}

function createIndexForEnv(env) {
    return through(
        function write(data) {    // this will be called once for each file
            var lines = String(data.contents).split('\n');
            lines = filterLinesForEnv(env, lines);
            data.contents = new Buffer(lines.join('\n'));
            this.emit('data', data)
        },
        function end() {    // this will be called when there are no more files
            this.emit('end')
        }
    );
}

function filterLinesForEnv(env, lines) {
    _UUID_ = new Date().getTime();
    var newlines = [];
    for (var i = 0; i < lines.length; i++) {
        var line = filterParams(lines[i]);

        // match scope
        var m = line.match(new RegExp("<!--[ ]*([a-zA-Z0-9]+)[ ]*{[ ]*-->"));
        if (!m) {
            newlines.push(line);
            continue;
        }
        var envs = m[1].split(',');
        var found = (envs.indexOf(env) !== -1);
        for (; i < lines.length; i++) {
            line = filterParams(lines[i]);
            if (found) newlines.push(line);
            if (line.match(new RegExp("<!--[ ]*}[ ]*-->")) !== null) break;
        }
    }
    return newlines;
}

function parseXml(file) {
    var defer = Q.defer();
    var parser = new xml2js.Parser();

    fs.readFile(file, function (err, data) {
        if (err) {
            defer.reject(err);
        } else {
            parser.parseString(data, function (err, result) {
                if (err) {
                    defer.reject(err);
                } else {
                    defer.resolve(result.xml);
                }
            });
        }
    });

    return defer.promise;
}

function doQuery(){
    var v = process.argv;
    if (v.length >= 3 && v[2] === 'query') {
        isQueryMode = true;
    }
    startExpress();
}

function startUserQuery(){
    var readline = READLINE.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function keepAsking(inp){
        if (inp === 'exit') {
            readline.close();
            return;
        } else if (inp === 'database-filter') {
            doDatabaseFilter()
            return;
        } else if (!inp) {
            readline.question("> ", keepAsking);
            return;
        } else if (inp && inp.indexOf('eval') === 0) {
            console.log(inp.substr('eval'.length+1))
            eval(inp.substr('eval'.length+1))
            readline.question("> ", keepAsking)
            return
        }

        db.sql(inp).then(function(data){
            console.log(data)
        }, function(err){
            console.log(err)
        }).finally(function(){
            readline.question("> ", keepAsking);
        })
    }

    keepAsking();
}

function doTest() {
}

function doDatabaseFilter() {
    db.makeAllColumnLowercase()
}
