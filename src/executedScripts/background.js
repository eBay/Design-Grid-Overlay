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


//On installation, clear all non-default extension settings data
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.get(function(allData){

        var defaultSettings = allData['default'];

        chrome.storage.sync.clear(function(){
            if(defaultSettings) {
                chrome.storage.sync.set({'default': defaultSettings});
            }
        });

    });
});

/**
 * set mouse hover title
 * while user hover on the extension icon
 */

chrome.browserAction.setTitle({
    title:'Use ( Ctrl / Command + Shift + A ) to activate Design Grid Overlay'
});



//Clear tab sync storage when it is closed
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    chrome.storage.sync.remove(tabId.toString());
});


//On keyboard command
chrome.commands.onCommand.addListener(function (command) {
  // this function is not scaleable

  var method = '';
  switch (command) {
    case 'toggle-columns':
      method = 'toggleGrid';
      break;
    case 'toggle-lines':
      method = 'toggleHorizontalLines';
      break;
  }

  chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
    for (var i = 0; i < tabs.length; i++) {
      if (chrome.runtime.lastError) {
          console.warn("Whoops.. " + chrome.runtime.lastError.message);
      } else {
          if (tabs[i]) {
              var currentId = tabs[i].id;
              chrome.tabs.sendMessage(currentId, {method: method, tabId: currentId});
          }
      }
    }
  });
});

// this listener helps to content_scripts to know the current tab ID
chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === 'getTabId')
      sendResponse(sender.tab.id);
});
