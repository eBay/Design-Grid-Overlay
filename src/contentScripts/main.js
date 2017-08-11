// FIXME: this code duplicated from src/executedScripts/grid.js
function initCSS (options, advancedOptions) {
  // base styles
  var css = document.createElement('link');
  css.id = "base-grid-styles";
  css.rel = "stylesheet";
  css.type = "text/css";
  css.href = chrome.extension.getURL('src/css/grid.css');

  document.head.appendChild(css);

  // FIXME: this code duplicated from src/controllers/gridController.js

  // custom styles
  var customCss = '.cb-grid-lines {' +
      'width: 100' + (advancedOptions.viewports ? 'vw' : '%') +
    '}';

  // createGridContainer
  customCss += '.grid-overlay-container {' +
      'max-width:' + options.largeWidth + 'px;' +
      'padding:0px ' + options.outterGutters + 'px;' +
      'left:' + options.offsetX + 'px;' +
    '}' +
    '.grid-overlay-col {' +
      'width:' + (100 / options.largeColumns) + '%;' +
      'margin: 0 ' + (options.gutters / 2) + 'px;' +
      'background: ' + advancedOptions.color + ';' +
    '}' +
    '.grid-overlay-col:first-child {' +
      'margin-left:0px;' +
    '}' +
    '.grid-overlay-col:last-child {' +
      'margin-right:0px;' +
    '}' +
    '.grid-overlay-horizontal {' +
      'background-image: linear-gradient(to top, ' + advancedOptions.horizontalLinesColor + ' 1px, transparent 1px);' +
      'background-size: 100% ' + options.rowGutters + 'px;' +
      'background-repeat-y: repeat;' +
      'background-position-y: ' + options.offsetY + 'px;' +
    '} ';

  // createSmallContainer
  customCss += '@media (max-width:' + options.smallWidth + 'px) {' +
      '.grid-overlay-col {' +
        'width:' + (100 / options.smallColumns) + '%;' +
        'margin: 0 ' + (options.mobileInnerGutters / 2) + 'px;' +
        'background: ' + advancedOptions.color + ';' +
      '}' +
      '.grid-overlay-container {' +
        'padding:0px ' + options.mobileOutterGutters + 'px;' +
        'left:' + options.offsetX + 'px;' +
      '}' +
      '.grid-overlay-col:first-child {' +
        'margin-left:0px;' +
      '}' +
      '.grid-overlay-col:nth-child(' + options.smallColumns + ') {' +
        'margin-right:0px;' +
      '}' +
      '.grid-overlay-col:nth-child(n+' + (parseInt(options.smallColumns) + 1) + ') {' +
        'display:none;' +
      '}' +
    '}'

  var customGridStyles = document.createElement('style');
  customGridStyles.id = "custom-grid-style";
  customGridStyles.appendChild(document.createTextNode(customCss));

  document.head.appendChild(customGridStyles);
}

function renderGrid (numColumns) {
  // FIXME: this code duplicated from src/executedScripts/grid.js
  var div = document.createElement('div');
  div.setAttribute("class", "cb-grid-lines");

  var output = '<div class="grid-overlay-container"> \
      <div class="grid-overlay-row">';

  for (var i = 0; i < numColumns; i += 1) {
      output += '<div class="grid-overlay-col"></div>';
  }

  output += '</div> \
      </div>';

  div.innerHTML = output;
  document.body.appendChild(div);
}

function renderHorizontalLines (offsetY) {
  // FIXME: this code duplicated from src/executedScripts/grid.js
  var horizontalLinesContainer;
  var documentScrollListener = function (e) {
      // emulate static position for container background (horizontal lines)
      var initialOffset = horizontalLinesContainer.dataset.hloffset || 0;
      horizontalLinesContainer.style.backgroundPositionY = (initialOffset - document.body.scrollTop) + 'px';
  }

  horizontalLinesContainer = document.createElement('div');
  horizontalLinesContainer.setAttribute("class", "grid-overlay-horizontal");
  horizontalLinesContainer.style.backgroundPositionY = (offsetY - document.body.scrollTop) + 'px';
  document.body.appendChild(horizontalLinesContainer);

  horizontalLinesContainer.dataset.hloffset = offsetY;

  window.addEventListener('scroll', documentScrollListener, false);
}

chrome.storage.sync.get(function (storage) {
  chrome.extension.sendMessage({ type: 'getTabId' }, function (tabId) {
      if (storage.hasOwnProperty(tabId)) {
        storage = storage[tabId];

        initCSS(storage.formData.gridForm.settings, storage.formData.advancedForm.settings);

        if (storage.showGrid)
          renderGrid(storage.formData.gridForm.settings.largeColumns || 16);
        if (storage.showHorizontalLines)
          renderHorizontalLines(storage.formData.gridForm.settings.offsetY);
      }
  });
});
