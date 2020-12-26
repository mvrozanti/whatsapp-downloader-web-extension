document.getElementById("downloadButton").addEventListener('click', () => {
    console.log("Popup DOM fully loaded and parsed");
    function modifyDOM() {
        function getElementByXpath(path) {
          return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        }
        var nome = document.getElementsByTagName('header')[1].getElementsByTagName('span')[1].textContent;
        // console.log('v1');
        console.log('nome: '+ nome);
        var mainConversationArea = document.querySelector('#main');
        var mainConversationDiv = document.querySelector('#main').getElementsByTagName('div')[2];
        var messageList = getElementByXpath('/html/body/div[1]/div/div/div[4]/div/div[3]/div/div/div[3]')

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
