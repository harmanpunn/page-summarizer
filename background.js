init = (tab) => {
    const {id, url} = tab;
    console.log(`Loading: ${url}`); 
    chrome.scripting.executeScript({
        target: { tabId: id, allFrames: true },
        files: ["content.js"]
      });
}

chrome.action.onClicked.addListener(tab => { 
    init(tab);
  });

