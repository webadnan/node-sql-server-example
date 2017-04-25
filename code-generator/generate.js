#! /usr/bin/env node

require('shelljs/global');
var gulp = require('gulp');
var argv = require('yargs').argv; // for args parsing
var concat = require('gulp-concat');
var Buffer = require('buffer').Buffer;
var through = require('through');

var folder = argv.folder || 'website/app';
var scope = {};

// checking arguments
if (process.argv[2] === '--help') {
    help();
} else if (process.argv[2] === 'controller' && process.argv.length >= 4) {
    createController(process.argv[3]);
} else if (process.argv[2] === 'component' && process.argv.length >= 4) {
    createComponent(process.argv[3]);
} else {
    help();
}

function help() {
    var lines = [
        '',
        'User of the following commands:',
        './generate.js controller controller-name',
        './generate.js component component-name'
    ];
    console.log(lines.join('\n'));
}

function createController(controllerName) {
    console.log('you are trying to generate a controller with name ', controllerName);
    var controllerPath = 'controllers/' + controllerName;

    if (folderExists(controllerPath)){
        console.log('controller already exists');
        return;
    }

    console.log('create a folder in directory', getPath(controllerPath));
    mkdir(getPath(controllerPath));

    scope['controller-name'] = controllerName;
    scope['ControllerName'] = toCamel(controllerName);

    ['js', 'html', 'less'].forEach(function (e) {
        copyFile('controller/controller.' + e, getPath(controllerPath), controllerName + '.' + e);
    });

    updateCode(
        'less/styles.less',
        '@CODE_GENERATOR:LINK_LESS',
        "@import '../controllers/" + controllerName + "/" + controllerName + "';"
    );

    updateCode(
        './start.js',
        '@CODE_GENERATOR:LINK_CONTROLLER',
        "\t_paths['" + scope['ControllerName'] + "'] = 'controllers/" + scope['controller-name'] + "/" + scope['controller-name'] + "';"
    );

    updateCode(
        './app.js',
        '@CODE_GENERATOR:ADD_ROUTE_PROVIDER',
        [
            "\t\t$routeProvider.when('/" + scope['controller-name'] + "', whenConfig({",
            "\t\t    controller: '" + scope['ControllerName'] + "',",
            "\t\t    templateUrl: 'app/controllers/" + scope['controller-name'] + "/" + scope['controller-name'] + ".html',",
            "\t\t    require: ['" + scope['ControllerName'] + "']",
            "\t\t}));"
        ].join('\n')
    );
}

function createComponent(componentName) {
    console.log('you are trying to generate a component with name ', componentName);
    var componentPath = 'comp/' + componentName;

    if (folderExists(componentPath)){
        console.log('component already exists');
        return;
    }

    console.log('create a folder in directory', getPath(componentPath));
    mkdir(getPath(componentPath));

    scope['controller-name'] = componentName;
    scope['ControllerName'] = toCamel(componentName);

    ['js', 'html', 'less'].forEach(function (e) {
        copyFile('controller/controller.' + e, getPath(componentPath), componentName + '.' + e);
    });

    updateCode(
        'less/styles.less',
        '@CODE_GENERATOR:LINK_LESS',
        "@import '../controllers/" + componentName + "/" + componentName + "';"
    );

    updateCode(
        './start.js',
        '@CODE_GENERATOR:LINK_CONTROLLER',
        "\t_paths['" + scope['ControllerName'] + "'] = 'controllers/" + scope['controller-name'] + "/" + scope['controller-name'] + "';"
    );

    updateCode(
        './app.js',
        '@CODE_GENERATOR:ADD_ROUTE_PROVIDER',
        [
            "\t\t$routeProvider.when('/" + scope['controller-name'] + "', whenConfig({",
            "\t\t    controller: '" + scope['ControllerName'] + "',",
            "\t\t    templateUrl: 'app/controllers/" + scope['controller-name'] + "/" + scope['controller-name'] + ".html',",
            "\t\t    require: ['" + scope['ControllerName'] + "']",
            "\t\t}));"
        ].join('\n')
    );
}

function updateCode(fullPath, search, code) {
    var t = fullPath.split('/'), file = t[t.length - 1];
    t.pop();
    var folder = t.join('/');

    //@CODE_GENERATOR:LINK_CONTROLLER
    function write(data) {
        var lines = String(data.contents).split('\n');
        var newLines = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.indexOf(search) !== -1) {
                newLines.push(code);
            }
            newLines.push(line);
        }
        var result = newLines.join('\n');
        data.contents = new Buffer(result);
        this.emit('data', data);
    }

    function end() {
        this.emit('end');
    }

    function process() {
        return through(write, end);
    }

    return gulp.src(getPath(fullPath))
        .pipe(process())
        .pipe(gulp.dest(getPath(folder)));
}

function toCamel(s) {
    var chars = s.split('');
    var up = true;
    var newChars = [];
    for (var i = 0; i < chars.length; i++) {
        var c = chars[i];
        if (c === '-') {
            up = true;
            continue;
        }
        if (up) {
            c = c.toUpperCase();
            up = false;
        }
        newChars.push(c);
    }
    return newChars.join('');
}

function copyFile(from, to, fileName) {
    return gulp.src(from)
        .pipe(processFile())
        .pipe(concat(fileName))
        .pipe(gulp.dest(to));
}

function processFile() {
    function write(data) {
        var lines = String(data.contents).split('\n');
        for (var i = lines.length - 1; i >= 0; i--) {
            var line = lines[i];
            for (var key in scope) {
                var re = new RegExp('\\$\\{' + key + '\\}', 'g');
                line = line.replace(re, scope[key]);
            }
            lines[i] = line;
        }
        var result = lines.join('\n');
        data.contents = new Buffer(result);
        this.emit('data', data);
    }

    function end() {
        this.emit('end');
    }

    return through(write, end);
}

function _exec() {
    var cmd = [].slice.call(arguments).join(' ');
    console.log(cmd);
    return exec(cmd, {silent: true});
}

function getPath(postfix) {
    return '../' + folder + '/' + postfix;
}

function folderExists(name) {
    var path = getPath(name);
    var con = _exec('ls', getPath(name));
    return (con.code === 0);
}
