const socket = io(); //socket.io를 실행하고 있는 서버를 알아서 찾아줌

const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form");
const room = document.getElementById("room");


room.hidden = true;

let roomName;

function AddMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () =>{
        AddMessage(`나 : ${value}`);
        input.value = "";
    });
};

function handlenicknameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname",input.value);
};

function Enter_Room(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `방 : ${roomName}`;

    const msgform = room.querySelector("#msg");
    const nameform = room.querySelector("#name");
    msgform.addEventListener("submit", handleMessageSubmit);
    nameform.addEventListener("submit", handlenicknameSubmit);
};

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, Enter_Room);  // socket.send
    roomName = input.value;
};

form.addEventListener("submit",handleRoomSubmit);


socket.on("welcome",(user, UserCount) =>{
    const h3 = room.querySelector("h3");
    h3.innerText = `방 : ${roomName} (${UserCount})`;
    AddMessage(`새로운 대화상대(${user})가 참여하였습니다.`);
});

socket.on("new_message",AddMessage);

socket.on("bye",(user) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `방 : ${roomName}`;
    AddMessage(`방금  ${user} 팅김 ㅜㅜ`);
});

socket.on("logout",(user) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `방 : ${roomName}`;
    AddMessage(`${user}님께서 대화방을 나가셨습니다.`);
});

socket.on("room_change",(rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";

    rooms.forEach((room) =>{
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});