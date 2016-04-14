//Message handler for firing the calculate report function
chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
 	if(request.method == "fireCalc"){
 		fireCalc(request.tabId);
 	}
 });


function fireCalc(tabId){
	chrome.storage.sync.get(tabId.toString(), function(items){
		if(getWidth() <= parseInt(items[tabId]["smallWidth"])){
			calculateReport((parseInt(items[tabId]["smallColumns"])));
		}else{
			calculateReport(parseInt(items[tabId]["largeColumns"]));
		}
	});
}


function calculateReport(size){
	if(!document.querySelectorAll(".grid-overlay-col").length) return;

	var rec = document.querySelectorAll(".grid-overlay-col")[1].getBoundingClientRect();
	var gutter = calculateGutter();
	var output = '';

	for(var i = 1; i <= size; i++){
		var columnSetWidth = numberFormat(((gutter * (i - 1)) + (rec.width * i)), 2);

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
	var el = elements[1];
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

function numberFormat(val, decimalPlaces) {

    var multiplier = Math.pow(10, decimalPlaces);
    return (Math.round(val * multiplier) / multiplier).toFixed(decimalPlaces);
}
