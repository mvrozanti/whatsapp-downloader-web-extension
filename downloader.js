function modifyDOM() {
    function getDatetimeSender(messageDiv, divsForGettingToDateTimeSender){
        var datetimeSender = null;
        Array.prototype.forEach.call(divsForGettingToDateTimeSender, function(el2) {
            // simple text message
            if(el2.hasAttribute('data-pre-plain-text'))
                datetimeSender = el2.getAttribute('data-pre-plain-text');
        });
        var sender = null;
        var datetime = null;
        if(datetimeSender == null){
            Array.prototype.forEach.call(messageDiv.getElementsByTagName('span'), function(el2) {
                if(el2.hasAttribute('aria-label'))
                    sender = el2.getAttribute('aria-label');
                if(el2.hasAttribute('dir') && el2.getAttribute('dir') == 'auto')
                    datetime = '[' + el2.textContent + ', __/__/____] ';
            });
            datetimeSender = datetime + sender;
        }
        return datetimeSender;
    };

    function getElementByXpath(path) { return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; };


    let conversationTitle = document.getElementsByTagName('header')[1].getElementsByTagName('span')[1].textContent;
    console.log('conversationTitle: ' + conversationTitle);

    let mainConversationArea = document.querySelector('#main');
    let mainConversationDiv = mainConversationArea.getElementsByTagName('div')[2];
    let messageList = getElementByXpath('/html/body/div[1]/div/div/div[4]/div/div[3]/div/div/div[3]');
    if(messageList == null)
        console.log('messageList is null')
    let messageListDivs = messageList.getElementsByTagName('div');
    if(messageListDivs == null || messageListDivs.length == 0)
        console.log('messageListDivs is null');
    let messages = [];
    Array.prototype.forEach.call(messageListDivs, function(messageDiv) {
        if(messageDiv.hasAttribute('class')){
            let matches =  /message-(\w{2,3})/g.exec(messageDiv.getAttribute('class'))
            if(matches != null){
                let messageDivClass = matches[1];
                let divsForGettingToDateTimeSender = messageDiv.getElementsByTagName('div');
                let datetimeSender = getDatetimeSender(messageDiv, divsForGettingToDateTimeSender);
                // console.log(datetimeSender);
            }
        }
    });

    return document.body.innerHTML;
}

document.getElementById("downloadButton").addEventListener('click', () => {
    // browser.runtime.sendMessage({ type: 'saveFile', data: { filename: 'bolo', content: 'kek' } })
    chrome.tabs.executeScript({
            code: '(' + modifyDOM + ')();'
    }, (results) => {
    });
});

// message format
// {
//     "timestampReceived": ,
//     "sender": "",
//     "text": "",
//     "video": "",
//     "image": "",
//     "audio": "",
//     "isQuote": false,
//     "forwarded": false
// }
//
// -----
//
// chat format
// {
//     "chatName": "",
//     "timestampCreated": "",
//     "messages": [
//         <message>
//     ]
// }
