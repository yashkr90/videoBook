require("dotenv").config();
const request = require("request");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
// const nocache = require("nocache");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
// const got=require("got");

const port = 3000;

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// app.use(nocache());
// app.set('etag', false);
// var videoid;
var urlofvideo;
var videoids = [];
var videourls = [];
var id;
var idx = 0;
var thumbnail1;
var thumbnail2;
var thumbnail3;
var thumbnail4;
var videoname = [];
var channelname = [];
app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.392upp1.mongodb.net/userDB`,
  { useNewUrlParser: true }
);
// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
});
const urlSchema = new mongoose.Schema({
  videourl: [String],
});
const Url = new mongoose.model("Url", urlSchema);

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "https://videobook-app.herokuapp.com/auth/google/videobook",
      // callbackURL: "http://localhost:3000/auth/google/videobook",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);

      User.findOrCreate({ googleId: profile.id ,username:profile.emails[0].value}, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile","email"] })
);

app.get(
  "/auth/google/videobook",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/search");
  }
);

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

// app.get("/",(req,res)=>{
//     res.sendFile(__dirname+ "/index.html");
// });
app.get("/", function (req, res) {
  id="";
  res.render("home");
});

app.get("/blank",(req,res)=>{

  res.sendFile(__dirname+"/blank.html");
  if(true)
  res.redirect("/results");
});

app.get("/results", (req, res) => {
  // res.sendFile(__dirname + "/result.html");

  res.render("result", {
    thumbnail1: thumbnail1,
    thumbnail2: thumbnail2,
    thumbnail3: thumbnail3,
    thumbnail4: thumbnail4,
    videoname0: videoname[0],
    videoname1: videoname[1],
    videoname2: videoname[2],
    videoname3: videoname[3],
    channelname0: channelname[0],
    channelname1: channelname[1],
    channelname2: channelname[2],
    channelname3: channelname[3],
  });
});

app.get("/search", function (req, res) {
  // User.find({"secret": {$ne: null}}, function(err, foundUsers){
  //   if (err){
  //     console.log(err);
  //   } else {
  //     if (foundUsers) {
  //       res.render("secrets", {usersWithSecrets: foundUsers});
  //     }
  //   }
  // });
  res.sendFile(__dirname + "/search.html");
});

app.post("/through",(req,res)=>{
  var searchqry=req.body.searched;
  console.log(searchqry); 
  if(true)
  res.render("through",{searched:searchqry});

});

app.post("/submit", async (req, res) => {
  id="";
  videoids=[];
  var searchquery = req.body.searched;
  console.log(searchquery);
  videoname = [];
  channelname = [];
  //Once the user is authenticated and their session gets saved, their user details are saved to req.user.
  // console.log(req.user.id);
  // var obj=req.user;
  // hasOwnProperty('track')
  if (typeof req.user === undefined) 
  res.redirect("/search");
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log("error is ", err);
    } else {
      if (foundUser) {
        const options = {
          method: "GET",
          url: "https://yt-api.p.rapidapi.com/search",
          qs: { query: searchquery },
          headers: {
            "X-RapidAPI-Key": process.env.API_KEY,
            "X-RapidAPI-Host": "yt-api.p.rapidapi.com",
            useQueryString: true,
          },
        };

        request(options, function (error, response, body) {
          // console.log("body is",body);
          // console.log(body);
          var bodyobj = JSON.parse(body);
          console.log(typeof bodyobj);
          console.log(bodyobj.data[0].videoId);

          if(bodyobj.data[0].type=="channel")
            var videoid1='g8K21P8CoeI';
          else
            var videoid1=bodyobj.data[0].videoId;

          if(bodyobj.data[1].type=="channel")
            var videoid2='g8K21P8CoeI';
          else
            var videoid2 = bodyobj.data[1].videoId;

          if(bodyobj.data[2].type=="channel")
            var videoid3='g8K21P8CoeI';
          else
            var videoid3 = bodyobj.data[2].videoId;

          if(bodyobj.data[3].type=="channel")
            var videoid4='g8K21P8CoeI';
          else
            var videoid4 = bodyobj.data[3].videoId;
          
          
          
          videoids.push(videoid1);
          videoids.push(videoid2);
          videoids.push(videoid3);
          videoids.push(videoid4);
          thumbnail1 = bodyobj.data[0].thumbnail[0].url;
          thumbnail2 = bodyobj.data[1].thumbnail[0].url;
          thumbnail3 = bodyobj.data[2].thumbnail[0].url;
          thumbnail4 = bodyobj.data[3].thumbnail[0].url;
          for (let i = 0; i < 4; i++) {
            videoname.push(bodyobj.data[i].title);
          }
          for (let i = 0; i < 4; i++) {
            channelname.push(bodyobj.data[i].channelTitle);
          }
          if (error)
            // console.log(error);
            res.send("there as an error");
          else {
            console.log(response.statusCode);
            if (response.statusCode === 200) {
              geturl().then(async (data) => {
                console.log("data is", data);
                console.log("data is type", typeof data);
                var newurl = new Url({ videourl: data });
                newurl.save(function (err, data) {
                  if (err) return console.error("err in insering data", err);
                  id = data.id;
                  console.log(id);
                  console.log(" saved to collection.");
                });

                // console.log("videourl array is",videourls[0]);
                // urlofvideo=data;
                // res.sendFile(__dirname + "/result.html");
                res.redirect("/results");
              });
            } else res.send("failed");
          }

          function geturl() {
            var arr = [];
            for (let i = 0; i < 4; i++) {
              arr.push(getPromise(videoids[i]));
            }

            function getPromise(videoid) {
              return new Promise((resolve, reject) => {
                console.log("insoede geturl");
                console.log("videoid is", videoid);
                const options = {
                  method: "GET",
                  url: "https://yt-api.p.rapidapi.com/dl",
                  qs: { id: videoid },
                  headers: {
                    "X-RapidAPI-Key": process.env.API_KEY,
                    "X-RapidAPI-Host": "yt-api.p.rapidapi.com",
                    useQueryString: true,
                  },
                };

                request(options, function (error, response, body) {
                  var bodyobjstream = JSON.parse(body);
                  if(bodyobjstream.status==='fail')
                    resolve('errored');
                    if(!(bodyobjstream.hasOwnProperty('formats'))){
                      console.log("not has format");
                      var videourl=bodyobjstream.adaptiveFormats[0].url;
                      }
                      else{
                        var videourl=bodyobjstream.formats[1].url;
                      }
                      var format=bodyobjstream.formats
                      console.log(typeof format)
                  

                  
                  // console.log("videourl iss",videourl);
                  // var currurl="videourl"+index;
                  // var newurl=new Url({videourl: videourl});
                  // newurl.save(function (err, data) {
                  //   if (err) return console.error("err in insering data",err);
                  //   console.log(" saved to bookstore collection.");
                  // });
                  // videourls.push(videourl);
                  // console.log(`The index for ${videoid} is ${index} `+videourl);

                  // resolve(videourl);
                  // console.log("url is",videourls[]);
                  resolve(videourl);
                  if (error) throw new Error(error);

                  //   console.log(body);
                });
              });
            }

            return Promise.all(arr);
            // console.log("videourl is "+videourls[0]);
            // resolve("all resolved");
          }
          // foundUser.secret = submittedSecret;
          // foundUser.save(function(){
          //   res.redirect("/secrets");
          // });
        });
      }
    }
  });

  // console.log(body);
});

app.post("/redirect", (req, res) => {
  res.redirect("/search");
});

app.get("/video0", async (req, res) => {
  console.log("inside video ", idx);
  if(id="")
  res.redirect("/search");
  async function geturl() {
    const foundUrl = await Url.findById(id);
    console.log("found is", idx, foundUrl.videourl[0]);
    var urlofvideo = foundUrl.videourl[0];
    // var videourl=foundUrl.videourl;

    // videourl.splice(0,1);

    // idx++;
    // const updated=await Url.findByIdAndUpdate(id,{"$set" : {"videourl" : videourl}});
    return urlofvideo;
  }

  // console.log("route is",req.params.video);
  var fileUrl = await geturl();
  // var options=await getvideo(fileUrl);
  console.log("fileurl is", fileUrl);
  var range = req.headers.range;
  // console.log("range si",req.headers.range);
  var positions, start, end, total, chunksize;

  // HEAD request for file metadata
  request(
    {
      url: fileUrl,
      method: "HEAD",
    },
    function (error, response, body) {
      // console.log(response.headers);
      setResponseHeaders(response.headers);
      pipeToResponse();
    }
  );

  function setResponseHeaders(headers) {
    positions = range.replace(/bytes=/, "").split("-");
    total = headers["content-length"];
    const chunksize = 10 ** 6;
    start = Number(range.replace(/\D/g, ""));
    end = Math.min(start + chunksize, total - 1);
    // start = parseInt(positions[0], 10);

    // end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    // chunksize = (end-start)+1;

    res.writeHead(206, {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Cache-Control":"no-store",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    });
  }

  function pipeToResponse() {
    var options = {
      url: fileUrl,

      headers: {
        range: "bytes=" + start + "-" + end,
        "Cache-Control":"no-store"
        // connection: 'keep-alive'
      },
    };
    // got.stream(options).pipe(res);
    request(options).on('error', function(e) {
      res.end(e);
     }).pipe(res);
  }
});

app.get("/video1", async (req, res) => {
  console.log("inside video ", idx);
  if(id="")
  res.redirect("/search");
  async function geturl() {
    const foundUrl = await Url.findById(id);
    console.log("found is", idx, foundUrl.videourl[1]);
    var urlofvideo = foundUrl.videourl[1];
    return urlofvideo;
  }

  var fileUrl = await geturl();

  console.log("fileurl is", fileUrl);
  var range = req.headers.range;

  var positions, start, end, total, chunksize;

  request(
    {
      url: fileUrl,
      method: "HEAD",
    },
    function (error, response, body) {
      setResponseHeaders(response.headers);
      pipeToResponse();
    }
  );

  function setResponseHeaders(headers) {
    positions = range.replace(/bytes=/, "").split("-");
    total = headers["content-length"];
    const chunksize = 10 ** 6;
    start = Number(range.replace(/\D/g, ""));
    end = Math.min(start + chunksize, total - 1);

    res.writeHead(206, {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Cache-Control":"no-store",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    });
  }

  function pipeToResponse() {
    var options = {
      url: fileUrl,

      headers: {
        range: "bytes=" + start + "-" + end,
        "Cache-Control":"no-store"
        // connection: 'keep-alive'
      },
    };
    request(options).on('error', function(e) {
      res.end(e);
     }).pipe(res);
  }
});
app.get("/video2", async (req, res) => {
  console.log("inside video ", idx);
  if(id="")
  res.redirect("/search");
  async function geturl() {
    const foundUrl = await Url.findById(id);
    console.log("found is", idx, foundUrl.videourl[2]);
    var urlofvideo = foundUrl.videourl[2];
    return urlofvideo;
  }

  var fileUrl = await geturl();

  console.log("fileurl is", fileUrl);
  var range = req.headers.range;

  var positions, start, end, total, chunksize;

  request(
    {
      url: fileUrl,
      method: "HEAD",
    },
    function (error, response, body) {
      setResponseHeaders(response.headers);
      pipeToResponse();
    }
  );

  function setResponseHeaders(headers) {
    positions = range.replace(/bytes=/, "").split("-");
    total = headers["content-length"];
    const chunksize = 10 ** 6;
    start = Number(range.replace(/\D/g, ""));
    end = Math.min(start + chunksize, total - 1);

    res.writeHead(206, {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Cache-Control":"no-store",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    });
  }

  function pipeToResponse() {
    var options = {
      url: fileUrl,

      headers: {
        range: "bytes=" + start + "-" + end,
        "Cache-Control":"no-store"
        // connection: 'keep-alive'
      },
    };
    request(options).on('error', function(e) {
      res.end(e);
     }).pipe(res);
  }
});
app.get("/video3", async (req, res) => {
  console.log("inside video ", idx);
  if(id="")
  res.redirect("/search");
  async function geturl() {
    const foundUrl = await Url.findById(id);
    console.log("found is", idx, foundUrl.videourl[3]);
    var urlofvideo = foundUrl.videourl[3];
    return urlofvideo;
  }

  var fileUrl = await geturl();

  console.log("fileurl is", fileUrl);
  var range = req.headers.range;

  var positions, start, end, total, chunksize;

  request(
    {
      url: fileUrl,
      method: "HEAD",
    },
    function (error, response, body) {
      setResponseHeaders(response.headers);
      pipeToResponse();
    }
  );

  function setResponseHeaders(headers) {
    positions = range.replace(/bytes=/, "").split("-");
    total = headers["content-length"];
    const chunksize = 10 ** 6;
    start = Number(range.replace(/\D/g, ""));
    end = Math.min(start + chunksize, total - 1);

    res.writeHead(206, {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Cache-Control":"no-store",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    });
  }

  function pipeToResponse() {
    var options = {
      url: fileUrl,

      headers: {
        range: "bytes=" + start + "-" + end,
        "Cache-Control":"no-store"
        // connection: 'keep-alive'
      },
    };
    request(options).on('error', function(e) {
      res.end(e);
     }).pipe(res);
  }
});

app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/search");
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/search");
      });
    }
  });
});

app.listen(process.env.PORT || port, function () {
  console.log("Server started on port 3000");
});
