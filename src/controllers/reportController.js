var reportController = (function(){

	chrome.runtime.onMessage.addListener(function(request) {
	  if (request.method === 'resize') {
	   	var values = request.colSizes.split(',');
	   	createReport(values.length, values);
	  }
	});

	var createReport = function(columns, valuesArray){
		var output = '';

		if(valuesArray){
			for(var i = 0; i <= columns; i++){
				if(valuesArray[i]){
					output = output + '<tr><td style="width: 50%;">' + (i + 1) + '</td><td>' + valuesArray[i] + 'px</td></tr>';
				}
			}
		}

		console.log(columns);

		document.getElementById('report').innerHTML = output;
	}

	var calculateReport = function(){
		chrome.tabs.executeScript(null, {file: 'src/executedScripts/calcReport.js'});
	}


	return {
		createReport:createReport,
		calculateReport:calculateReport
	}
})();