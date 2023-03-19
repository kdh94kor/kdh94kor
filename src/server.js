import http from "http";
import {Server} from "socket.io";
import express from "express";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/",(req,res) => res.render("home"));
// app.get("/*",(req,res) => res.redirect("home")); // 홈 외 경로를 접속할때 홈으로


const handleListen = () => console.log('Listening on http://localhost:3000');

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer,{
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
});
instrument(wsServer, {
    auth: false,
});


function publicRooms(){

    const {
        sockets: {
            adapter: {sids, rooms},
            // const sids = wsServer.socket.adapter.sids;
            // const rooms = wsServer.socket.adapter.rooms;
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        };
    });
    return publicRooms;
};

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}


wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon";
    socket.onAny((event) =>{
        console.log(`Socket Event:${event}`);
    });

    socket.on("join_room", (roomName) =>{
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });
    
    socket.on("offer", (offer, roomName)=>{
        socket.to(roomName).emit("offer", offer, roomName);
    }); 

    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });

    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    });

    //입장
    socket.on("enter_room", (roomName, done) =>{
        console.log(`방이름 : ${roomName}`);
        socket.join(roomName);
        done();
        
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms()); //모든 소켓에 메세지 보냄
    });

    // 끊기기 전
    socket.on("disconnecting", () =>{
        socket.rooms.forEach(room =>{
            socket.to(room).emit("bye", socket.nickname, countRoom(room)-1 );
        });   
    });     

    socket.on("disconnect", () =>{
        socket.rooms.forEach(room =>{
            socket.to(room).emit("logout", socket.nickname);
        });   
            wsServer.sockets.emit("room_change", publicRooms());
    });     

    // 닉네임 지정
    socket.on("nickname", (nickname) => socket["nickname"] = nickname);

    socket.on("new_message", (msg, roomName, done) =>{
        console.log(`받은메세지 ${msg}`);
        console.log(`채팅방 :  ${roomName}`);
        socket.to(roomName).emit("new_message", `${socket.nickname} : ${msg}`);
        done();
    });
});


function onSocketClose(){
    console.log("Socket Closed");
}

const sockets = [];

httpServer.listen(3000,handleListen);
