// Unused for now:

// chrome.runtime.onSuspend.addListener(function () {
//     chrome.tabs.query({}, function (tabs) {
//
//         for (var i = 0; i < tabs.length; i++) {
//             if (chrome.runtime.lastError) {
//                 console.warn("Whoops.. " + chrome.runtime.lastError.message);
//             }
//             else {
//                 if (tabs[i]) {
//                     var currentId = tabs[i].id;
//                     chrome.tabs.sendMessage(currentId, {method: "cleanUp", tabId: currentTabId});
//                 }
//             }
//         }
//     });
// });
//
// /**
//  * This method will listen to see
//  * whether the extension has been
//  * newly installed or updated. If
//  * so the scripts get re-injected into the page
//  */
// chrome.runtime.onInstalled.addListener(function () {
//     chrome.tabs.query({}, function (tabs) {
//
//         for (var i = 0; i < tabs.length; i++) {
//             if (chrome.runtime.lastError) {
//                 console.warn("Whoops.. " + chrome.runtime.lastError.message);
//             }
//             else {
//                 if (tabs[i]) {
//                     var currentId = tabs[i].id;
//                     chrome.tabs.executeScript(currentId, {file: "src/executedScripts/grid.js"});
//                     chrome.tabs.executeScript(currentId, {file: "src/executedScripts/calcReport.js"});
//                 }
//             }
//         }
//     });
// });


//On installation, clear all non-global data
chrome.runtime.onInstalled.addListener(function () {

    chrome.storage.sync.get(function(allData){

        var globalSettings = allData['global'];

        chrome.storage.sync.clear(function(){
            if(globalSettings) {
                chrome.storage.sync.set({'global': globalSettings});
            }
        });

    });
});


//Clear tab sync storage when it is closed
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    chrome.storage.sync.remove(tabId.toString());
});
