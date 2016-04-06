chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
   if(request.method == "create"){
    chrome.storage.sync.get(request.tabId.toString(), function(item) {
        var numColumns = item[request.tabId.toString()].largeColumns || 16;       

        var div = document.createElement('div');
        div.setAttribute("class", "cb-grid-lines"); 

        var output = '<div class="grid-overlay-container"> \
            <div class="grid-overlay-row">';

        for (var i = 0; i < numColumns; i += 1) {
            output +=  '<div class="grid-overlay-col"></div>';
        }

        output += '</div> \
          </div>';

        div.innerHTML = output;
        document.body.appendChild(div);
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


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.method == "addCSS"){
            var customGridStyles = document.createElement('style');
            customGridStyles.id = "custom-grid-style";
            customGridStyles.appendChild(document.createTextNode(
               request.css
            ));
            document.head.appendChild(customGridStyles); 
        }

});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.method == "removeCSS"){
            var customGridStyles = document.getElementById("custom-grid-style");
            if(customGridStyles){
                customGridStyles.parentNode.removeChild(customGridStyles);
            }
        }
});


function respond(gridStatus) {
    chrome.runtime.sendMessage({status: gridStatus});
}


