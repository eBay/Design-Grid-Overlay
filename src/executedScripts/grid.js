//var chrome = chrome || {}; //Don't think we need this

if (document.getElementsByClassName('cb-grid-lines').length) {
    document.body.removeChild(document.getElementsByClassName('cb-grid-lines')[0]);
    respond(0);
} else {
     
    chrome.storage.sync.get(["largeColumns"], function(item) {
        respond(1);
        var numColumns = item.largeColumns || 16;       

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

        //var columnSelector = '.grid-overlay-container .row > .span1';
        //var gridOverlay = document.querySelectorAll('.grid-overlay-container');
        //var columns = document.querySelectorAll(columnSelector);
    });
}

function respond(gridStatus) {
    chrome.runtime.sendMessage({status: gridStatus}, function(response) {
      //console.log(response);
    });
}

window.addEventListener("scroll", function(){
    console.log('scroll');
});
