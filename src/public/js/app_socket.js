const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);


function makeMessage(type, payload){
    const msg = {type, payload};
    return JSON.stringify(msg);
}

function handleOpen(){
    console.log("Connected to Server O")
}

socket.addEventListener("open",()=>{
    console.log("Connected to Browser ");
});

socket.addEventListener("message",(message)=>{
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

socket.addEventListener("close",() =>{
    console.log("DisConnected to Server X ");
});

function handleMessageSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message",input.value));
    input.value = "";
}

function handlenickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname",input.value));
}

messageForm.addEventListener("submit", handleMessageSubmit);
nickForm.addEventListener("submit", handlenickSubmit);