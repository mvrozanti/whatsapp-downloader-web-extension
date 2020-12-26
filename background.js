function onError(e) { console.error(e); }

function notify(message) {
    browser.notifications.create({
      "type": "basic",
      "title": "WhatsApp Downloader",
      "message": message
    });
};

function doStuffWithDom(document) {
    // console.log('I received the following DOM content:\n' + document.getElementsByTagName('span').length);
}

browser.runtime.onMessage.addListener(function handleMessage(request, sender, sendResponse){
    console.log(request); //logs "your message"
  }
);

var document = document;
function toggleCSS(tab) {
  console.log('!')
  console.log(Object.keys(browser.tabs.get));
}

browser.browserAction.onClicked.addListener(toggleCSS);
