var _ = require('lodash');
require('shelljs/global');

var apiObjects = [];

_.forEach(ls(__dirname+'/*-api.js'), function(file){
	if (file.match(/base-api.js/)){
		return;
	}
	var APIClass = require(file);
	var apiObject = new APIClass(null);
	apiObjects.push(apiObject);
});

var params = [{
	api: 'employee.get',
	cd: 1001,
	cardNo2: '123'
},{
	api: 'employee.get',
	sectionCd: 1001,
	cardNo: '123'
},{
	api: 'codefile.sections',
	cd: 1
}];

function serve(){
	for (var i = 0; i < params.length; i++) {
		var param = params[i];
		for (var j = 0; j < apiObjects.length; j++) {
			var apiObject = apiObjects[j];
			var result = apiObject.serve(param);
			//console.log(JSON.stringify(param), result);
			if (result) console.log(result);
		}
	}
	return false;
}

serve();
