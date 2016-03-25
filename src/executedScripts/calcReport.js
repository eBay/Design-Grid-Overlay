//Switch this to be an onMessage 

/*if (document.getElementsByClassName('cb-grid-lines').length) {
    fireCalc();
} */
	console.log('Fell into calc');

chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
 	console.log(request);
 	if(request.method == "fireCalc"){
 		console.log('Fell into calc');
 		fireCalc(request.tabId);
 	}
 });

function fireCalc(tabId){
	chrome.storage.sync.get(tabId.toString(), function(items){
		console.log(items);
		if(getWidth() <= parseInt(items[tabId]["smallWidth"])){
			calculateReport(parseInt(items[tabId]["smallColumns"]));
		}else{
			calculateReport(parseInt(items[tabId]["largeColumns"]));
		}
	});
}

function calculateReport(size){
	//This might a symptom of something else
	if(!document.querySelectorAll(".grid-overlay-col").length) return;

	var width = document.querySelectorAll(".grid-overlay-col")[0].clientWidth;
	console.log(width);
	var gutter = calculateGutter();

	var output = '';

	for(var i = 1; i <= size; i++){
		var columnSetWidth = ((gutter * (i - 1)) + (width * i));

		if(i == size){
			output = output + columnSetWidth;
		}else{
			output = output + columnSetWidth + ',';
		}
	}

	chrome.runtime.sendMessage({
			method: 'resize',
			colSizes: output
		}
	);
}


function calculateGutter(){
	var  elements = document.getElementsByClassName('grid-overlay-col');
	var el = elements[0];
	var style = el.currentStyle || window.getComputedStyle(el);
	var margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);	

	return margin;
}


function getWidth() {
  if (self.innerHeight) {
    return self.innerWidth;
  }

  if (document.documentElement && document.documentElement.clientWidth) {
    return document.documentElement.clientWidth;
  }

  if (document.body) {
    return document.body.clientWidth;
  }
}

