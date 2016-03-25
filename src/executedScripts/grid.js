chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
    if(request.method == "create"){
        chrome.storage.sync.get(request.tabId.toString(), function(item) {
        var numColumns = item[request.tabId.toString()].largeColumns || 16;       

        var output = '<div class="cb-grid-lines"> \
          <div class="grid-overlay-container"> \
            <div class="grid-overlay-row">';

        for (var i = 0; i < numColumns; i += 1) {
            output +=  '<div class="grid-overlay-col"></div>';
        }

        output += '</div> \
          </div> \
        </div>';

        document.body.innerHTML += output;

        respond(1);
    });
  }
});


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.method == "destroy" && document.getElementsByClassName('cb-grid-lines').length){
            document.body.removeChild(document.getElementsByClassName('cb-grid-lines')[0]);
            respond(0);
        }
});


function respond(gridStatus) {
    chrome.runtime.sendMessage({status: gridStatus});
}
