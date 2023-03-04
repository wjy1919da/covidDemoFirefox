function updatePopup(authString) {
    auth = Boolean(authString)
    console.log("auth return from background: ",typeof auth);
    if (auth === true) {
      const loginDisplay = document.getElementById("loginWindow")
      loginDisplay.style.display = 'block';
      const highlightDisplay = document.getElementById("highlightWindow")
      highlightDisplay.style.display = 'inline';
    } else if(auth=== false) {
      const loginDisplay = document.getElementById("loginWindow")
      loginDisplay.style.display = 'inline';
      const highlightDisplay = document.getElementById("highlightWindow")
      highlightDisplay.style.display = 'block';
    }else{
      console.log("popup load error!!")
    }
}

browser.runtime.sendMessage({
  message: "popupAuthRequest"
}, (response) => {
  console.log("Auth response from background", response);
});

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("pop get auth back!!!!!")
  if ('AuthFromBackground' === request.message) {
    sendResponse({ status: 'success' });
    let auth = request.data;
    
    updatePopup(auth);
  }
});  