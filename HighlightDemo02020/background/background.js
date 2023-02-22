function getKey(item){
	console.log(item.isHighLight)
}
function onError(error) {
  console.log(error)
}
// Asynchronous Method Invocation
function loadStorage(key){
	console.log("key is: ",key)
	browser.storage.local.get(key).then(getAuth, onError);
}
// fake keywords list
keywords = ["Wednesdays","What","Accessibility","Latest","dynamite"]

// Inject the content script into the active tab of the current window
try{
	browser.tabs.executeScript({file: "content-script.js"});
}catch(error){
	console.log(error)
}

// receive node
browser.runtime.onMessage.addListener(function(request, sender) {
     // This message is recived from 'content.js' and 'popup.js'.
	 //if the page need to be highligt
	if ('highLightPage' === request.message) {

		let isHighLight = request.highLight
        try {
			browser.storage.local.set({'isHighLight': isHighLight});
		} catch (error) {
			console.log(error);
		}
		chrome.tabs.query(
			{ 
			   active: true, 
			   currentWindow: true
			},
			// send keyword and options to content
			function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {
					'message': 'returnOptions',
					'isHighLight': isHighLight
					},
					function(response) {
						console.log('receive from highlight content reponse: ',response);
					}
				);
			}
		);
	}
// Auth
	if ('EmailAuth' === request.message) {
		let email = request.email;
		let password = request.password;
		try {
			browser.storage.local.set(
				{'email': email,'password':password,'authentication':true}
			);
		} catch (error) {
			console.log(error);
			return;
		}
		// update the auth after email is added
		browser.runtime.sendMessage({
			message: "AuthUpdateFromBackground",
			data: true
		}, (response) => {
			console.log("Auth update response from popup", response);
		});		
	}
	if('popupAuthRequest'===request.message){
		browser.storage.local.get('authentication').then(result => {
			let auth = result.authentication;
			try{
				browser.runtime.sendMessage({
					message: "AuthFromBackground",
					data: auth
				}, (response) => {
					console.log("Auth response from popup", response);
				});	
			}catch(error){
				console.log("load error: ",error)
			}
		});
		
	}
	
});


// listen the content data from content script
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.type === 'arrayAnalyText') {
	  console.log("request data of text content",request.data);
	  sendResponse({ status: 'success' });
	  // Do something with the data
	  let TextContentList = request.data;
	  TextContentList.forEach(element => {
		console.log("background list: ",element);
	 });
	 // send back to content script
	 try{
		  chrome.tabs.query(
			{ 
			   active: true, 
			   currentWindow: true
			},
			function(tabs) {
				//console.log('getKeywords')
				chrome.tabs.sendMessage(tabs[0].id, {
					'message': 'returnKeywords',
					'keywords':keywords,
					'groupID': false
					},
					function(response) {
						console.log('receive from keyword content reponse: ',response);
					}
				);
			}
		);
    
	 }catch(error){
		console.log(error)
	 }	 
	}
// user click actity 
	if (request.type === 'userClickActivity') {
		console.log("userClickActivity data of text content",request.data);
		sendResponse({ status: 'success' });
		let userActities = request.data;
		userActities.forEach(element => {
		  console.log("userActities background list: ",element);
	   });
	   try{
		// set user acitities into extension storage
		browser.storage.local.set({ userActities });

	   }catch(error){
			console.log("set actities error",error)
			return;
	   }
	}

  });
// update HTML
if ('showOccurrences' === request.message) {
    let showOccurrences = localStorage.getItem('showOccurrences');

    showOccurrences = 'true' === showOccurrences || null === showOccurrences;
// 刷新？？
    browser.browserAction.setBadgeText({
      'text': showOccurrences && request.occurrences ? String(request.occurrences) : '',
      'tabId': sender.tab.id
    });
  }


// whether the login window is displayed
browser.storage.local.get('email').then(result => {
	console.log("background start set auth.....")
    const getEmail = result.email;
    console.log("background get email: ",getEmail)
	let auth = false;
	let authString = auth.toString();

	if(typeof getEmail === 'undefined'){
		browser.storage.local.set({'authentication': authString});
		console.log("background set auth: ",authString)
	}else{
		auth = true;
		authString = auth.toString();
		browser.storage.local.set({'authentication': authString});
		console.log("background set auth: ",authString)
	}
	
});

  


