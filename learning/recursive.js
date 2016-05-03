// load the mysql library
var mysql = require('mysql');

// create a connection to our Cloud9 server
var c = mysql.createConnection({
  host     : 'localhost',
  user     : 'molecularcode',
  password : '',
  database: 'reddit'
});



//This is an example of a LAMFF function.
//Maxlevel is the base case for our recursive function
//parentIds is not required on the first run so a parameter shift is required
//Notice that the function is oly called with two arguments

function getComments(maxLevel, parentIds, commentsMap, finalComments, callback) {
  //Query declared at top level to build it dynamically.
  var query;
  if (!callback) {
    // first time function is called
    callback = parentIds;
    parentIds = [];
    commentsMap = {};
    finalComments = [];
    query = 'select * from comments where parentId is null';
  }
  //base case scenario - always necessary for recursive function so it knows when to stop
  else if (maxLevel === 0 || parentIds.length === 0) {
    callback(null, finalComments);
    return;
  }
  else {
      // gets children comments
    query = 'select * from comments where parentId in (' + parentIds.join(',') + ')'; // this equates to (1, 2, 3, 4, 5...) ~= where id = 1 or id = 2 or id = 3...
  }
  c.query(query, function(err, res) {
    if (err) {
      callback(err);
      return;
    }
    res.forEach(
      function(comment) {
        commentsMap[comment.id] = comment; // set object key to column header
        if (comment.parentId === null) {
          finalComments.push(comment);
        }
        else {
          var parent = commentsMap[comment.parentId]; // save parentId as var parent
          parent.replies = parent.replies || []; // set reply key as existing array or create reply key as empty array
          parent.replies.push(comment); // push child comment to replies array
        }
      }
    );
    
    var newParentIds = res.map(function(item) {return item.id;}); // get next level of parent ids
    getComments(maxLevel - 1, newParentIds, commentsMap, finalComments, callback); // maxlevel -1 counts down to base case, the function calls itself within the function - recursion
  });
}

getComments(5, function(err, res) {
  console.log(JSON.stringify(res, null, 4));
})