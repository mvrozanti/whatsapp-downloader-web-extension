// https://stackoverflow.com/questions/23895377/sending-message-from-a-background-script-to-a-content-script-then-to-a-injected
function modifyDOM() {
  var weekDays = [ "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY" ]

  function getElementByXpath(path) { return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue }

  function getMainConversationDiv(){
    return getElementByXpath('/html/body/div[1]/div/div/div[4]/div/div[3]/div/div')
  }

  var lastScroll = null
  getMainConversationDiv().onscroll = function(){
    lastScroll = new Date().getTime()
  }

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

  function isLoadingMessages(){
    return document.body.innerHTML.indexOf('loading messages') > -1
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
      let spansOfMessageDiv = [].slice.call(messageDiv.getElementsByTagName('span'), 0)
      for(let i=0;i<spansOfMessageDiv.length;i++){
        let spanOfMessageDiv = spansOfMessageDiv[i]
        if(spanOfMessageDiv.hasAttribute('aria-label')){
          sender = spanOfMessageDiv.getAttribute('aria-label')
          sender = sender.substring(0, sender.length-1)
          break
        }
      }
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

  function getDateForLastOccurence(strDay) {
    var date = new Date()
    var index = weekDays.indexOf(strDay)
    var difference = date.getDay() - index
    if(difference < 0) 
      difference = -7 - difference
    date.setDate(date.getDate() + difference)
    return date
  }

  function getCurrentDate(){
    let today = new Date()
    let dd = String(today.getDate()).padStart(2, '0')
    let MM = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
    let yyyy = today.getFullYear()
    today = dd + '/' + MM + '/' + yyyy
    return today
  }

  function getMessageTypes(messageDiv){
    let types = []
    if(messageDiv.querySelectorAll('.selectable-text.invisible-space.copyable-text').length > 0)
      types.push('text')
    if(messageDiv.querySelectorAll('span[data-icon="recalled"]').length > 0)
      types.push('deleted')
    if(messageDiv.querySelectorAll('img').length > 0)
      types.push('image')
    return types
  }

  function getMessageText(messageDiv){
    return messageDiv.querySelector('.selectable-text.invisible-space.copyable-text').textContent
  }

  async function getMessageImage(messageDiv){
    var blob = await fetch(messageDiv.querySelectorAll('img')[1].src).then(r => r.blob()) 
    return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = function() { resolve(reader.result) }
    })
  }

  function getChatTitle(){
    return document.querySelector('header span[title]').textContent
  }

  function keepScrolling(){
    let mainConversationArea = getMainConversationDiv()
    if(mainConversationArea.scrollTop > 0 || isLoadingMessages())
      mainConversationArea.scrollTop = 0
    setTimeout(keepScrolling, 1000)
    if(lastScroll != null && new Date().getTime() - lastScroll > 6000){
      console.log('SCROLLED TO TOP FOR SURE')
      console.log('NOW ABLE TO RETURN FROM modifyDOM')
      // somehow getMessages and return from modifyDOM
    }
  }

  let mainConversationArea = getMainConversationDiv()

  function getMessages(){
    let messages = []
    
    try {
      Array.prototype.forEach.call(document.getElementsByTagName('div'), function(messageDiv){
        if(messageDiv.hasAttribute('class')){
          let messageDivClass = messageDiv.getAttribute('class')
          let matches =  /message-(\w{2,3})/g.exec(messageDivClass)
          if(matches != null){
            let message = {}
            let dateTimeSender = getDatetimeSender(messageDiv)
            message.date = dateTimeSender[0]
            message.time = dateTimeSender[1]
            message.sender = dateTimeSender[2]
            let messageTypes = getMessageTypes(messageDiv)
            message.text = messageTypes.includes('text') ? getMessageText(messageDiv) : null
            if(messageTypes.includes('image'))
              getMessageImage(messageDiv).then(r => message.image = r)
            else
              message.image = null
            message.isDeleted = messageTypes.includes('deleted') 
            messages.push(message)
          }
        }
      })
    } catch(e) {
      console.error(e)
    }
    return messages
  }

  setTimeout(keepScrolling, 0)
  // return { 'chatTile': getChatTitle(), 'messages': getMessages() }
  return//<whatever is after keepScrolling>
}

function saveFile(filename, content){
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const objectURL = URL.createObjectURL(blob)
  browser.downloads.download({
      url: objectURL,
      filename: filename,
      saveAs: true,
      conflictAction: 'overwrite'
  })
}

async function onMessage(message){
  switch(message.type){
    case 'saveFile': {
        const fileName = message.data.filename
        const fileContent = message.data.content
        saveFile(fileName, fileContent)
        return
    }
  }
}

async function notify(message) {
  browser.notifications.create({
      "type": "basic",
      "title": "WhatsApp Downloader",
      "message": message
  })
}

browser.runtime.onMessage.addListener(onMessage)

browser.browserAction.onClicked.addListener(() => {
  chrome.tabs.executeScript({
      code: '(' + modifyDOM + ')()'
  }, (chat) => {
    console.log('RESULTS:')
    console.log(chat)
    // saveFile('kek', chat)
  })
})
