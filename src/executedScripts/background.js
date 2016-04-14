

/*
 *This method will listen to see
 *weather the extension has been 
 *newly installed or updated. If
 *so the scripts get reInjejcted into the page 
 */
chrome.runtime.onInstalled.addListener(function(){
    chrome.tabs.query({}, function(tabs) { 

        for(var i = 0; i < tabs.length; i++){
            if(chrome.runtime.lastError){
               console.warn("Whoops.. " + chrome.runtime.lastError.message);
            }else{
                chrome.tabs.insertCSS(tabs[i].id, {file: "src/css/grid.css"});
                chrome.tabs.executeScript(tabs[i].id, {file: "src/executedScripts/grid.js"});
                chrome.tabs.executeScript(tabs[i].id, {file: "src/executedScripts/calcReport.js"});
            }
        } 
    });
});