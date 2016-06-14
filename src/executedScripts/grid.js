/**
 * Heartbeat method that tells the popup whether the file has
 * been injected into the page.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.greeting == "hello")
            sendResponse({message: "hi"});
    });

/**
 * Method that creates the HTML structure
 * for the grid.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.method == "create") {
            chrome.storage.sync.get(request.tabId.toString(), function (item) {
                var numColumns = item[request.tabId.toString()].formData.gridForm.settings.largeColumns || 16;

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
                respond(1);
            });
        }
    });

/**
 * Method for removing the grid HTML from the page.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.method == "destroy" && document.getElementsByClassName('cb-grid-lines').length) {
            document.body.removeChild(document.getElementsByClassName('cb-grid-lines')[0]);
            respond(0);
        }
    });

/**
 * Adds the dynamically generated CSS for the grid
 * into the head of the document.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.method == "addCSS") {
            insertBaseCSS();

            var customGridStyles = document.createElement('style');
            customGridStyles.id = "custom-grid-style";
            customGridStyles.appendChild(document.createTextNode(
                request.css
            ));

            document.head.appendChild(customGridStyles);
        }
    });


/**
 * Removes the dynamically generated CSS from the
 * head of the document.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.method == "removeCSS") {
            var customGridStyles = document.getElementById("custom-grid-style");
            if (customGridStyles) {
                customGridStyles.parentNode.removeChild(customGridStyles);
            }
        }
    });

/**
 * Inserts the base CSS styles for the grid into
 * the head of the document. This is done by
 * adding a link tag with an href to the grid.css file.
 */
function insertBaseCSS() {
    var css = document.createElement('link');
    css.id = "base-grid-styles";
    css.rel = "stylesheet";
    css.type = "text/css";
    css.href = chrome.extension.getURL('src/css/grid.css');

    if (!document.getElementById('base-grid-styles')) {
        document.head.appendChild(css);
    }
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.method == "insertBaseCSS") {
            insertBaseCSS();
        }
    });

/**
 * Notifies the popup whether the grid is
 * on or off.
 */
function respond(gridStatus) {
    chrome.runtime.sendMessage({status: gridStatus});
}


