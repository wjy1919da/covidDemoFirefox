var $ = document.querySelector.bind(document)
$("#btnHighlight").onclick = e => {
	browser.runtime.sendMessage({
      'message': 'optionsFromPopup',
      'optionValue': options
    });
}

$("#btnReset").onclick = e => {
	browser.runtime.sendMessage({
    'message': 'optionsFromPopup',
    'optionValue': -1
  });
}

$("#login").onclick = e => {
   const email = document.querySelector('#email').value;
   const password = document.querySelector('#password').value;
   console.log("email: ",email)
   console.log("password: ",password)
	browser.runtime.sendMessage({
      'message': 'EmailAuth',
      'email': email,
      'password':password
  });
}
// Get references to the dropdown list and "More" button
var btnOptions = document.getElementById("btnOptions");
var btnOptionB = document.getElementById("btnOptionB");
// Hide the "More" button initially
btnOptionB.style.display = "none";

// // Add a click event listener to the "More" button
// btnOptionB.addEventListener("click", function() {
//   // Show or hide the remaining options in the dropdown list when the "More" button is clicked
//   var moreOptions = document.querySelectorAll("option[value='hideContent'], option[value='hideButton']");
//   for (var i = 0; i < moreOptions.length; i++) {
//     moreOptions[i].style.display = moreOptions[i].style.display === "none" ? "" : "none";
//   }
// });
let options = 0;
// options 3: replaceContent, 2:highlight
// Add a change event listener to the dropdown list
btnOptions.addEventListener("change", function() {
  // Perform an action based on the selected option
  options = btnOptions.selectedIndex;
  console.log("options :",options);
});

function updatePopup(authString) {
  console.log("auth return from background: ", auth);
  const emailDisplay = document.getElementById("email")
  const passwordDisplay = document.getElementById("password")
  const loginDisplay = document.getElementById("login")
  const highlightDisplay = document.getElementById("btnHighlight")
  const resetDisplay = document.getElementById("btnReset")
  const labelDisplay = document.getElementById("lblHighlight")
  const optionsDiv = document.getElementById("btnOptionsDiv");
  
  if (auth === true) {
    console.log("change popup UI auth is!!!!!!!!", auth)
    highlightDisplay.style.display = 'inline'
    resetDisplay.style.display  = 'inline'
    labelDisplay.style.display = 'inline'
    optionsDiv.style.display = 'inline';
    emailDisplay.style.display = 'none';
    passwordDisplay.style.display = 'none';
    loginDisplay.style.display = 'none';
    
   
  }else if(auth === false){
    console.log("change popup UI auth is!!!!!!!!", auth)
    highlightDisplay.style.display = 'none'
    resetDisplay.style.display  = 'none'
    labelDisplay.style.display = 'none'
    optionsDiv.style.display = 'none';
    emailDisplay.style.display = 'inline';
    passwordDisplay.style.display = 'inline';
    loginDisplay.style.display = 'inline';
    
    
  }else{
    console.log("auth load error")
  }
}

browser.runtime.sendMessage({
  message: "popupAuthRequest"
  }, (response) => {
  console.log("Auth response from background", response);
});

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //console.log("pop get auth back!!!!!",request.data,"type is",typeof request.data)
    if ('AuthFromBackground' === request.message) {
      sendResponse({ status: 'success' });
      let authString = request.data;
      auth = JSON.parse(authString);
      console.log("change auth to bool: ",auth)
      updatePopup(auth);
    }
    if('AuthUpdateFromBackground'=== request.message){
      sendResponse({ status: 'success' });
      console.log("auth update start....")
      let authString = request.data;
      auth = JSON.parse(authString);
      console.log("auth update: ",authString)
      updatePopup(auth);
    }
});  
