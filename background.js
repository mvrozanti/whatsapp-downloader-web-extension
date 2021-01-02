// https://stackoverflow.com/questions/23895377/sending-message-from-a-background-script-to-a-content-script-then-to-a-injected
function modifyDOM() {
  console.log('scraping ')
  var weekDays = [ "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY" ]

  function getElementByXpath(path) { return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue }

  function getMainConversationDiv(){
    return getElementByXpath('/html/body/div[1]/div/div/div[4]/div/div[3]/div/div')
  }

  function getElementsByXpath(path) { return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null) }

  function getDateBaloons(messageDiv){
    messageDiv.parentElement.parentElement.scrollBy(0,-1) // makes date baloon appear
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

  function isLoadingMessages(){ return document.body.innerHTML.indexOf('loading messages') > -1 }

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
        if(date == null){
          let firstAfterSecond = isFirstAfterSecond(messageDiv, balloonArray[i])
          if(firstAfterSecond){
            date = balloonArray[i].textContent
          } else if(firstAfterSecond == null){
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

  function clickButton(div){
    div.querySelector('button').click()
  }

  async function getMessageImage(messageDiv){
    let imgSrcs = messageDiv.querySelectorAll('img')
    // let imgSrc = null
    // if(imgSrcs.length < 2){
    //   console.log("imgSrcs < 2")
    //   console.log(messageDiv)
    //   console.log(imgSrcs)
    //   clickButton(messageDiv)
    // }
    imgSrc = imgSrcs[1]
    if(imgSrc){
      var blob = await fetch(imgSrc.src).then(r => r.blob()).catch(console.log)
      return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = function() { resolve(reader.result) }
      })
    }
  }

  function getChatTitle(){
    return document.querySelector('header span[title]').textContent
  }

  var lastScroll = null
  var doneScrolling = false
  getMainConversationDiv().onscroll = function(){ lastScroll = new Date().getTime() }

  function keepScrolling(resolve){
    if(doneScrolling)
      return
    let mainConversationArea = getMainConversationDiv()
    if(mainConversationArea.scrollTop > 0 || isLoadingMessages())
      mainConversationArea.scrollTop = 0
    setTimeout(keepScrolling, 1000, resolve)
    if(lastScroll != null && new Date().getTime() - lastScroll > 6000){
      doneScrolling = true
      getChat(resolve)
    }
  }

  function getChat(resolve){
    let messages = []
    
    try {
      var promises = []
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
              promises.push(getMessageImage(messageDiv).then(r => message.image = r).catch(console.log))
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

    Promise.all(promises).then(_ => {
      resolve({'title': getChatTitle(), 'messages': messages})
    }).catch(err => console.log(err));
  }

  return new Promise((resolve, reject)=>{
    keepScrolling(resolve)
  })
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
      code: '(' + modifyDOM + ')()',
  }, (chatPromise) => {
    // alert('!')
    // console.log('works')
    // console.log(chatPromise)

    // .then(()=>{
    //   console.log('RESULTS:')
    //   console.log(chat)
    // })
      
      saveFile('whatsapp-' + chatPromise[0].title + '.json', JSON.stringify(chatPromise[0]))
  })
})
