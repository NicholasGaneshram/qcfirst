//Shohum Boker
//Node Js backend, User mangment system
const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser')
const bcrypt = require ('bcrypt');
const app = express();
const port = 3000;
mongoose.connect('mongodb+srv://new_user1:new_user1@cluster0.c5ndq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/'));
app.use(express.static(__dirname + '/html'));
const UserShem = new mongoose.Schema({
    FristName: String,
    LastName: String,
    PassWord: String,
    Email: String,
    PhoneNumber: String,
    Instrc: Boolean
})
    
const User  = mongoose.model('User', UserShem);

app.post('/login', function(request, response){
      y = User.findOne({Email: request.body.Email, PassWord: request.body.Password}, function (err, data) {
        if(err)console.log("no")
        if(data != null){
          if(data.Instrc) response.redirect("/ihome.html");
          else response.redirect("/homepage.html");
        }else{
          response.redirect("/index.html");
        }
      });
});
app.use(express.static(__dirname + '/html/signup.html'));
app.post('/signup', function(request, response){
      var x = new User();
      x.PassWord =request.body.Password
      x.Email = request.body.Email
      x.PhoneNumber = request.body.PhoneNumber
      x.FristName = request.body.FirstName
      x.LastName = request.body.LastName
      x.Instrc = request.body.Instructor
      y = User.findOne({Email: request.body.Email}, function (err, data) {
        if(err)console.log("no")
        if(data != null){
          alert("UserName taken")
          response.redirect("/html/signup.html");
        }else{
          if(request.body.Password != request.body.REPassword) 
            response.redirect("/html/signup.html");
          else {
            x.save();
            if(x.Instrc) response.redirect("/html/ihome.html");
            else response.redirect("/html/homepage.html");
          }
        }
      });
});

app.listen(port, function() {
    console.log('Server starting on http://localhost:' + port);
});
