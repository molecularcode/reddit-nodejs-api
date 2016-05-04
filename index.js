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

// load newCommentForm as a module
var ncf = require('./newCommentForm.js');

// function to test web server is working
// app.get('/newpost', function(request, response) {
//     response.send("Hello World!");
// });


// function to take an aray of objects and return a single string, including HTML
function postsToHTML(result) {
  var htmlStart = '<div id="contents"> <h1>Reddit Clone Homepage</h1> <ul class="contents-list">';
  var htmlEnd = '</ul> </div>';
  //console.log(result);
  var postHTML = result.map(function(res){
    return (
      // post literial using ` and ${} to avoid having to close quotes every time switching from html to JS variable
      `<li class="content-item" style="list-style-type: none;">
        <h2 class="content-item__title" style="margin-bottom: 0px;"><a href="${res.url}" style="color: rgb(255, 87, 0); text-decoration:none;">${res.title}</a></h2>
        <p style="margin-top: 0px;">Created by <b>${res.user.username}</b> ${moment(res.createdAt).fromNow()}</p>
        <p style="margin-top: 0px;">${res.content}</p>
      </li>`
    );
  });
  //console.log(postHTML.join(''));
  return (htmlStart + postHTML.join('') + htmlEnd);
}

// function to take a single object and return a single string, including HTML and include newCommentForm
function postToHTML(res, allComments) {
  console.log(allComments);
  return (
    `<div id="contents"> <h1>${res.title}</h1>
      <p style="margin-top: 0px;">Created by <b>${res.user.username}</b> ${moment(res.createdAt).fromNow()}</p>
      <p style="margin-top: 0px;">${res.content}</p>
      ${ncf}
      <div class="comments">
      <ul>
        ${allComments.map(function(comment){
          return `
            <li>${comment.comment}<br />Posted by <b>${comment.userId}</b>  ${moment(comment.createdAt).fromNow()}</li>
          `;
        }).join('')}
        </ul>
      </div>
    </div>`
  );
}

// Show a header and footer above and below the page content. MUST wrap every send and redirect in this function
function headfoot(page){
  return `
    <header style="background-color: rgb(255, 87, 0); color: #fff; text-align:center; padding: 1px 0px 10px ">
      <h1>Reddit Clone</h1>
      <nav style="text-transform: uppercase; margin-top: 10px;">
        <a href="https://dc-day14-reddit-nodejs-api-molecularcode-1.c9users.io/?page=1&posts=25" style="color: rgb(255, 255, 255); text-decoration: none; padding: 10px;">Homepage</a>
        <a href="https://dc-day14-reddit-nodejs-api-molecularcode-1.c9users.io/newpost"  style="color: rgb(255, 255, 255); text-decoration: none; padding: 10px;">Create New Post</a>
      </nav>
    </header>
    ${page}
    <footer style="background-color: rgb(255, 87, 0); color: #fff; text-align:center; padding: 1px 0px 10px;"><h2>FOOTER</h2></footer>
  `;
}


// Reddit Clone Homepage with sort functionality
// -----------------------------------------------------------------------------
// url/?page=1&posts=25
// first get the result of the DB query as an array of objects, then transform into a single string, including HTML
app.get('/', function(req, res) {
  var options = {
    numPerPage: Number(req.query.posts),
    page: Number(req.query.page)
  };

  var sortStr = req.query.sort;  
  function sort(sortStr, result, callback) {
    if (sortStr === "new"|| sortStr === undefined) {
      callback(result);
    }
    // COME BACK LATER AND BUILD OTHER SORT FUNCTIONS AFTER IMPLEMENTING THE VOTING SYSTEM
    // else if(oper === "top") {
    //   result.solution = num1-num2;
    //   return result;
    // }
    // else if(oper === "hot") {
    //   result.solution = num1*num2;
    //   return result;
    // }
    // else if(oper === "controversial") {
    //   result.solution = num1/num2;
    //   return result;
    // }
    // else {
    //   callback("error");
    // }
  }
  
  redditAPI.getAllPosts(options, function(err, result) {
    if (err) {
      res.status(500).send('<h2>UNHELPFUL ERROR MSG!</h2>');
    }
    else {
      sort(sortStr, result, function(sortedRes) {
        //console.log(sortedRes);
        res.send(headfoot(postsToHTML(sortedRes)));
      });
    }
  });
});


// Single Post Page
// -----------------------------------------------------------------------------
app.get('/post', function(req, res) {
  var postId = Number(req.query.postid);  
  redditAPI.getSinglePost(postId, function(err, post) {
    if (err) {
      res.send('<h2>ERROR: no post found!</h2>' + err);
    }
    else {
      //console.log(post);
      //get me the comments, call back call this shit below
      redditAPI.getComments(3, function(err, results){
        //   if (err) {
//     console.log(err);
//   }
//   else {
//     console.log(JSON.stringify(res, null, 4));
//   }

        
        res.send(headfoot(postToHTML(post, results)));
      })
      
    }
  });
});


// Create New Post page
// -----------------------------------------------------------------------------
// send newPostForm.html file to webpage
app.get('/newpost', function(req, res) {
  var options = {
    root: __dirname + '/'
  };

  res.sendFile('newPostForm.html', options, function(err) {
    if (err) {
      res.status(500).send('<h2>ERROR!</h2>' + err);
    }
    else {
      return;
    }
  });
});


//Create New Post by taking the inputs from filling in and submitting the newPostForm.html and create a new post. If successful, redirect to the homepage page showing 5 most recent posts
app.post('/newpost', function(req, res) {
  var newTitle = req.body.title;
  var newURL = req.body.url;
  var newContent = req.body.content;
  redditAPI.createPost({
    title: newTitle,
    url: newURL,
    content: newContent,
    userId: 1,
    subredditId: 8
  }, function(err, post) {
    //console.log(post);
    if (err) {
      res.send('<h2>ERROR: post not created!</h2>' + err);
    }
    else {
      // redrect to single post page on successful submission
      res.redirect(`/post?postid=${post.id}`);
    }
  });
});


// Create New Comment by taking the input from filling in the comment form on the single comment page (created by ncf - new comment form module). If successful, redirect/refresh single post page
app.post('/newcomment', function(req, res) {
  var newComment = req.body.comment;
  
  // Need to get the postId from the url of the page where the comment was posted; get url from referer in header, split it at the = of the query string and convet to a number
  var refererURL = req.headers.referer.split('='); 
  var postId = Number(refererURL[1]);
  
  redditAPI.createComment({
    text: newComment,
    userId: 1,
    postId: postId
  }, function(err, comment) {
    //console.log(comment);
    if (err) {
      res.send('<h2>ERROR: comment could not be created!</h2>' + err);
    }
    else {
      // redrect to single post page on successful submission
      //console.log(comment);
      res.redirect(`/post?postid=${comment.postId}`);
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