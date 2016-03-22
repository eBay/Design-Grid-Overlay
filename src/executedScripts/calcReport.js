if (document.getElementsByClassName('cb-grid-lines').length) {
    fireCalc();
} 

function fireCalc(){
	chrome.storage.sync.get(["smallColumns", "smallWidth", "largeColumns"], function(items){
		if(getWidth() <= parseInt(items["smallWidth"])){
			calculateReport(parseInt(items["smallColumns"]));
		}else{
			calculateReport(parseInt(items["largeColumns"]));
		}
	});
}

function calculateReport(size){
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

