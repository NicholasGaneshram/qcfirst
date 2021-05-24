//Shohum Boker
//Node Js backend
//5-24-21
const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser')
var session = require('express-session')
const ejs = require("ejs")
const app = express();
const port = 3000;
var util = require('./js/util.js');
app.set('views', 'ejs');
app.set('vewis engine', 'ejs');
mongoose.connect('mongodb+srv://new_user1:new_user1@cluster0.c5ndq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);


app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/'));
app.use(express.static(__dirname + '/html'));
app.use(express.static(__dirname + '/js'));
app.use(session({
  secret: 'shouldBeEncryped',
  resave: false,
  saveUninitialized: true,
}))
const CourseShem = new mongoose.Schema({
        Semester: String,
        CourseName: String,
        CourseNumber: Number,
        Department: String,
        Description: String,
        StartTime: Number,
        EndTime: Number,
        Capacity: Number,
        Deadline: Date,
        DOWS: [String],
        Instructor: String,
        Iemail: String,
        Students: [String]
})
const Course  = mongoose.model('Course', CourseShem);
const UserShem = new mongoose.Schema({
    FristName: String,
    LastName: String,
    PassWord: String,
    Email: String,
    PhoneNumber: String,
    Instrc: Boolean,
})
const User  = mongoose.model('User', UserShem);
app.get("/admin", function(req, res){
  if(!req.session.user && req.session.user.Email == 'shohum.boker00@gmail.com'){
    return res.redirect('/html/401.html')
  }
  Course.find({}, function(err, data){
    User.find({}, function(rre, atad){
      console.log(atad[0]['_doc'])
      res.render('admin.ejs', {info2: atad, info: data})
    }) 
  })
})
app.post("/drop", function(req, res){
  y= Course.findByIdAndUpdate(req.body.classes,{
     $pull: {Students: req.session.user.FristName + " "+req.session.user.LastName}},{new: true},function(err, data){
       if(data == null ) res.render('withdraw.ejs', {info: []})
       return res.render('withdraw.ejs', {info: data}) 
  })
})
app.post("/query", function(req, res){
  x = {Semester: req.body.Semester, Capacity: {$gt: 0}}
  if(req.body.name)
    x.CourseName = req.body.name;
  if(req.body.dept)
    x.Department = req.body.dept;
  if(req.body.instrc)
    x.Instructor = req.body.instrc;
  var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  if(req.body.DOW){
    req.body.DOW = req.body.DOW.split(", ");
    for(var i = 0; i < 7; i++){
     if(!days[i].includes(req.body.DOW)){
       req.body.DOW = null;
       break;
     }
    }
    if(req.body.DOW) x.DOWS = req.body.DOW;
  }
  z = Course.find({$and: [x, {Students: {$ne: req.session.user.FristName + " "+ req.session.user.LastName}}] 
  },function(err, data){
    if(data == null)
    return res.render("enroll.ejs", {info: [], intToTime: util.intToTime});
    return res.render("enroll.ejs", {info: data, intToTime: util.intToTime});
  })

})
app.post("/roll", function(req, res){
  y= Course.findByIdAndUpdate(req.body.class, {
     $inc: {Capacity: -1}, 
     $push: {Students: req.session.user.FristName + " "+req.session.user.LastName}},{new: true},function(err, data){
       return res.render('enroll.ejs', {info: []}) 
  })
    
})

app.post("/choice", function(req, res){
    y = Course.findByIdAndRemove(req.body.classes, function(err, data){
       z = Course.find({Iemail: req.session.user.Email}, function(err, data){
          res.render("ihome.ejs", {info: data, intToTime: util.intToTime})
        })
    })

})
app.post("/add", function(req, res, next) {
      y = Course.findOne({
        Semester: req.body.Semester, 
        CourseName: req.body.name,
        CourseNumber: req.body.num,
        Iemail: req.session.user.Email
        }, function (err, data) {
          if(data != null)
          return res.render('add.ejs', {err: [true, false, false]})
          else next()
        })
      },function(req, res, next) {
         let x = new Course();
          x.Semester = req.body.Semester
          x.CourseName = req.body.name
          x.CourseNumber = req.body.num
          x.Department = req.body.Department
          x.Instructor = req.session.user.FristName + " " + req.session.user.LastName
          x.Iemail = req.session.user.Email
          x.Description = req.body.info
          x.Capacity = req.body.capacity
          start= parseInt(req.body.start.substring(0,2), 10)*100 + parseInt(req.body.start.substring(3,5), 10);
          end = parseInt(req.body.end.substring(0,2), 10)*100 + parseInt(req.body.end.substring(3,5), 10);
          x.StartTime = start
          x.EndTime = end
          x.Deadline = req.body.dead
          x.DOWS = req.body.day
          z = Course.findOne({
          $or: 
          [{$and: [
            { EndTime: { $gt: end } }, 
            { StartTime: { $lte: end} } ]}, 
          {$and: [
            { StartTime: { $lte: start} }, {EndTime: { $gt: start} }] 
          }],
          Iemail: req.session.user.Email,
          DOWS: {$in: req.body.day}
          }, function (err, data) {
            if(data != null || end < start)
              return res.render('add.ejs', {err: [false, true, false]})
            else if(!req.body.day){
              return res.render('add.ejs', {err: [false, false, true]},)
            }else{
              x.save();
              a = Course.find({Iemail: req.session.user.Email}, function(err, data){
               res.render("ihome.ejs", {info: data, intToTime: util.intToTime})
              })
            }
        })
})
app.get("/rost", function(req, res){
  if(!req.session.user){
    return res.redirect('/html/401.html')
  }
  y = Course.findById(req.query.id, function(err, data){
      if(data == null ) res.render('withdraw.ejs', {info: []})
      return res.render('rost.ejs', {info: data})
  })
})
app.get('/', function(req,res){
  req.session.destroy();
  res.render('index.ejs', {W : false})
})
app.get('/signup', function(req,res){
  res.render('signup.ejs', {Wpass : false, Muser: false})
})
app.get('/homepage', function(req,res){
  if(!req.session.user){
    return res.redirect('/html/401.html')
  }
     y = Course.find({Students: req.session.user.FristName + " "+ req.session.user.LastName}, function(err, data){
        if(data == null ) res.render('homepage.ejs', {info: [], intToTime: util.intToTime})
        res.render("homepage.ejs", {info: data, intToTime: util.intToTime})
     })
})
app.get('/ihome', function(req,res){
  if(!req.session.user){
    return res.redirect('/html/401.html')
  }
  y = Course.find({Iemail: req.session.user.Email}, function(err, data){
        if(data == null ) res.render('ihome.ejs', {info: [], intToTime: util.intToTime})
        res.render("ihome.ejs", {info: data, intToTime: util.intToTime})
  })
})
app.get('/withdraw', function(req,res){
  if(!req.session.user){
    return res.redirect('/html/401.html')
  }
  
  y = Course.find({Students: req.session.user.FristName + " "+ req.session.user.LastName}, function(err, data){
        if(data == null ) res.render('withdraw.ejs', {info: [], intToTime: util.intToTime})
        res.render("withdraw.ejs", {info: data, intToTime: util.intToTime})
  })
})
app.get('/add', function(req,res){
	if(!req.session.user){
    return res.redirect('/html/401.html')
  }
   return res.render('add.ejs', {err: [false, false, false]}) 
})
app.get('/coursemanagement', function(req,res){
	if(!req.session.user){
    return res.redirect('/html/401.html')
  }
   y = Course.find( {Iemail: req.session.user.Email} , function(err, data){
     if(data == null ) res.render('coursemanagement.ejs', {info: [], intToTime: util.intToTime})
        res.render("coursemanagement.ejs", {info: data, intToTime: util.intToTime})})
})
app.get('/enroll', function(req,res){
	if(!req.session.user){
    return res.redirect('/html/401.html')
  }
   return res.render('enroll.ejs', {info: []}) 
})
    




app.post('/login', function(request, response){
      y = User.findOne({Email: request.body.Email, PassWord: request.body.Password}, function (err, data) {
        if(err)console.log("no")
        if(data != null){
          request.session.user = data;
          if(data.Instrc){
            y = Course.find({Iemail: request.session.user.Email}, function(err, data){
              if(data == null ) response.render('ihome.ejs', {info: [], intToTime: util.intToTime})
             response.render("ihome.ejs", {info: data, intToTime: util.intToTime})})
          }else{
             y = Course.find({Students:  request.session.user.FristName + " "+  request.session.user.LastName}, function(err, data){
               if(data == null ) response.render('homepage.ejs', {info: [], intToTime: util.intToTime})
               response.render("homepage.ejs", {info: data, intToTime: util.intToTime})
              })
          }
        }else{
          response.render('index.ejs', {W : true})
        }
      });
});
app.use(express.static(__dirname + '/html/signup.html'));
app.post('/create', function(request, response){
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
          response.render("signup.ejs",{Wpass : request.body.Password != request.body.REPassword, Muser: true});
        }else{
          if(request.body.Password != request.body.REPassword) 
            response.render("signup.ejs",{Wpass : true, Muser: false});
          else {
            x.save();
            request.session.user = x;
            if(x.Instrc){
              y = Course.find({Iemail: request.session.user.Email}, function(err, data){
              if(data == null ) response.render('ihome.ejs', {info: [], intToTime: util.intToTime})
            return response.render("ihome.ejs", {info: data, intToTime: util.intToTime})})
          }else{
             y = Course.find({Students:  request.session.user.FristName + " "+  request.session.user.LastName}, function(err, data){
               if(data == null ) response.render('homepage.ejs', {info: [], intToTime: util.intToTime})
               response.render("homepage.ejs", {info: data, intToTime: util.intToTime})
              })
          }
          }
        }
      });
});

app.listen(port, function() {
    console.log('Server starting on http://localhost:' + port);
});
