import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.get("/",(req,res) => res.render("home"));
app.get("/*",(req,res) => res.redirect("home")); // 홈 외 경로를 접속할때 홈으로

const handleListen = () => console.log('Listening on http://localhost:3000');
app.listen(3000, handleListen);