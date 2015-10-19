var chrome = chrome || {};

if (document.getElementsByClassName('cb-grid-lines').length){
    document.body.removeChild(document.getElementsByClassName('cb-grid-lines')[0]);
} else {

    chrome.storage.sync.get(["largeColumns"], function(item){
        var numColumns = item.largeColumns || 16 ;       


        var columnSelector = '.grid-overlay-container .row > .span1';

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

        //var gridOverlay = document.querySelectorAll('.grid-overlay-container');
        var columns = document.querySelectorAll(columnSelector);
    
    });
}

