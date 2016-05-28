var express = require("express");
var router = express.Router();
var md5 = require("md5");
var request = require("request");
var Comic = require("../models/comics.js")
var publicKey = process.env.MARVEL_PUBLIC_KEY;
var privateKey = process.env.MARVEL_PRIVATE_KEY;
var ts = Date.now();
var hash = md5(ts+privateKey+publicKey)

//============
//search form
//============

router.get("/search", function(req, res){
  res.render("comicviews/search.ejs")
})

router.post("/search", function(req, res){
  var searchTitle = req.body.title;
  var searchIssueNumber = req.body.issueNumber
  var searchStartYear = req.body.startYear
  // console.log(searchTitle)
  // console.log(searchIssueNumber)
  // console.log(searchStartYear)
  res.redirect("/comics/" + searchTitle + "/" + searchStartYear + "/" + searchIssueNumber)
})

router.get("/:title/:startYear/:issueNumber", function(req, res){
  var title = req.params.title;
  var issueNumber = req.params.issueNumber;
  var startYear = req.params.startYear;
  console.log(title, issueNumber, startYear);
  // request("http://gateway.marvel.com/v1/public/comics?title=Hawkeye&startYear=2012&issueNumber=3&ts=1464445747&apikey=a7fe91c1a8f9dff79e43e342dfc46824&hash=e74f4e496dbd0b8dfa55d26cf2fc797f", function(err, response, body){
  request("http://gateway.marvel.com/v1/public/comics?title=" + encodeURIComponent(title) + "&startYear=" + startYear + "&issueNumber=" + issueNumber + "&ts=" + ts + "&apikey=" + publicKey + "&hash=" + md5(ts+privateKey+publicKey), function(err, response, body){
    console.log('g', response.body)
    res.send(response.body)
  });
});

module.exports = router;