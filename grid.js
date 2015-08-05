if (document.getElementsByClassName('cb-grid-lines').length){
    document.body.removeChild(document.getElementsByClassName('cb-grid-lines')[0]);
} else {
    var numColumns = 16;


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
    
    /**
    for (var j = 0; j < columns.length; j += 1) {
        columns[j].style.width = 'calc('+(100 / numColumns)+'% - 16 px)';
    }
    */
   /*
    var styleEl = document.createElement('style');

    // Append style element to head
    document.head.appendChild(styleEl);
    
    var dynamicGridRules = styleEl.sheet;
    */
    //console.log(document.styleSheets);
    //console.log(100 / numColumns); //You need to update the CSS with this value because calc is hard to inject via javascript
    
    //dynamicGridRules.insertRule(columnSelector + ' { color: #fff; width: calc('+(100 / numColumns)+'% - 16 px); }', 0);
    //dynamicGridRules.insertRule('.grid-overlay-container .row > * { color: #fff; }', 1);
}

