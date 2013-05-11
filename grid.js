if (document.getElementsByClassName('cb-grid-lines').length){
    
    document.body.removeChild(document.getElementsByClassName('cb-grid-lines')[0]);
}

else {
    document.body.innerHTML += '<div class="cb-grid-lines"> \
      <div class="container"> \
        <div class="span1"></div> \
        <div class="span1"></div> \
        <div class="span1"></div> \
        <div class="span1"></div> \
        <div class="span1"></div> \
        <div class="span1"></div> \
        <div class="span1"></div> \
        <div class="span1"></div> \
        <div class="span1"></div> \
        <div class="span1"></div> \
        <div class="span1"></div> \
        <div class="span1"></div> \
      </div> \
    </div>';
    
}