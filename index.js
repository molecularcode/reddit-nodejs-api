// load the mysql library
var mysql = require('mysql');
var util = require('util');
var moment = require('moment');
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(checkLoginToken);
var bodyParser = require('body-parser');
app.use(bodyParser());
app.use(express.static('public'));


// load newCommentForm as a module
var ncf = require('./newCommentForm.js');

// Connection to Cloud9 (MySQL) server
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


// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------
// .use creates middware to process the get request and do something to it, in this case show header for all requests
app.use(function(req, res, next){
  //console.log(req.loggedInUser);
  // next REQUIRED so that the middleware doesn't block the stream and allows the request to move on
  next();
});

// Middleware to check is a SESSION cookie exists and mark user as logged-in if so
function checkLoginToken(req, res, next) {
  // check if there's a SESSION cookie...
  if (req.cookies.SESSION) {
    redditAPI.getUserFromSession(req.cookies.SESSION, function(err, user) {
      // if we get back a user object, set it on the request. From now on, this request looks like it was made by this user as far as the rest of the code is concerned
      if (user) {
        req.loggedInUser = user;
      }
      next();
    });
  }
  else {
    // if no SESSION cookie, move forward
    next();
  }
}


// -----------------------------------------------------------------------------
// App functions
// -----------------------------------------------------------------------------
// Show a header and footer above and below the page content. MUST wrap every send and redirect in this function
function headfoot(page){
  return `
  <head>
    <link rel="stylesheet" type="text/css" href="style.css">
  </head>
  <body>
    <header>
      <h1>Reddit Clone</h1>
      <nav>
        <a href="https://dc-day14-reddit-nodejs-api-molecularcode-1.c9users.io/?page=1&posts=25">Homepage</a>
        <a href="https://dc-day14-reddit-nodejs-api-molecularcode-1.c9users.io/newpost">Create New Post</a>
        <a href="https://dc-day14-reddit-nodejs-api-molecularcode-1.c9users.io/login">Login</a>
        <a href="https://dc-day14-reddit-nodejs-api-molecularcode-1.c9users.io/signup">Sign Up</a>
      </nav>
    </header>
    ${page}
    <footer><h2>FOOTER</h2></footer>
    </body>
  `;
}

// function to take an aray of objects and return a single string, including HTML
function postsToHTML(result, loggedIn) {
  var htmlMsg = '';
  if (loggedIn === true) {
    htmlMsg = '<div id="hpMsg" class="loggedin">You are already logged in!</div>';
  }
  var htmlStart = '<div id="contents"> <h1>Reddit Clone Homepage</h1> <ul class="contents-list">';
  var htmlEnd = '</ul> </div>';
  var postHTML = result.map(function(res){
    return (
      // post literial using ` and ${} to avoid having to close quotes every time switching from html to JS variable
      `<li class="content-item">
        <h2 class="content-item-title"><a href="${res.url}">${res.title}</a></h2>
        <p>Created by <b>${res.user.username}</b> ${moment(res.createdAt).fromNow()}</p>
        <p>${res.content}</p>
      </li>`
    );
  });
  //console.log(postHTML.join(''));
  return (htmlMsg + htmlStart + postHTML.join('') + htmlEnd);
}

// function to take a single object and return a single string, including HTML and include newCommentForm
function postToHTML(res, allComments, callback) {
  callback(res.id);
  return (
    `<div id="contents"> <h1>${res.title}</h1>
      <p>Created by <b>${res.user.username}</b> ${moment(res.createdAt).fromNow()}</p>
      <p>${res.content}</p>
      <form action="/vote" method="POST">
        <h2>Upvote or downvote the post</h2>
        <button type="submit" name="vote" value="1" > Upvote </button>
        <button type="submit" name="vote" value="-1" > Downvote </button>
      </form>
      ${ncf}
      <div class="comments">
        ${CommentList(allComments)}
      </div>
    </div>`
  );
}

// function to return the comments as nested HTML lists (capitalize 1st letter of function when using React)
function CommentList(allComments) {
  //console.log(allComments);
  return `<ul>
    ${allComments.map(function(comment) {
    //console.log(comment);
      return `<li style="margin-top: 10px;">
        ${comment.comment}<br />
        Posted by <b>${comment.username}</b>  ${moment(comment.cCreatedAt).fromNow()}
        ${comment.replies ? CommentList(comment.replies) : ''}
      </li>`;
    }).join('')}
  </ul>`;
}

// -----------------------------------------------------------------------------
// Reddit Clone
// -----------------------------------------------------------------------------

// Homepage with sort functionality
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
      if (req.query.error === 'loggedIn') {
        sort(sortStr, result, function(sortedRes) {
          
          res.send(headfoot(postsToHTML(sortedRes, true)));
        });
      }
      else {
        sort(sortStr, result, function(sortedRes) {
          res.send(headfoot(postsToHTML(sortedRes, false)));
        });
      }
    }
  });
});


// Signup Page
// -----------------------------------------------------------------------------
// send signup.html file to webpage
app.get('/signup', function(req, res) {
  var options = {
    root: __dirname + '/'
  };

  res.sendFile('signup.html', options, function(err) {
    if (err) {
      res.status(500).send('<h2>ERROR, you have been signed up!</h2>' + err);
    }
    else {
      return;
    }
  });
});


// Create New User
// -----------------------------------------------------------------------------
// take the inputs from filling in and submitting the signup.html form and create a new user. If successful, redirect to the homepage page
app.post('/signup', function(req, res) {
  var newUname = req.body.uname;
  var newPwd = req.body.password;
  redditAPI.createUser({
    username: newUname,
    password: newPwd
  }, function(err, user) {
    //console.log(user);
    if (err) {
      res.send('<h2>ERROR: user not created!</h2>' + err);
    }
    else {
      // redrect to homepage on successful submission
      res.redirect(`/?page=1&posts=25`);
    }
  });
});


// Login Page
// -----------------------------------------------------------------------------
// send signup.html file to webpage
app.get('/login', function(req, res) {
  if (req.loggedInUser) {
    // HTTP status code 401 means Unauthorized
    res.redirect('/?page=1&posts=25&error=loggedIn');
  }
  else {
    var options = {
      root: __dirname + '/'
    };

    res.sendFile('login.html', options, function(err) {
      if (err) {
        res.status(500).send('<h2>ERROR!</h2>' + err);
      }
      else {
        return;
      }
    });
  }
});


// Log User In
// -----------------------------------------------------------------------------
// take the inputs from filling in and submitting the login.html form and verify the login credentials
app.post('/login', function(req, res) {
  var uname = req.body.exUname;
  var pwd = req.body.exPwd;
  redditAPI.verifyLogin({
    username: uname,
    password: pwd
  }, function(err, user) {
    if (err) {
      res.status(401).send(err.message);
    }
    else {
      // password is OK!
      // create a token and send it to the user in his cookies, then add to sessions table
      redditAPI.createSession(user.id, function(err, token) {
        if (err) {
          res.status(500).send('an error occurred. please try again later!');
        }
        else {
          res.cookie('SESSION', token); // the secret token is now in the user's cookies!
          res.redirect('/?page=1&posts=25');
        }
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
      //get me the comments, call back call this shit below
      redditAPI.getCommentsByPost(postId, 3, function(err, results){
        if (err) {
          console.log(err);
        }
        else {
          res.send(headfoot(postToHTML(post, results, function(postId) {
              req.postId = postId; // to be used at some pint with a hidden form field
          })));
        }
      });
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


// Create New Post
// -----------------------------------------------------------------------------
// take the inputs from filling in and submitting the newPostForm.html and create a new post. If successful, redirect to the homepage page showing 5 most recent posts
app.post('/newpost', function(req, res) {
  if (!req.loggedInUser) {
    // HTTP status code 401 means Unauthorized
    res.status(401).send('You need to be <a href="https://dc-day14-reddit-nodejs-api-molecularcode-1.c9users.io/login">logged in to create a new post!</a>');
  }
  else {
    var newTitle = req.body.title;
    var newURL = req.body.url;
    var newContent = req.body.content;
    redditAPI.createPost({
      title: newTitle,
      url: newURL,
      content: newContent,
      userId: req.loggedInUser,
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
  }
});


// Create New Comment
// -----------------------------------------------------------------------------
//  take the input from filling in the comment form on the single comment page (created by ncf - new comment form module). If successful, redirect/refresh single post page
app.post('/newcomment', function(req, res) {
  if (!req.loggedInUser) {
    // HTTP status code 401 means Unauthorized
    res.status(401).send('You need to be <a href="https://dc-day14-reddit-nodejs-api-molecularcode-1.c9users.io/login">logged in to comment on a post!</a>');
  }
  else {
    var newComment = req.body.comment;
    // Need postId from the url of the page where the comment was posted; get url from referer in header, split it at the = of the query string and convert to a number
    var refererURL = req.headers.referer.split('=');
    var postId = Number(refererURL[1]);

    redditAPI.createComment({
      text: newComment,
      userId: req.loggedInUser,
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
  }
});


// Create or Update Vote
// -----------------------------------------------------------------------------
//  take the input from clicking the up or down vote buttons form on the single post page. If successful, redirect/refresh single post page
app.post('/vote', function(req, res) {
  if (!req.loggedInUser) {
    // HTTP status code 401 means Unauthorized
    res.status(401).send('You need to be <a href="https://dc-day14-reddit-nodejs-api-molecularcode-1.c9users.io/login">logged in to comment on a post!</a>');
  }
  else {
    var newVote = req.body.vote;
    // Need postId from the url of the page where the comment was posted; get url from referer in header, split it at the = of the query string and convert to a number
    var refererURL = req.headers.referer.split('=');
    var postId = Number(refererURL[1]);

    redditAPI.createOrUpdateVote({
      vote: newVote,
      userId: req.loggedInUser,
      postId: postId
    }, function(err, vote) {
      if (err) {
        res.send('<h2>ERROR: vote could not be created!</h2>' + err);
      }
      else {
        // redrect to single post page on successful submission
        res.redirect(`/post?postid=${vote[0].postId}`);
      }
    });
  }
});


// -----------------------------------------------------------------------------
// You don't have to change anything below this line
// -----------------------------------------------------------------------------
// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});