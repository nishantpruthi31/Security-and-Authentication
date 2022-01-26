
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose =require("mongoose");

        // requiring passport related packages
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({                                    // setting up the session
  secret:"This is our secret.",
  resave:false,
  saveUninitialized:false
})) ;

app.use(passport.initialize());                  // intitalizing passport package and acquiring it with session
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
const userSchema=new mongoose.Schema({
  username:String,
  password:String
});

userSchema.plugin(passportLocalMongoose);             // applying plugin to mongoose schema

const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());                        /* configusing passport local with our model */
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/secrets",function(req,res){         // we created this route to render secrets page if it's session is active else forcing it to login
  if(req.isAuthenticated())                   // req we will get after session creation
  {
    res.render("secrets");
  }
  else
  {
    res.redirect("/login");
  }
});

app.get("/logout",function(req,res){
  req.logout();                             // ending session of user
  res.redirect("/");
})

app.post("/register",function(req,res){

User.register({username: req.body.username},req.body.password,function(err,user){
  if(err)
  {
    console.log(err);
    res.redirect("/register");
  }
  else
  {
    passport.authenticate("local")(req,res,function(){                             // authenticating user using passport
      res.redirect("/secrets");
    });
  }
});
});

app.post("/login",function(req,res){

const user=new User({         // creating this to pass it into below method
  username:req.body.username,
  password:req.body.password
});

req.login(user,function(err){                    // method to make user login
  if(err)
  {
    console.log(err);
  }
  else
  {
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    });
  }
});
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
