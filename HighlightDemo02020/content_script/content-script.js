// define a maplist of {node,content}
const arrayAnalyNode = [{
			content: null,
			nodes: null
        }]
// capture the click actities
let activities = [];
document.addEventListener('click', function(event) {
    console.log("click function is called!!!!")
    activities.push({ 
      action: 'click', 
      element: event.target.tagName,
      time: Date.now() 
    });
    console.log("target------: ",event.target)
    
    for(var i = 0; i < activities.length; i++){
        console.log("actities:  ",activities[i])
    }
    browser.runtime.sendMessage({ type: 'userClickActivity', data: activities }).then(function (response) {
        console.log("response from userClickActivity background: ",response);
    });
    event.target.focus()
});
// capture the input function
// Add an event listener to each input and textarea element on the page
// const inputElements = document.querySelectorAll('input, textarea');
// let inputActivity = [];
// inputElements.forEach(function(input) {
//     console.log("inputElement: ",input)
//     input.addEventListener('input', function(event) {
//     // The input event has been fired, do something here...
//     console.log("input event time: ",Date.now())
//     console.log('Input event captured:', event.target.value);
//   });
// });

// const inputElements = document.querySelectorAll('input, textarea');

// // Loop through each input element and add an event listener for the "keydown" event
// inputElements.forEach(function(inputElement) {
//   console.log("input elements: ",inputElement)
//   inputElement.addEventListener('keydown', function(event) {
//     console.log("keydown is called !!!")
//     if (event.key === 'Enter') {
//       console.log('Input event captured:', event.target.value);
//     }
//   });
// });

// document.addEventListener('keydown', (event) => {
//   const keyName = event.key;

//   if (keyName === 'Control') {
//     // do not alert when only Control key is pressed.
//     return;
//   }

//   if (event.ctrlKey) {
//     // Even though event.key is not 'Control' (e.g., 'a' is pressed),
//     // event.ctrlKey may be true if Ctrl key is pressed at the same time.
//     //alert(`Combination of ctrlKey + ${keyName}`);
//   } else {
//     //alert(`Key pressed ${keyName}`);
//   }
// }, false);

// document.addEventListener('keyup', (event) => {
//   const keyName = event.key;

//   // As the user releases the Ctrl key, the key is no longer active,
//   // so event.ctrlKey is false.
//   if (keyName === 'Control') {
//     //alert('Control key was released');
//   }
// }, false);

let isHighLight = false ;

browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if ('returnOptions' === request.message) {
		sendResponse('send this：'+JSON.stringify(request));
        // Get the text content of browser website and send it to background
		if (request.isHighLight !== isHighLight){
			isHighLight = request.isHighLight
			//removeHighlights(document.body)
			analysisDomText(isHighLight,document.body)
		}
		
	}
    // if "isHighlight button is on"
	// 接收api返回的keywords
	if ('returnKeywords' === request.message) {
		sendResponse('send this：'+JSON.stringify(request));
        
        //console.log("groupID: ",request.groupID)
		//Then update the website UI 
		updateHtmlPage({'keywords':request.keywords,'groupID':request.groupID})
        
	}
	
});		
function analysisDomText(isHighLight,node){
	let index = 0 	
   		
    function getContentText(node){
        
        if (node.nodeType === Node.TEXT_NODE) {
			
            if (node.parentNode == null && node.parentNode.nodeName === 'TEXTAREA') {
               return;
            }
            let content = node.textContent;
            // 此处加过滤
			var notNum = !(/^\d+(\.\d+)?$/.test(content))
			//console.log(notNum,content)
			var notAlt = content.slice(0,1) !== '@'
			//console.log(notAlt,content)
            if( content!==null && content.trim().length > 3 && notNum && notAlt ){ 
                try{   
                    //var clonedNode = node.cloneNode(true);
					arrayAnalyNode[index]
					
					const nodeInfo = {
						 content: null,
			             nodes:null,
						 highlighted:false
                    }
					//let process = node.parentElement.getAttribute('high_processed')
					//let highlighted_pro = node.parentElement.getAttribute('highlighted')
					//console.log('process ',process)
					//console.log('highlighted_pro ',highlighted_pro)
					//if (process === null && highlighted_pro === null ){
						
					node.parentElement.setAttribute('high_processed', 1)
					
					arrayAnalyNode.push(nodeInfo)
					arrayAnalyNode[index].content = content
					arrayAnalyNode[index].nodes=node
					
					
					//console.log(node)
					// console.log(content,node.parentElement.hidden)
					index++
					//}

                }catch (error) {
                    console.log(error);
                }   
            }
        }else{
			if (1 === node.nodeType && !/(script|style|textarea)/i.test(node.tagName) && node.childNodes){
				for (let i = 0; i < node.childNodes.length; i++) {
					getContentText(node.childNodes[i]);
				}    
			}
        }
    }
    if(isHighLight){
        // traverse all the node of DOM
		
        getContentText(node);
        /*
            Put the text content of each node into a list and send it to background, when we got the
            keyword list back from background.js, we can get the node by the maplist of {node,content}
            then we can change the UI or the content of the node

        */
		let arrayAnalyText = arrayAnalyNode.map(ptt => ptt.content)
        // arrayAnalyText.forEach(element => {
            // console.log("array: ",element);
        // });
		browser.runtime.sendMessage({ type: 'arrayAnalyText', data: arrayAnalyText }).then(function (response) {
            console.log("response from arrayAnalyText background: ",response);
        });
    }else{
		removeHighlights(document.body)
	}		
	
	
    
}

function removeHighlights(node) {
		let span;

		while ((span = node.querySelector('span.highlighted'))) {
		  span.outerHTML = span.innerHTML;
		}

		occurrences = 0;
    }

let count = 0 ;
const observer = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
	  if (mutation.addedNodes && mutation.addedNodes.length > 0) {
		for (let i = 0; i < mutation.addedNodes.length; i++) {
		  const newNode = mutation.addedNodes[i];
		//   arrayAnalyNode = [{
		// 	content: null,
		// 	nodes: null
		//   }]
		  //arrayAnalyNode = [] 
		  analysisDomText(isHighLight,newNode)
		}
	  }
	});
  });
observer.observe(document.body, {
	childList: true,
	subtree: true
});
  
  
// // receive the data back from background
// browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     console.log("content scirpt get data back!!!!!")
//     if ('BackgroundReturnData' === request.message) {
//       console.log("data return from background: ",request.data);
//       sendResponse({ status: 'success' });
//     }
// });  

// {keyword:groupID,
//keyword:groupID}
// update the UI of node here
function updateHtmlPage(options){
    let keywords = options.keywords;
	//console.log('updateHtmlPage ',options.keywords)
    let index = 0;
    function highlight(node,pos,keyword,options,style){
        //console.log("highlight is called ---------------------------")
        let span = document.createElement('span');
        span.className = 'highlighted' + ' ' + (options.subtleHighlighting ? 'subtle ' : '') + 'style-' + style;
        //console.log("span.className",span.className)
        span.style.color = options.foreground;
        span.style.backgroundColor = options.background;
		
        let highlighted = node.splitText(pos);
        highlighted.splitText(keyword.length);
        let highlightedClone = highlighted.cloneNode(true);
        span.appendChild(highlightedClone);
        highlighted.parentNode.replaceChild(span, highlighted);
		//node.parentElement.setAttribute('highlighted', true)
        index++
    }
    for(var i = 0;i<arrayAnalyNode.length;i++){
        let content = arrayAnalyNode[i].nodes.textContent.toLowerCase() 
		
	    //let ppt = arrayAnalyNode[i].nodes.parentElement.getAttribute('highlighted')
		//console.log('ppt',ppt)
		//console.log('arrayAnalyNode[i].nodes ',arrayAnalyNode[i].nodes.parentElement)
		
		//if (ppt)  continue ;
        for(let j = 0; j < keywords.length; j++){
			
            let keyword = keywords[j].toLowerCase();

            let pos = content.indexOf(keyword);

            if(0 <= pos){
				arrayAnalyNode[i].highlighted = true 
                highlight(arrayAnalyNode[i].nodes, pos, keyword, options, String(i).slice(-1));  
            }
        }
    }
   
}




