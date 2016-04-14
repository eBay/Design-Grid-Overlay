//var port;

// Attempt to reconnect
/*var reconnectToExtension = function () {
    // Reset port
    port = null;
    // Attempt to reconnect after 1 second
   setTimeout(connectToExtension, 1000 * 1);
   //connectToExtension();
};*/

// Attempt to connect, send a message to re inject scripts 
/*var connectToExtension = function () {
    console.log('connecting to stuff');
    // Make the connection
    port = chrome.runtime.connect({name: "my-port"});
    console.log(port);

    // When extension is upgraded or disabled and renabled, the content scripts
    // will still be injected, so we have to reconnect them.
    // We listen for an onDisconnect event, and then wait for a second before
    // trying to connect again. Becuase chrome.extension.connect fires an onDisconnect
    // event if it does not connect, an unsuccessful connection should trigger
    // another attempt, 1 second later.
    //port.onDisconnect.addListener(reconnectToExtension);

};

// Connect for the first time
connectToExtension();*/