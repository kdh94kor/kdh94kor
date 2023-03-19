const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const camerBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = mySTream.getVideoTracks()[0];

        cameras.forEach(camera => {
            const option = document.createElement("option")
            option.value = camera.deviceId
            option.innerText = camera.label;
            if (currentCamera.label === camera.label){
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        });
    }catch(e){
        console.log(e)
    }
}

async function getMedia(deviceId){

    const initialConstrains ={
        audio: true,
        video: {facingMode : "User"},
    };

    const cameraConstraints = {
        audio: true,
        video: {deviceId: { exact : deviceId }},
    };

    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstrains
        );
        
    myFace.srcObject = myStream;
    if (!deviceId){
        await getCameras();
    }

    }catch(e){
        console.log(e);
    }
}

// getMedia();

function handleMuteClick(){
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));

    if(!muted){
        muteBtn.innerText = "Unmute";
        muted = true;
    } else{
        muteBtn.innerText = "mute";
        muted = false;
    }
}

function handleCameraClick(){
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    if(cameraOff){
        camerBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    }else{
        camerBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

async function handleCameraChange(){
    await getMedia(camerasSelect.value);
    if(myPeerConnection){
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection
            .getSenders()
            .find(sender => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }
}

muteBtn.addEventListener("click",handleMuteClick);
camerBtn.addEventListener("click",handleCameraClick);
camerasSelect.addEventListener("input",handleCameraChange);

// Welcome Form (Join a room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room",input.value);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// SOcket Code

socket.on("welcome", async () =>{
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    socket.emit("offer", offer, roomName);
});

// 참여하는 브라우저에서 호출됨
socket.on("offer", async (offer) =>{
    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    console.log(answer);
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
});

// 참여하는 브라우저에서 호출됨
socket.on("answer", answer => {
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
    console.log("received the candidate");
    myPeerConnection.addIceCandidate(ice);
});

// RTC Code

function makeConnection(){
    myPeerConnection  = new RTCPeerConnection({

        iceServers: [{
            urls: [ "stun:ntk-turn-1.xirsys.com" ]
         }, {
            username: "yoR5ZbTD5kM-lBPGqK9crAZ8KtMkOQGF29Dwq5b_fwD_1tEFnPRpPLWGJCUgbvqXAAAAAGQW_iFnaGtzbWwyMjg=",
            credential: "7b94d6fe-c650-11ed-bd53-0242ac120004",
            urls: [
                "turn:ntk-turn-1.xirsys.com:80?transport=udp",
                "turn:ntk-turn-1.xirsys.com:3478?transport=udp",
                "turn:ntk-turn-1.xirsys.com:80?transport=tcp",
                "turn:ntk-turn-1.xirsys.com:3478?transport=tcp",
                "turns:ntk-turn-1.xirsys.com:443?transport=tcp",
                "turns:ntk-turn-1.xirsys.com:5349?transport=tcp"
            ]
         }],

        // iceServers: [
        //     {
        //         urls: [
        //             //google Free STUN SERVER
        //             // "stun:stun.l.google.com:19302",
        //             // "stun:stun1.l.google.com:19302",
        //             // "stun:stun2.l.google.com:19302",
        //             // "stun:stun3.l.google.com:19302",
        //             // "stun:stun4.l.google.com:19302",
        //         ],
        //     },
        // ],
    });
    
    myPeerConnection.addEventListener("icecandidate", handleIce);
    // myPeerConnection.addEventListener("addstream", handleaddStream);
    myPeerConnection.addEventListener("track", handleTrack);
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data){
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);
}

function handleaddStream(data){
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
    // console.log("got an event from my peer");
    // console.log("peer's Stream", data.stream);
    // console.log("My stream", myStream);
}

function handleTrack(data){
    console.log("handle track")
    const peerFace = document.querySelector("#peerFace")
    peerFace.srcObject = data.streams[0];
}