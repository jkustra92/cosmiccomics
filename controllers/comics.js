//=============
//requirements
//=============

var express = require("express");
var router = express.Router();
var request = require("request");
var md5 = require("md5");
var Comic = require("../models/comics.js");
var User = require("../models/users.js");
var publicKey = process.env.MARVEL_PUBLIC_KEY;
var privateKey = process.env.MARVEL_PRIVATE_KEY;
var ts = Date.now();

//========================
//getting the search form
//========================

router.get("/search", function(req, res){
  res.render("comicviews/search.ejs")
});

//==================================
//user submits their search request
//==================================

router.post("/search", function(req, res){
  var searchTitle = req.body.title;
  var searchIssueNumber = req.body.issueNumber;
  var searchStartYear = req.body.startYear;
  // console.log(searchTitle)
  // console.log(searchIssueNumber)
  // console.log(searchStartYear)
  res.redirect("/comics/" + searchTitle + "/" + searchStartYear + "/" + searchIssueNumber)
});

//===========================
//getting data from the API
//===========================

router.get("/:title/:startYear/:issueNumber", function(req, res){                           //and now for the biggest block of code in the world... this is a lot of work just to render a search result page, but i'm really happy with it.
  var title = req.params.title;
  var issueNumber = req.params.issueNumber;
  var startYear = req.params.startYear;
  // console.log(title, issueNumber, startYear);
  request("http://gateway.marvel.com/v1/public/comics?title=" + encodeURIComponent(title) + "&startYear=" + startYear + "&issueNumber=" + issueNumber + "&ts=" + ts + "&apikey=" + publicKey + "&hash=" + md5(ts+privateKey+publicKey), function(err, response, body){
      // res.send(body)
      // console.log(typeof body);
      var myData = JSON.parse(body);
      var responseTitle = myData.data.results[0].title;
      var responseIssueNumber = myData.data.results[0].issueNumber;
      var responseImgUrl = myData.data.results[0].images[0].path + ".jpg";
      for (var i = 0; i < myData.data.results[0].creators.items.length; i++){
        if (myData.data.results[0].creators.items[i].role === "writer"){
          var responseAuthor = myData.data.results[0].creators.items[i].name;
        }
      }
      for (var i = 0; i < myData.data.results[0].creators.items.length; i++){
        if (myData.data.results[0].creators.items[i].role === "artist" || myData.data.results[0].creators.items[i].role === "penciller (cover)"){
          var responseArtist = myData.data.results[0].creators.items[i].name;
        }
      }
      responsePrice = myData.data.results[0].prices[0].price;
      responsePageCount = myData.data.results[0].pageCount;
      // console.log(responsePrice);
      // console.log(responsePageCount);
      var comicOutput = {
        title: responseTitle,
        issueNumber: responseIssueNumber,
        imgUrl: responseImgUrl,
        author: responseAuthor,
        artist: responseArtist,
        qty: 1,
        price: responsePrice,
        pageCount: responsePageCount
      }
      console.log(comicOutput)
      // console.log(req.cookies.email);
       var user = User.findOne({email: req.cookies.email}).then(function(user){
        res.render("comicviews/show.ejs", {comic: comicOutput, user: user});                                    //this is just rendering the search result. it won't actually get added to the DB unless the user wants it to.
      });                                                                                                       //there's a hidden form on the page to help with that process.
      // console.log(responseTitle, responseIssueNumber, responseImgUrl, responseAuthor, responseArtist);                                         //i feel like a master of parsing data.
  });
});


module.exports = router;