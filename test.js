document.getElementById("downloadButton").addEventListener('click', () => {
    function modifyDOM() {
        function getElementByXpath(path) {
            return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        };
        var conversationTitle = document.getElementsByTagName('header')[1].getElementsByTagName('span')[1].textContent;
        console.log('conversationTitle: ' + conversationTitle);

        var mainConversationArea = document.querySelector('#main');
        var mainConversationDiv = mainConversationArea.getElementsByTagName('div')[2];
        var messageList = getElementByXpath('/html/body/div[1]/div/div/div[4]/div/div[3]/div/div/div[3]');
        var messageListDivs = messageList.getElementsByTagName('div');

        var messages = [];
        Array.prototype.forEach.call(messageListDivs, function(el) {
            if(el.hasAttribute('class')){
                var elClass = el.getAttribute('class');
                var arr = /message-(\w{2,3})/g.exec(elClass);
                if(arr != null){
                    var divsForGettingToDateTimeSender = el.getElementsByTagName('div');
                    var datetimeSender = null;
                    Array.prototype.forEach.call(divsForGettingToDateTimeSender, function(el) {
                        // msg de texto:
                        if(el.hasAttribute('data-pre-plain-text'))
                            datetimeSender = el.getAttribute('data-pre-plain-text');
                    });
                    var sender = null;
                    var datetime = null;
                    if(datetimeSender == null){
                        // msg com mídia
                        Array.prototype.forEach.call(el.getElementsByTagName('span'), function(el) {
                            if(el.hasAttribute('aria-label'))
                                sender = el.getAttribute('aria-label');
                            if(el.hasAttribute('dir') && el.getAttribute('dir') == 'auto')
                                datetime = '[' + el.textContent + ', __/__/____] ';
                        });
                        datetimeSender = datetime + sender
                    }

                    console.log(datetimeSender)
                }
            }
        });

        return document.body.innerHTML;
    }

    //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
    chrome.tabs.executeScript({
            code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
    }, (results) => {
        //Here we have just the innerHTML and not DOM structure
        // console.log('Popup script:')
        // console.log(results[0]);
    });
});
