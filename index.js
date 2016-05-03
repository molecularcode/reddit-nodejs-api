// load the mysql library
var mysql = require('mysql');
var util = require('util');
var moment = require('moment');
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var bodyParser = require('body-parser');
app.use(bodyParser());

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'molecularcode',
  password : '',
  database: 'reddit',
  debug: false
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);

// function to test web server is working
// app.get('/hello', function(request, response) {
//     response.send("Hello World!");
// });


// function to take an aray of objects and return a single string, including HTML
function postToHTML(result) {
  var htmlStart = '<div id="contents"> <h1>Reddit Clone Homepage</h1> <ul class="contents-list">';
  var htmlEnd = '</ul> </div>';
  var postHTML = result.map(function(res){
    return (
      // post literial using ` and ${} to avoid having to close quotes every time switching from html to JS variable
      `<li class="content-item" style="list-style-type: none;">
        <h2 class="content-item__title" style="margin-bottom: 0px;"><a href="${res.url}" style="color: #B40404; text-decoration:none;">${res.title}</a></h2>
        <p style="margin-top: 0px;">Created by ${res.username} ${moment(res.createdAt).fromNow()}</p>
      </li>`);
  });
  return (htmlStart + postHTML.join('') + htmlEnd);
}


// Reddit Clone Homepage sorted by newest first
// url/?page=1&posts=25
// first get the result of the DB query as an array of objects, then transform into a single string, including HTML
app.get('/', function(req, res) {
  var options = {
    numPerPage: Number(req.query.posts),
    page: Number(req.query.page)
  };
  console.log(options);
  redditAPI.getAllPosts(options, function(err, result) {
    if (err) {
      res.status(500).send('<h2>UNHELPFUL ERROR MSG!</h2>');
    }
    else {
      res.send(postToHTML(result));
    }
  });
});







/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */
// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});


// //Create user and new post
// redditAPI.createUser({
//   username: 'hello5',
//   password: 'xxx'
// }, function(err, user) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     redditAPI.createPost({
//       title: 'hi reddit!',
//       url: 'https://www.reddit.com',
//       userId: user.id,
//       subredditId: 4
//     }, function(err, post) {
//       if (err) {
//         console.log(err);
//       }
//       else {
//         console.log(post);
//       }
//     });
//   }
// });


// // Get all posts for all users
// redditAPI.getAllPosts(function(err, result) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     console.log(result);
//   }
// });


// Get all posts for a given user by userId
// redditAPI.getAllPostsForUser(11, {numPerPage:25, page:0}, function(err, result) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     console.log(result);
//   }
// });


// Get a single post by postId
// redditAPI.getSinglePost(4, function(err, result) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     console.log(result);
//   }
// });


// Create a new subreddit
// redditAPI.createSubreddit({name: "myFourthSubreddit", description: "it's awesome"}, function(err, result) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     console.log(result);
//   }
// });


//Get a list of all subreddits
// redditAPI.getAllSubreddits(function(err, result) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     console.log(result);
//   }
// });


// //Create a comment
// redditAPI.createComment({text: "that was interesting", userId: 11, postId: 6, parentId: 7}, function(err, result) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     console.log(result);
//   }
// });


// // Get all comments nested to X levels
// redditAPI.getComments(5, function(err, res) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     console.log(JSON.stringify(res, null, 4));
//   }
// });