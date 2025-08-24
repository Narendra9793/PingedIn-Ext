console.log("PingedIn content script loaded.")
const baseAPI="https://pingedin.onrender.com/api/"
const Context={
    "type":"",
    "Messages":[]
}

const ReferralContext ={
    'file':"",
    'JobID':"",
    'JobDescription':"",

}

let isReplyButtonPressed=false;
let isFollowUpButtonPressed=false;
let isReferralButtonPressed=false;
let isWaiting=false;
let isDarkMode;

function handleWaitmethod(){
    const gButton=document.getElementById('pingedIn-ai-generate-button');
    if(isWaiting)gButton.innerHTML="Wait"
    const waitingInterval=setInterval(()=>{
        if(!isWaiting){
            gButton.innerHTML="Generate"
            clearInterval(waitingInterval);
        }
    }, [2000])
}
function handleWaitReferralmethod(){
    const refButton=document.getElementById('refButton');
    if(isWaiting)refButton.innerHTML="Please Wait"
    const waitingRefInterval=setInterval(()=>{
        if(!isWaiting){
            refButton.innerHTML="Generate"
            clearInterval(waitingRefInterval);
        }
    }, [2000])
}

function hideGenerationButton(){
    if(!document.getElementById("pingedIn-ai-generate-button")) return
    document.getElementById("pingedIn-ai-generate-button").remove();
}
function showGenerationButton(){
    const msgFormLeftpanel = getMsgFromLeftPanel(); 
    if (!msgFormLeftpanel) {
        // console.log("msg_form_left panel not found.");
        return;
    }

    const aiGenerateButton = createGeneratebutton(); 
    msgFormLeftpanel.insertBefore(aiGenerateButton, msgFormLeftpanel.lastChild); 
}

function cleanContext(){
    Context.type = "";
    Context.Messages = [];
}


async function handleReferralRequest() {
    // console.log("This is handleReferralRequest");

    // console.log(ReferralContext)
    isWaiting=true;
    handleWaitReferralmethod();
    const formData = new FormData();
    formData.append('JobDescription', ReferralContext.JobDescription);
    formData.append('JobId', ReferralContext.JobID);
    formData.append('file', ReferralContext.file);

    try {
        const response = await fetch(`${baseAPI}referral`, {
            method: 'POST',
            body: formData
        });

        // console.log(response)

        const result = await response.text();
        // console.log(result);
        handleSetResponse(result);
        isWaiting=false;

        // Reset context values (use setters if available)
        document.getElementById("menu-card")?.remove();
    
        ReferralContext.JobDescription = "";
        ReferralContext.JobID = "";
        ReferralContext.file = "";

    } catch (error) {
        console.error("Error while submitting referral:", error);
    }
}


function createReferralRequest(){
    const refButton=document.createElement('div')
    refButton.id="refButton"
    refButton.innerHTML="Generate"
    refButton.style.color="black"
    refButton.style.fontFamily = "Arial, sans-serif";
    refButton.style.fontWeight = "550";
    refButton.style.fontSize = "14px";
    refButton.style.backgroundColor = "#71b7fc";
    refButton.style.padding = "4px 10px";
    refButton.style.cursor = "pointer";
    refButton.style.borderRadius = "18px";
    refButton.addEventListener('click', ()=>{
        handleReferralRequest()
    })
    return refButton
}
function removeFileUploadButton(filename, size){
    const bPanel= document.getElementById('bPanel')
    const fButton=document.getElementById('fileUploadButton')
    const filesize=(size / 1024).toFixed(2) + ' KB';
    bPanel.replaceChild(createAttachmentPreview(filename, filesize), fButton);
}

function createAttachmentPreview(filename , size ) {
  const figure = document.createElement("figure");
  figure.className = "msg-form__attachment-preview";

  // File type indicator (PDF)
  const fileTypeDiv = document.createElement("div");
  fileTypeDiv.className = "text-body-xsmall-bold t-white msg-attachment-preview__attachment-type ui-attachment ui-attachment--pdf";
  figure.appendChild(fileTypeDiv);
  figure.style.width='75%'

  // figcaption
  const figcaption = document.createElement("figcaption");
  figcaption.className = "flex-1 overflow-hidden ph2";

  const titleRow = document.createElement("div");
  titleRow.className = "display-flex text-body-xsmall t-black--light";

  const fileNameEl = document.createElement("h3");
  fileNameEl.className = "text-body-xsmall-bold t-black--light truncate";
  fileNameEl.textContent = filename;

  const fileSizeEl = document.createElement("span");
  fileSizeEl.className = "msg-attachment-preview__bytesize flex-shrink-zero";
  fileSizeEl.textContent = size

  titleRow.appendChild(fileNameEl);
  titleRow.appendChild(fileSizeEl);

  const statusEl = document.createElement("p");
  statusEl.className = "text-body-xsmall t-black--light";
  statusEl.textContent = "Attached";

  figcaption.appendChild(titleRow);
  figcaption.appendChild(statusEl);
  figure.appendChild(figcaption);

  // Remove Button
  const removeButton = document.createElement("button");
  removeButton.className = "msg-attachment-preview__remove-attachment";
  removeButton.type = "button";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-hidden", "false");
  svg.setAttribute("aria-label", `Remove attachment ${filename}`);
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("viewBox", "0 0 16 16");

  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", "#close-small");
  svg.appendChild(use);

  removeButton.appendChild(svg);


  // Optionally add event listener to remove this preview
  removeButton.addEventListener('click', () => {

    const tryClickLinkedInRemoveButton = setInterval(() => {
        const LinkedFileRemoveButton = document.querySelector('.msg-attachment-preview__remove-attachment');
            if (LinkedFileRemoveButton) {
                // console.log("✅ Got LinkedFileRemoveButton");
                LinkedFileRemoveButton.click();
                clearInterval(tryClickLinkedInRemoveButton); // stop checking
            } else {
                console.log("❌ Still waiting for LinkedFileRemoveButton...");
            }
    }, 500); 
    const bPanel=document.getElementById('bPanel');
    bPanel.replaceChild(createFileUploaderButton(), figure)
    
  });

  figure.appendChild(removeButton);

  return figure;
}


function createFileUploaderButton() {
    const fileUploadButton = document.createElement('button');
    fileUploadButton.setAttribute('title', "Attach Resume twice, to Generate referral request.");
    fileUploadButton.setAttribute('aria-label', "Attach Resume twice, to Generate referral request.");
    fileUploadButton.type = 'button';
    fileUploadButton.id = "fileUploadButton";
    fileUploadButton.style.marginLeft = "12px";
    fileUploadButton.className = "msg-form__footer-action artdeco-button artdeco-button--tertiary artdeco-button--circle artdeco-button--muted m0";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("role", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "artdeco-button__icon");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("data-supported-dps", "16x16");
    svg.setAttribute("data-test-icon", "attachment-small");

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#attachment-small");
    svg.appendChild(use);
    fileUploadButton.appendChild(svg);

    // Create a hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf';  // Accept only PDF
    fileInput.style.display = 'none'; // Hide the input

    

    // Trigger input on button click
    fileUploadButton.addEventListener('click', () => {
        const tryClickLinkedInButton = setInterval(() => {
            const LinkedFileUploadButton = document.querySelector('button[aria-label^="Attach a file to your conversation"]');
            if (LinkedFileUploadButton) {
                // console.log("✅ Got LinkedFileUploadButton");
                LinkedFileUploadButton.click();
                clearInterval(tryClickLinkedInButton); // stop checking
            } else {
                console.log("❌ Still waiting for LinkedFileUploadButton...");
            }
        }, 500); // check every 500ms
        fileInput.click();
    });





    // Handle file selection
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            ReferralContext.file=file;
            removeFileUploadButton(file.name, file.size )
        }
    });

    // Append the file input to body so it exists in DOM
    fileUploadButton.appendChild(fileInput);

    return fileUploadButton;
}

function createJobIDBox(){
    const JobIDBox= document.createElement('div');
    
    JobIDBox.id='jobidbox'
  

    JobIDBox.style.margin='10px'


    const JobIDBoxText= document.createElement('textarea');
    JobIDBoxText.className="msg-form__contenteditable t-14 t-black--light t-normal flex-grow-1 full-width notranslate"
    JobIDBoxText.id='JobIDBoxText'
    JobIDBoxText.name='JobIDBoxText'
    JobIDBoxText.type='Text'
    JobIDBoxText.placeholder="Job ID here..."
    JobIDBoxText.style.height = "50px";
    JobIDBoxText.style.maxHeight = "40px"; 
    JobIDBoxText.style.minHeight = "40px"; 
    JobIDBoxText.style.width = "100%";


    if(!isDarkMode){
        JobIDBoxText.style.backgroundColor = "#f3f2ee"; 
        JobIDBoxText.style.color = "black";
    }
    else{
        JobIDBoxText.style.backgroundColor = "#364548";       // white or any other
        JobIDBoxText.style.color = "#fff"; 
    }
    JobIDBoxText.style.fontFamily = "Arial, sans-serif";
    JobIDBoxText.style.fontWeight = "400";
    JobIDBoxText.style.fontSize = "14px";
    JobIDBoxText.style.borderRadius='8px'

    JobIDBoxText.addEventListener('change', ()=>{
        ReferralContext.JobID=JobIDBoxText.value;
    })

    JobIDBox.appendChild(JobIDBoxText)

    return JobIDBox;
}

function createJobDescriptionBox(){
    const JobDescriptionBox = document.createElement('div');
    JobDescriptionBox.id = 'jobdescriptionbox';
    JobDescriptionBox.style.margin = '10px';
    
   

    const JobDescriptionBoxText = document.createElement('textarea'); // ✅ changed from input to textarea
    JobDescriptionBoxText.className = "msg-form__contenteditable t-14 t-black--light t-normal flex-grow-1 full-width notranslate";
    JobDescriptionBoxText.id = 'JobDescriptionBoxText';
    JobDescriptionBoxText.name = 'JobDescriptionBoxText';
    JobDescriptionBoxText.placeholder = "Job Description here...";
    JobDescriptionBoxText.style.height = "200px";        // default visible height
    JobDescriptionBoxText.style.maxHeight = "200px";     // maximum height
    JobDescriptionBoxText.style.overflowY = "auto";      // enable vertical scroll when needed
    JobDescriptionBoxText.style.resize = "vertical";     // optional: allow user to resize manually
    JobDescriptionBoxText.style.width = "100%";
    
    

    if(!isDarkMode){
        JobDescriptionBoxText.style.backgroundColor = "#f3f2ee"; 
        JobDescriptionBoxText.style.color = "black";
    }
    else{
        JobDescriptionBoxText.style.backgroundColor = "#364548";       // white or any other
        JobDescriptionBoxText.style.color = "#fff"; 
    }

    JobDescriptionBoxText.style.fontFamily = "Arial, sans-serif";
    JobDescriptionBoxText.style.fontWeight = "200";
    JobDescriptionBoxText.style.fontSize = "14px";
    JobDescriptionBoxText.style.borderRadius='8px'



    JobDescriptionBoxText.addEventListener('change', ()=>{
        ReferralContext.JobDescription=JobDescriptionBoxText.value;
    })
    JobDescriptionBox.appendChild(JobDescriptionBoxText);

    return JobDescriptionBox;
}


function createBottomPanel(){
    const bPanel=document.createElement('div');
    bPanel.id='bPanel'
    bPanel.style.display='flex'
    bPanel.style.justifyContent='space-between'
    bPanel.style.alignItems='center'
    bPanel.style.width='95%'
    bPanel.style.marginLeft='10px'

    const fileUploaderButton=createFileUploaderButton();
    bPanel.appendChild(fileUploaderButton);
    bPanel.appendChild(createReferralRequest());

    return bPanel
}

function RemoveSelectMessages(){
    Context.type = "";
    Context.Messages = [];
    hideGenerationButton()
    // console.log("This is Context", Context.Messages.length)
    const checkboxes = document.querySelectorAll('.msg-selectable-entity.msg-selectable-entity__checkbox-only.msg-selectable-entity--3');
    checkboxes.forEach((checkbox) => {
        checkbox.remove();
    });
}

function handleSetResponse(response) {
  const msgBox = document.querySelector(
    '.msg-form__contenteditable.t-14.t-black--light.t-normal.flex-grow-1.full-height.notranslate[contenteditable="true"][role="textbox"][dir="auto"][aria-multiline="true"][aria-label="Write a message…"]'
  );

  if (msgBox) {
    msgBox.innerHTML = `<p>${response}</p>`; // Safely inserts wrapped text
    msgBox.dispatchEvent(new InputEvent("input", { bubbles: true })); // Trigger LinkedIn's listeners
  } else {
    // console.warn("Message box not found");
  }
}


async function handleGenerateButton() {
    isWaiting=true;
    handleWaitmethod()
    let responseText = "";
    // console.log("Generation mode is ", Context.type);

    // Sort and concatenate messages
    Context.Messages.sort((a, b) => a.index - b.index);
    Context.Messages.forEach((message) => {
        responseText += message.msg;
    });

    // Prepare API data
    const data = {
        messageContent: responseText,
        messageType: Context.type
    };

    // console.log("Data to send:", data);

    const response = await fetch( `${baseAPI}message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const text = await response.text(); // properly await the response body
    handleSetResponse(text);
    RemoveSelectMessages();
    isWaiting=false;
}


function removeMessageToContext(item, index, type) {
    
    if (Context.Messages.length !== 0) {
        const allMessages = Context.Messages.filter((msg)=>{
            if(index !== msg.index)return msg;
        })
        Context.Messages= allMessages;
    }
}


function addMessageToContext(item, index, type) {
    
    const peraElement = item.querySelector('.msg-s-event-listitem__body.t-14.t-black--light.t-normal');
    if (peraElement) {
        const messageText = peraElement.textContent.trim();  // extract the actual text

        Context.type = type;
        Context.Messages.push({
            index: index,
            msg: messageText
        });
    }
    if(Context.Messages.length !== 0 && !document.getElementById("pingedIn-ai-generate-button"))showGenerationButton()
}


function createSelectable(item, index, type) {
  // Create the outer div
  const outerDiv = document.createElement("div");
  outerDiv.className = "msg-selectable-entity msg-selectable-entity__checkbox-only msg-selectable-entity--3";
  outerDiv.style.width='25px'
  outerDiv.style.height='25px'
   outerDiv.style.marginTop='2px'
  outerDiv.style.display = "flex";
  outerDiv.style.justifyContent = "center";
 outerDiv.style.alignItems = "center";
  

  // Create checkbox container
  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "msg-selectable-entity__checkbox-container";
  checkboxContainer.id = `container-${index}`;
  checkboxContainer.style.position = "absolute";
  checkboxContainer.style.right = "10px";
  checkboxContainer.style.height = "25px"; // made larger so checkbox is visible
  checkboxContainer.style.width = "25px";
  checkboxContainer.style.display = "flex";
  checkboxContainer.style.alignItems = "center";
  checkboxContainer.style.justifyContent = "center";

  // Create a unique ID for each checkbox
  const uniqueCheckboxId = `checkbox-${index}`;

  // Create the input checkbox
  const input = document.createElement("input");
  input.type = "checkbox";
  input.className = "ember-checkbox ember-view msg-selectable-entity__input simple-form";
  input.id = uniqueCheckboxId;



  // Create the label
  const label = document.createElement("label");
  label.id='my_label'
  label.className = "my_label";
  label.setAttribute("aria-label", `Unselect conversation ${index}`);
  label.setAttribute("for", uniqueCheckboxId); // associate with input



  // Create the circle itself
  const circle = document.createElement("div");
  circle.className = "msg-selectable-entity__checkbox-circle";
  circle.style.width = "25px";
  circle.style.height = "25px";
  circle.style.marginBottom="2px";

  // Append all elements
  checkboxContainer.appendChild(circle);
  checkboxContainer.appendChild(input);
  checkboxContainer.appendChild(label);
  outerDiv.appendChild(checkboxContainer);

      input.addEventListener('change', (event) => {
        if (event.target.checked) {
            // console.log(`Checkbox ${index} is checked`);
            addMessageToContext(item, index, type)
            // console.log("This is the length of context after selecting: " ,Context.Messages.length)
        } else {
            // console.log(`Checkbox ${index} is unchecked`);
            removeMessageToContext(item, index, type)
            if(Context.Messages.length === 0 && document.getElementById("pingedIn-ai-generate-button"))hideGenerationButton()
            // console.log("This is the length of context after removing: " ,Context.Messages.length)
        }
    });

  return outerDiv;
}

function SelectMessages(type){
    RemoveSelectMessages()
    const messageItems = document.querySelectorAll('.msg-s-message-list-content > li');
    messageItems.forEach((item, index) => {
        const messageBubble = item.querySelector('.msg-s-event-with-indicator.display-flex');
        if (messageBubble) {
            // anchor.style.position = 'relative'; 
            messageBubble.insertBefore(createSelectable(item, index, type), messageBubble.lastChild);

        } else {
            // console.warn('❗ Anchor not found in item:');
        }

    });


}

function getCloseButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "emoji-hoverable__close-btn artdeco-button artdeco-button--circle artdeco-button--muted artdeco-button--1 artdeco-button--tertiary ember-view";

    // Create SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("role", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("artdeco-button__icon");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("data-supported-dps", "16x16");
    svg.setAttribute("data-test-icon", "close-small");

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#close-small");
    use.setAttribute("width", "16");
    use.setAttribute("height", "16");

    svg.appendChild(use);
    button.appendChild(svg);

    // Create span
    const span = document.createElement("span");
    span.className = "artdeco-button__text";
    span.textContent = "Close Emoji Keyboard";

    button.appendChild(span);

    // Add click handler (optional)
    button.addEventListener("click", () => {
        document.getElementById("menu-card")?.remove(); // Closes the menu
    });

    return button;
}


const createMenuPanel=()=>{
    RemoveSelectMessages()
    const menu= document.createElement("div");

    menu.id="menu-card";
    menu.className="artdeco-card tenor-gif__search-popover display-flex flex-column tenor-gif__search-popover--overlay";


    // Add elements in desired order
    menu.appendChild(getCloseButton());
    menu.appendChild(createJobIDBox());
    menu.appendChild(createJobDescriptionBox());
    menu.appendChild(createBottomPanel());

    return menu;
}

const getMsgFromLeftPanel= ()=>{
    const selectors=[
        '.msg-form__left-actions'
    ]

    for(const selector of selectors){
        const msgForm= document.querySelector(selector);
        if(msgForm)return msgForm
        else return null
    }

}

const createAireplybutton = () => {
    // Check if the button already exists
    if (document.getElementById("pingedIn-ai-reply-button")) return;

    // Create button
    const aiReplyButton = document.createElement("button");
    aiReplyButton.id = "pingedIn-ai-reply-button";
    aiReplyButton.className = "msg-form__footer-action artdeco-button artdeco-button--tertiary artdeco-button--circle artdeco-button--muted m0 artdeco-button--1 artdeco-button--circle";
    aiReplyButton.style.width='50px';
    aiReplyButton.style.padding='10px 10px';
    aiReplyButton.setAttribute("type", "button");
    aiReplyButton.setAttribute("title", "Generate Reply with AI.");
    aiReplyButton.setAttribute("aria-label", "Generate Reply with AI.");

    // Create SVG icon
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("role", "button");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "artdeco-button__icon");
    svg.setAttribute("xmlns", svgNS);
    svg.setAttribute("width", "32");
    svg.setAttribute("height", "32");
    svg.setAttribute("viewBox", "0 0 24 24");



    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", "3");
    text.setAttribute("y", "15");
    text.setAttribute("fill", "#FFFFFFBF");
    text.setAttribute("font-size", "8");
    text.textContent = "Reply";
    text.setAttribute("font-family", "Helvetica, Arial, sans-serif");

    svg.appendChild(text);
    document.body.appendChild(svg);

    aiReplyButton.addEventListener("click", ()=>{
        isReplyButtonPressed=!isReplyButtonPressed;
        if(isReplyButtonPressed){
            SelectMessages('reply')
        }
        else{
            RemoveSelectMessages()
        }
        
    })


    // Append icon and text to button
    aiReplyButton.appendChild(svg);

    return aiReplyButton

} 
const createAiFollowUpbutton = () => {
    // Check if the button already exists
    if (document.getElementById("pingedIn-ai-follow-up-button")) return;

    // Create button
    const aiFollowUpButton = document.createElement("button");
    aiFollowUpButton.id = "pingedIn-ai-follow-up-button";
    aiFollowUpButton.className = "msg-form__footer-action artdeco-button artdeco-button--tertiary artdeco-button--circle artdeco-button--muted m0 artdeco-button--1 artdeco-button--circle";
    aiFollowUpButton.style.width='60px';
    aiFollowUpButton.style.padding='10px 10px';
    aiFollowUpButton.setAttribute("type", "button");
    aiFollowUpButton.setAttribute("title", "Generate followUp with AI.");
    aiFollowUpButton.setAttribute("aria-label", "Generate followUp with AI.");

    // Create SVG icon
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("role", "button");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "artdeco-button__icon");
    svg.setAttribute("xmlns", svgNS);
    svg.setAttribute("width", "60");
    svg.setAttribute("height", "32");
    svg.setAttribute("viewBox", "0 0 24 24");



    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", "-4");
    text.setAttribute("y", "15");
    text.setAttribute("fill", "#FFFFFFBF");
    text.setAttribute("font-size", "8");
    text.textContent = "FollowUp";
    text.setAttribute("font-family", "Helvetica, Arial, sans-serif");

    svg.appendChild(text);
    document.body.appendChild(svg);

    // Append icon and text to button
    aiFollowUpButton.appendChild(svg);
    aiFollowUpButton.style.marginLeft='15px'

    aiFollowUpButton.addEventListener("click", ()=>{
        isFollowUpButtonPressed=!isFollowUpButtonPressed;
        if(isFollowUpButtonPressed){
            SelectMessages('follow up')
        }
        else{
            RemoveSelectMessages()

        }
    })


    return aiFollowUpButton

} 
const createAiReferralbutton = () => {
    let existingBtn = document.getElementById("pingedIn-ai-Referral-button");
    if (existingBtn) return existingBtn; // ✅ return existing button instead of undefined

    const aiReferralButton = document.createElement("button");
    aiReferralButton.id = "pingedIn-ai-Referral-button";
    aiReferralButton.className =
        "msg-form__footer-action artdeco-button artdeco-button--tertiary artdeco-button--circle artdeco-button--muted m0 artdeco-button--1 artdeco-button--circle";
    aiReferralButton.style.width = "60px";
    aiReferralButton.style.padding = "10px";
    aiReferralButton.type = "button";
    aiReferralButton.title = "Generate Referral with AI.";
    aiReferralButton.setAttribute("aria-label", "Generate Referral with AI.");

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "artdeco-button__icon");
    svg.setAttribute("xmlns", svgNS);
    svg.setAttribute("width", "50");
    svg.setAttribute("height", "32");
    svg.setAttribute("viewBox", "0 0 24 24");

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", "-2");
    text.setAttribute("y", "16");
    text.setAttribute("fill", "#FFFFFFBF");
    text.setAttribute("font-size", "8");
    text.setAttribute("font-family", "Helvetica, Arial, sans-serif");
    text.textContent = "Referral";

    svg.appendChild(text);
    aiReferralButton.appendChild(svg);
    aiReferralButton.style.marginLeft = "15px";

    return aiReferralButton;
};


const createGeneratebutton = () => {
    // Check if the button already exists
    if (document.getElementById("pingedIn-ai-generate-button")) return;

    // Create button
    const aiGenerateButton = document.createElement("button");
    aiGenerateButton.id = "pingedIn-ai-generate-button";
    aiGenerateButton.className = "aiGenerateButton";
    aiGenerateButton.innerHTML="Generate"
    aiGenerateButton.style.color="black"
    aiGenerateButton.style.fontFamily = "Arial, sans-serif";
    aiGenerateButton.style.fontWeight = "500";
    aiGenerateButton.style.fontSize = "12px";
    aiGenerateButton.style.backgroundColor = "#71b7fc";
    aiGenerateButton.style.padding = "2px 5px";
    aiGenerateButton.style.cursor = "pointer";
    aiGenerateButton.style.borderRadius = "18px";
    aiGenerateButton.style.marginLeft = "10px";
    aiGenerateButton.style.marginTop = "6px";
    aiGenerateButton.style.height = "22px";
    aiGenerateButton.addEventListener('click', ()=>{
        handleGenerateButton();
    })

    return aiGenerateButton

}
 
 
const injectButton = () => {
    // console.log("In injectButton function!")

    const existingButton = document.querySelector(".ai-button");
    if (existingButton) existingButton.remove();

    const msgFormLeftpanel = getMsgFromLeftPanel(); 
    if (!msgFormLeftpanel) {
        // console.log("msg_form_left panel not found.");
        return;
    }

    // console.log("msg_form_left panel found. Creating All buttons.");
    const aiReplyButton = createAireplybutton();
    const aiFollowUpButton = createAiFollowUpbutton(); 
    const aiReferralButton = createAiReferralbutton(); 


    aiReferralButton.addEventListener("click", ()=>{
        isReferralButtonPressed=!isReferralButtonPressed
        if(isReferralButtonPressed){
            msgFormLeftpanel.appendChild(createMenuPanel())
        }
        else{
            document.getElementById("menu-card")?.remove();
        }
    });

    if (aiReplyButton) {
        msgFormLeftpanel.insertBefore(aiReplyButton, msgFormLeftpanel.lastChild);
    }
    if (aiFollowUpButton) {
        msgFormLeftpanel.insertBefore(aiFollowUpButton, msgFormLeftpanel.lastChild);
    }
    if (aiReferralButton) {
        msgFormLeftpanel.insertBefore(aiReferralButton, msgFormLeftpanel.lastChild);
    }
    
    applyTheme();

};


const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);

    const hasMsgFormElement = addedNodes.some((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return (
          node.matches('.msg-form__left-actions') ||
          node.querySelector('.msg-form__left-actions')
        );
      }
      return false;
    });

    if (hasMsgFormElement) {
    //   console.log("✅ LinkedIn message form footer detected.");
      setTimeout(injectButton, 500);
    }
  }
});

// Start observing DOM changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});


function applyTheme() {
    console.log("in applyTheme")
  const html = document.documentElement;
  isDarkMode =  html.classList.contains("theme--dark") || html.classList.contains("theme--dark-lix");
  console.log("System has darkmode?", isDarkMode)

  const aiReplybuttontext = document.getElementById("pingedIn-ai-reply-button").querySelectorAll("svg text"); 
  const aiFollowUpbuttontext = document.getElementById("pingedIn-ai-follow-up-button").querySelectorAll("svg text"); 
  const aiReferralbuttontext = document.getElementById("pingedIn-ai-Referral-button").querySelectorAll("svg text"); 

  const JobIDBoxText = document.getElementById("JobIDBoxText"); 
  const JobDescriptionBoxText = document.getElementById("JobDescriptionBoxText"); 


  if (aiReplybuttontext || aiFollowUpbuttontext || aiReferralbuttontext) {
    if (!isDarkMode) {
        aiReplybuttontext[0].setAttribute("fill", "black");
        aiFollowUpbuttontext[0].setAttribute("fill", "black");
        aiReferralbuttontext[0].setAttribute("fill", "black");

        JobDescriptionBoxText.style.backgroundColor = "#f3f2ee"; 
        JobDescriptionBoxText.style.color = "black";  

        JobIDBoxText.style.backgroundColor = "#f3f2ee";      
        JobIDBoxText.style.color = "black";  

    } else {
      aiReplybuttontext[0].setAttribute("fill", "#FFFFFFBF");
      aiFollowUpbuttontext[0].setAttribute("fill", "#FFFFFFBF");
      aiReferralbuttontext[0].setAttribute("fill", "#FFFFFFBF");

        JobDescriptionBoxText.style.backgroundColor = "#364548";  
        JobDescriptionBoxText.style.color = "#fff";  

        JobIDBoxText.style.backgroundColor = "#364548";    
        JobIDBoxText.style.color = "#fff";  
    }
  }
}



// Watch for class changes on <html>
const observer2 = new MutationObserver(() => {
  applyTheme();
});

observer2.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"]
});




