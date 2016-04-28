// load the mysql library
var mysql = require('mysql');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'molecularcode',
  password : '',
  database: 'reddit'
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);

// Create user and new post
// redditAPI.createUser({
//   username: 'hello1',
//   password: 'xxx'
// }, function(err, user) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     redditAPI.createPost({
//       title: 'hi reddit!',
//       url: 'https://www.reddit.com',
//       userId: user.id
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


// Get all posts for all users
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


redditAPI.getAllSubreddits(function(err, result) {
  if (err) {
    console.log(err);
  }
  else {
    console.log(result);
  }
});