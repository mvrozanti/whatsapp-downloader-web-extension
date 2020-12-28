browser.runtime.onMessage.addListener(onMessage);

async function onMessage(message){
  switch(message.type){
  case 'saveFile': {
      const fileName = message.data.filename
      const fileContent = message.data.content
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' })
      const objectURL = URL.createObjectURL(blob)
      browser.downloads.download({
          url: objectURL,
          filename: fileName,
          saveAs: true,
          conflictAction: 'overwrite'
      })
      return
  }
}}

async function notify(message) {
  browser.notifications.create({
      "type": "basic",
      "title": "WhatsApp Downloader",
      "message": message
  })
}
