function modifyDOM() {
    function getElementByXpath(path) { return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue }

    function getElementsByXpath(path) { return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null) }

    function getMissingDate(messageDiv, scrollableDiv){
        scrollableDiv.scrollBy(0,-1) // show date baloon
        let dateBaloonElement = document.querySelectorAll('div[class*="focusable-list-item"]:not([data-id]) div span[dir="auto"] ')
        console.log(dateBaloonElement)
        // console.log(dateBaloonElement.textContent)
        // scroll up until date is found
        // and set it to datetimeSender
    }

    function getDatetimeSender(messageDiv, scrollableDiv){
        var datetimeSender = null
        var divsForGettingToDateTimeSender = messageDiv.getElementsByTagName('div')
        Array.prototype.forEach.call(divsForGettingToDateTimeSender, function(el2) {
            // simple text message
            if(el2.hasAttribute('data-pre-plain-text'))
                datetimeSender = el2.getAttribute('data-pre-plain-text')
        })
        var sender = null
        var datetime = null
        if(datetimeSender == null){
            Array.prototype.forEach.call(messageDiv.getElementsByTagName('span'), function(el2) {
                if(el2.hasAttribute('aria-label'))
                    sender = el2.getAttribute('aria-label')
                if(el2.hasAttribute('dir') && el2.getAttribute('dir') == 'auto'){
                    var time = el2.textContent 
                    var date = getMissingDate(messageDiv, scrollableDiv)
                    datetime = '[' + time + ', ' + date + ']'
                }
            })

            datetimeSender = datetime + sender

        }
        return datetimeSender
    }

    function getMainConversationDiv(document){
        return document.querySelector('#main').getElementsByTagName('div')[2]
    }

    function getCurrentDate(){
        var today = new Date()
        var dd = String(today.getDate()).padStart(2, '0')
        var MM = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
        var yyyy = today.getFullYear()
        today = dd + '/' + mm + '/' + yyyy
        return today
    }

    function getMessageDivType(messageDiv){
        if(messageDiv.querySelectorAll('.selectable-text.invisible-space.copyable-text').length > 0)
            return 'text'
        if(messageDiv.querySelectorAll('span[data-icon="recalled"]').length > 0)
            return 'deleted'

    }

    function getMessageDivContent(messageDiv, messageType){
        switch(messageType){
        case 'text':
            return messageDiv.querySelector('.selectable-text.invisible-space.copyable-text').textContent
        }

    }

    function getMessages(doc){
        let messages = []

        Array.prototype.forEach.call(doc.getElementsByTagName('div'), function(messageDiv){
            if(messageDiv.hasAttribute('class')){
                let messageDivClass = messageDiv.getAttribute('class')
                let matches =  /message-(\w{2,3})/g.exec(messageDivClass)
                if(matches != null){
                    let scrollableDiv = messageDiv.parentElement.parentElement
                    // let messageDivClass = matches[1]
                    let datetimeSender = getDatetimeSender(messageDiv, scrollableDiv)
                    let messageType = getMessageDivType(messageDiv)
                    let messageContent = getMessageDivContent(messageDiv, messageType)
                    // console.log('datetimeSender = ' + datetimeSender)
                    // console.log('messageType = ' + messageType)
                    // console.log('messageContent = ' + messageContent)
                    // console.log('\n')
                }
            }
        })
    }


    let conversationTitle = document.getElementsByTagName('header')[1].getElementsByTagName('span')[1].textContent
    console.log('conversationTitle: ' + conversationTitle + '\n\n')

    // let mainConversationArea = document.querySelector('#main')
    // let mainConversationDiv = mainConversationArea.getElementsByTagName('div')[2]
    // let messageList = getElementByXpath('/html/body/div[1]/div/div/div[4]/div/div[3]/div/div/div[3]')
    // let messageListDivs = messageList.getElementsByTagName('div')
    let messages = getMessages(document)
    return document.body.innerHTML
}

document.getElementById("downloadButton").addEventListener('click', () => {
    // browser.runtime.sendMessage({ type: 'saveFile', data: { filename: 'bolo', content: 'kek' } })
    chrome.tabs.executeScript({
            code: '(' + modifyDOM + ')()'
    }, (results) => {
    })
})

// message format
// {
    //     "timestampReceived": ,
    //     "sender": "",
    //     "text": "",
    //     "video": "",
    //     "image": "",
    //     "audio": "",
    //     "isQuote": false,
    //     "isDeleted": false,
    //     "isForwarded": false
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
