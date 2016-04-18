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
                if(tabs[i]){
                    var currentId = tabs[i].id;
                    chrome.tabs.executeScript(currentId, {file: "src/executedScripts/grid.js"});
                    chrome.tabs.executeScript(currentId, {file: "src/executedScripts/calcReport.js"});  
                }
            }
        } 
    });
});

