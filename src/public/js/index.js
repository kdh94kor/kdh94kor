const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open",()=>{
    console.log("Connected to Browser ");
});

socket.addEventListener("message",(message)=>{
    console.log("New message: ", message.data);
});

socket.addEventListener("close",() =>{
    console.log("DisConnected to Server X ");
});

setTimeout(() => {
    socket.send("hello from the broser!");
},10000);