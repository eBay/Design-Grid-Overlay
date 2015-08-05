var chrome = chrome || {};

function addGrid(){
	chrome.tabs.insertCSS({ 
        file: 'grid.css'
    }, function() {
        chrome.tabs.executeScript(null, {
            file: 'grid.js'
        });    
    }); 
}


function upDateGrid(){



}


function removeGrid(){
	chrome.tabs.insertCSS({ 
        file: 'grid.css'
    }, function() {
        chrome.tabs.executeScript(null, {
            file: 'grid.js'
        });    
    }); 
}

function pullFromLocalStorage(){



}

function pushToLocalStorage(){



}



document.getElementById('addGrid').addEventListener('click', addGrid);
document.getElementById('removegrid').addEventListener('click', addGrid);
