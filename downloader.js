function modifyDOM() {
    function encode_utf8(s) { return unescape(encodeURIComponent(s)); }

    function decode_utf8(s) { return decodeURIComponent(escape(s)); }

    function getElementByXpath(path) { return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue }

    function getElementsByXpath(path) { return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null) }

    function getDateBaloons(messageDiv){
        messageDiv.parentElement.parentElement.scrollBy(0,-1) // show date baloons
        return document.querySelectorAll('div[class*="focusable-list-item"]:not([data-id]) div span[dir="auto"]')
    }

    function isFirstAfterSecond(el1, el2){
        let allHTML = el1.parentElement.innerHTML
        let html1pos = allHTML.indexOf(el1.innerHTML) 
        let html2pos = allHTML.indexOf(el2.innerHTML) 
        if(html1pos == -1 || html2pos == -1 || html1pos == html2pos)
            return null
        return html1pos > html2pos
    }

    function getDatetimeSender(messageDiv){
        let date = null
        let time = null
        let sender = null
        let divsForGettingToDateTimeSender = messageDiv.getElementsByTagName('div')
        Array.prototype.forEach.call(divsForGettingToDateTimeSender, function(el) {
            if(el.hasAttribute('data-pre-plain-text')){
                datetimeSenderMatches = /\[(.*), (.*)\] (.*):$/g.exec(el.getAttribute('data-pre-plain-text'))
                if(datetimeSenderMatches){
                    time = datetimeSenderMatches[1]
                    date = datetimeSenderMatches[2]
                    sender = datetimeSenderMatches[3]
                    return
                }
            }
        })
        if(sender == null){
            Array.prototype.forEach.call(messageDiv.getElementsByTagName('span'), function(el) {
                if(el.hasAttribute('aria-label')){
                    sender = el.getAttribute('aria-label')
                    sender = sender.substring(0, sender.length-1)
                    return
                }
            })
        }

        if(date == null){
            let balloonList = getDateBaloons(messageDiv)
            let balloonArray = [].slice.call(balloonList, 0).reverse()
            for(let i=0;i<balloonArray.length;i++){
                // console.log('ballonArray['+i+']='+balloonArray[i].textContent)
                if(date == null){
                    let firstAfterSecond = isFirstAfterSecond(messageDiv, balloonArray[i])
                    if(firstAfterSecond){
                        // console.log('messageDiv is after balloon['+i+']='+balloonArray[i].textContent)
                        date = balloonArray[i].textContent
                        // console.log('date='+date)
                    } else if(firstAfterSecond == null){
                        // console.log('firstAfterSecond=null')
                        // } else {
                            //     console.log('el before dateBaloon['+i+']')
                    }
                }
            }
        }

        if(time == null){
            Array.prototype.forEach.call(messageDiv.getElementsByTagName('span'), function(el) {
                if(el.hasAttribute('dir') && el.getAttribute('dir') == 'auto'){
                    time = el.textContent 
            }})
        }

        if(/ ?Read ?/g.exec(sender)){
            sender = 'You'
        }
        // console.log('date='+date)
        // console.log('time='+time)
        // console.log('sender='+sender)
        // console.log('\n')
        return [date,time,sender]
    }

    function getMainConversationDiv(document){
        return document.querySelector('#main').getElementsByTagName('div')[2]
    }

    function getCurrentDate(){
        let today = new Date()
        let dd = String(today.getDate()).padStart(2, '0')
        let MM = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
        let yyyy = today.getFullYear()
        today = dd + '/' + mm + '/' + yyyy
        return today
    }

    function getMessageTypes(messageDiv){
        let types = []
        if(messageDiv.querySelectorAll('.selectable-text.invisible-space.copyable-text').length > 0)
            types.push('text')
        if(messageDiv.querySelectorAll('span[data-icon="recalled"]').length > 0)
            types.push('deleted')
        return types
    }

    function getMessageText(messageDiv){
        return messageDiv.querySelector('.selectable-text.invisible-space.copyable-text').textContent
    }

    function getMessages(doc){
        let messages = []

        try {
            Array.prototype.forEach.call(doc.getElementsByTagName('div'), function(messageDiv){
                if(messageDiv.hasAttribute('class')){
                    let messageDivClass = messageDiv.getAttribute('class')
                    let matches =  /message-(\w{2,3})/g.exec(messageDivClass)
                    if(matches != null){
                        let message = {}
                        // let messageDivClass = matches[1]
                        let dateTimeSender = getDatetimeSender(messageDiv)
                        message.date = dateTimeSender[0]
                        message.time = dateTimeSender[1]
                        message.sender = dateTimeSender[2]
                        // let datetimeSenderMatches = /(\[.*\]) (.*):$/g.exec(datetimeSender)
                        let messageTypes = getMessageTypes(messageDiv)
                        message.text = messageTypes.includes('text') ? getMessageText(messageDiv) : null
                        message.isDeleted = messageTypes.includes('deleted') 

                        // let messageContent = getMessageDivContent(messageDiv, messageTypes)
                        // console.log('messageTypes = ' + messageTypes)
                        console.log(message)
                        console.log('\n')
                    }
                }
            })
        } catch(e) {
            console.log(e)
        }
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
