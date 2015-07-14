if (document.getElementsByClassName('cb-grid-lines').length){  
    document.body.removeChild(document.getElementsByClassName('cb-grid-lines')[0]);
} else {
    var numColumns = 12;
    var columnSelector = '.grid-overlay-container .row > .span1';
    var output = '<div class="cb-grid-lines"> \
      <div class="grid-overlay-container"> \
        <div class="row">';
    for (var i = 0; i < numColumns; i += 1) {
        output +=  '<div class="span1 col-xs-1"></div>';
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
    var styleEl = document.createElement('style');

    // Append style element to head
    document.head.appendChild(styleEl);
    
    var dynamicGridRules = styleEl.sheet;
    
    console.log(dynamicGridRules);
    console.log(100 / numColumns);
    
    //dynamicGridRules.insertRule(columnSelector + ' { color: #fff; width: calc('+(100 / numColumns)+'% - 16 px); }', 0);
    //dynamicGridRules.insertRule('.grid-overlay-container .row > * { color: #fff; }', 1);
}