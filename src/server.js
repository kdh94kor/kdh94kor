import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/",(req,res) => res.render("home"));
// app.get("/*",(req,res) => res.redirect("home")); // 홈 외 경로를 접속할때 홈으로

const handleListen = () => console.log('Listening on http://localhost:3000');

const server = http.createServer(app);

const wss = new WebSocket.Server({server});

// Vinila JS
// function handleConnection(socket){
//     console.log(socket);
// }

wss.on("connection",(socket) =>{
    console.log("Connected to Brwser ✔");
    socket.on("close",() =>console.log("Disconnected from Browser X"));
    socket.on("message",(message) =>{
        console.log(message.toString("utf-8"));
    })
    socket.send("hello!");
});
server.listen(3000,handleListen);