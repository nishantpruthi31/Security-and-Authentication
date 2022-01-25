

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose =require("mongoose");
 const encrypt=require("mongoose-encryption");    // package used to encrypt,decrypt and authenticate text/passwords

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
const userSchema=new mongoose.Schema({
  username:String,
  password:String
});
const secret="This is our little secret";
userSchema.plugin(encrypt,{secret:secret,encryptedFields: ["password"] });     // we applied mongoose encryption to schema passwords and provided a secret key to encrypt messages ,mongoose will automatically decrypt password when we search in database
const User=new mongoose.model("User",userSchema);

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
  const newUser=new User({
    username:req.body.username,
    password:req.body.password
  });
  newUser.save(function(err){
    if(err)
    console.log(err);
    else
    res.render("secrets");
  });
});

app.post("/login",function(req,res){
  const username=req.body.username;
  const password=req.body.password;

  User.findOne({username:username},function(err,foundUser){
    if(err)
    console.log(err);
    else
    {
      if(foundUser)
      {
        if(foundUser.password===password)
        res.render("secrets");
      }
    }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
