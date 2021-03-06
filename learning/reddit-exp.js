var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;

module.exports = function RedditAPI(conn) {
  return {
    createUser: function(user, callback) {
      
      // first we have to hash the password...
      bcrypt.hash(user.password, HASH_ROUNDS, function(err, hashedPassword) {
        if (err) {
          callback(err);
        }
        else {
          conn.query(
            'INSERT INTO `users` (`username`,`password`, `createdAt`) VALUES (?, ?, ?)', [user.username, hashedPassword, null],
            function(err, result) {
              if (err) {
                /*
                There can be many reasons why a MySQL query could fail. While many of them are unknown, there's a particular error about unique usernames which we can be more explicit about!
                */
                if (err.code === 'ER_DUP_ENTRY') {
                  callback(new Error('A user with this username already exists'));
                }
                else {
                  callback(err);
                }
              }
              else {
                /*
                Here we are INSERTing data, so the only useful thing we get back is the ID of the newly inserted row. Let's use it to find the user and return it
                */
                conn.query(
                  'SELECT `id`, `username`, `createdAt`, `updatedAt` FROM `users` WHERE `id` = ?', [result.insertId],
                  function(err, result) {
                    if (err) {
                      callback(err);
                    }
                    else {
                      /*
                      Finally! Here's what we did so far:
                      1. Hash the user's password
                      2. Insert the user in the DB
                      3a. If the insert fails, report the error to the caller
                      3b. If the insert succeeds, re-fetch the user from the DB
                      4. If the re-fetch succeeds, return the object to the caller
                      */
                        callback(null, result[0]);
                    }
                  }
                );
              }
            }
          );
        }
      });
    },
    createPost: function(post, callback) {
      conn.query(
        'INSERT INTO `posts` (`userId`, `title`, `url`, `createdAt`, `subredditId`) VALUES (?, ?, ?, ?, ?)', [post.userId, post.title, post.url, null, post.subredditId],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            /* Post inserted successfully. Let's use the result.insertId to retrieve the post and send it to the caller! */
            conn.query(
              'SELECT `id`,`title`,`url`,`userId`, `subredditId`, `createdAt`, `updatedAt` FROM `posts` WHERE `id` = ?', [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
    getAllPosts: function(options, callback) {
      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;

      conn.query(`
        SELECT p.id AS pId, p.title AS pTitle, p.url AS pURL, p.userId AS pUserId, p.createdAt AS pCreatedAt, p.updatedAt AS pUpdatedAt, u.id AS uId, u.username AS uUsername, u.password AS uPwd, u.createdAt AS userCreatedAt, u.updatedAt AS userUpdatedAt, s.id AS sId, s.name AS sName, s.url AS sURL, s.description AS sDesc, s.createdAt AS sCreatedAt, s.updatedAt AS sUpdatedAt
        FROM posts AS p
        LEFT JOIN users AS u ON u.id = p.userId
        LEFT JOIN subreddits AS s ON s.id = p.subredditId
        ORDER BY p.createdAt DESC
        LIMIT ? OFFSET ?
        `, [limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            var posts = results.map(function(results){ 
              var pObj = {
                "id": results.pId,
                "title": results.pTitle,
                "url": results.pURL,
                "userId": results.pUserId,
                "createdAt": results.pCreatedAt,
                "updatedAt": results.pUpdatedAt,
                "user": {
                  "id": results.uId,
                  "username": results.uUsername,
                  "password": results.uPwd,
                  "createdAt": results.userCreatedAt,
                  "updatedAt": results.userUpdatedAt
                },
                "subreddit": {
                  "id": results.sId,
                  "name": results.sName,
                  "url": results.sURL,
                  "description": results.sDesc,
                  "createdAt": results.sCreatedAt,
                  "updatedAt": results.sUpdatedAt
                }
              };
              return pObj;
            });
            
            callback(null, posts);
          }
        }
      );
    },
    getAllPostsForUser: function(userId, options, callback) {
      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;

      // If a userId is not provided, terminate the function
      if (typeof userId !== "number") {
        callback("Please enter a valid user ID");
      }
      else {

        conn.query(`
          SELECT p.id AS pId, title AS pTitle, url AS pURL, userId AS pUserId, p.createdAt AS pCreatedAt, p.updatedAt AS pUpdatedAt, u.id AS uId, username AS uUsername, password AS uPwd, u.createdAt AS userCreatedAt, u.updatedAt AS userUpdatedAt
          FROM posts AS p
          JOIN users AS u ON u.id = p.userId AND u.id = ?
          ORDER BY p.createdAt DESC
          LIMIT ? OFFSET ?
          `, [userId, limit, offset],
          function(err, results) {
            if (err) {
              callback(err);
            }
            else {
              var singleUserPosts = results.map(function(results) {
                var psuObj = {
                  "id": results.pId,
                  "title": results.pTitle,
                  "url": results.pURL,
                  "userId": results.pUserId,
                  "createdAt": results.pCreatedAt,
                  "updatedAt": results.pUpdatedAt,
                  "user": {
                    "id": results.uId,
                    "username": results.uUsername,
                    "password": results.uPwd,
                    "createdAt": results.userCreatedAt,
                    "updatedAt": results.userUpdatedAt
                  }
                };
                return psuObj;
              });
              callback(null, singleUserPosts);
            }
          }
        );
      }
    },
    getSinglePost: function(postId, callback) {
      // If a postId is not provided, terminate the function
      if (typeof postId !== "number") {
          callback("Please enter a valid post ID");
        }
    
      conn.query(`
        SELECT p.id AS pId, title AS pTitle, url AS pURL, userId AS pUserId, p.createdAt AS pCreatedAt, p.updatedAt AS pUpdatedAt, u.id AS uId, username AS uUsername, password AS uPwd, u.createdAt AS userCreatedAt, u.updatedAt AS userUpdatedAt
        FROM posts AS p
        JOIN users AS u ON u.id = p.userId AND p.id = ?
        ORDER BY p.createdAt DESC
        `, [postId],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            var post = {
              "id": results[0].pId,
              "title": results[0].pTitle,
              "url": results[0].pURL,
              "userId": results[0].pUserId,
              "createdAt": results[0].pCreatedAt,
              "updatedAt": results[0].pUpdatedAt,
              "user": {
                "id": results[0].uId,
                "username": results[0].uUsername,
                "password": results[0].uPwd,
                "createdAt": results[0].userCreatedAt,
                "updatedAt": results[0].userUpdatedAt
              }
            };
            callback(null, post);
          }
        }
      );
    },
    createSubreddit: function(sub, callback) {
      conn.query(
        'INSERT INTO `subreddits` (`name`, `description`, `createdAt`) VALUES (?, ?, ?)', [sub.name, sub.description, null],
        function(err, result) {
          if (err) {
            /*
            There can be many reasons why a MySQL query could fail. While many of them are unknown, there's a particular error about unique usernames which we can be more explicit about!
            */
            if (err.code === 'ER_DUP_ENTRY') {
              callback(new Error('A subreddit with this name already exists'));
            }
            else {
              callback(err);
            }
          }
          else {
            /* Subreddit inserted successfully. Let's use the result.insertId to retrieve the subreddit and send it to the caller! */
            conn.query(
              'SELECT `id`,`name`, `url`, `description`, `createdAt`, `updatedAt` FROM `subreddits` WHERE `id` = ?', [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
    getAllSubreddits: function(callback) {
      conn.query(`
        SELECT s.id AS sId, name AS sName, url AS sURL, description AS sDesc, s.createdAt AS sCreatedAt, s.updatedAt AS sUpdatedAt
        FROM subreddits AS s
        ORDER BY s.createdAt DESC
        `, function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            var subreddits = results.map(function(results){ 
              var subsObj = {
                "id": results.sId,
                "name": results.sName,
                "url": results.sURL,
                "createdAt": results.sCreatedAt,
                "updatedAt": results.sUpdatedAt,
              };
              return subsObj;
            });
            
            callback(null, subreddits);
          }
        }
      );
    },
    createComment: function(comment, callback) {
    var ifExists;
    if (comment.parentId) {
      ifExists = comment.parentId;
    }
    else {
      ifExists = null;
    }
    conn.query(
        'INSERT INTO comments (comment, userId, postId, parentId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ? );', [comment.text, comment.userId, comment.postId, ifExists, null, null],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            /* Comment inserted successfully. Let's use the result.insertId to retrieve the comment and send it to the caller! */
            conn.query(
              'SELECT `id`,`comment`, `userId`, `postId`, `parentId`, `createdAt`, `updatedAt` FROM `comments` WHERE `id` = ?', [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
    getCommentsForPost: function(postId, callback) {
      // If a postId is not provided, terminate the function
      if (typeof postId !== "number") {
        callback("Please enter a valid post ID");
      }
      else {
        conn.query(`
          SELECT c.id AS cId, c.comment AS cComment, c.userId AS cUserId, c.postId AS cPostId, c.parentId AS cParentId, c.createdAt AS cCreatedAt, c.updatedAt AS cUpdatedAt, r.id AS rId, r.comment AS rComment, r.userId AS rUserId, r.postId AS rPostId, r.parentId AS rParentId, r.createdAt AS rCreatedAt, r.updatedAt AS rUpdatedAt, r2.id AS r2Id, r2.comment AS r2Comment, r2.userId AS r2UserId, r2.postId AS r2PostId, r2.parentId AS r2ParentId, r2.createdAt AS r2CreatedAt, r2.updatedAt AS r2UpdatedAt
          FROM comments AS c
          LEFT JOIN comments AS r ON c.id = r.parentId AND c.postId = ?
          LEFT JOIN comments AS r2 ON r.id = r2.parentId AND r.postId = ?

          `, [postId, postId],
          function(err, results) {
            if (err) {
              callback(err);
            }
            else {
              //console.log(results);
              var binC = {};
              var binR = {};
              var comArr = [];
              results.forEach(function(results) {
                var experiment;
                if (!binC[results.cId]) {
                  binC[results.cId] = results.cId;
                  experiment = {
                    "id": results.cId,
                    "comment": results.cComment,
                    "userId": results.cUserId,
                    "postId": results.cPostId,
                    "parentId": results.cParentId,
                    "createdAt": results.cCreatedAt,
                    "updatedAt": results.cUpdatedAt
                    // "replies": !results.rId ? null : {
                    //   "id": results.rId,
                    //   "comment": results.rComment,
                    //   "userId": results.rUserId,
                    //   "postId": results.rPostId,
                    //   "parentId": results.rParentId,
                    //   "createdAt": results.rCreatedAt,
                    //   "updatedAt": results.rUpdatedAt,
                    //   "replies": !results.r2Id ? null : {
                    //     "id": results.r2Id,
                    //     "comment": results.r2Comment,
                    //     "userId": results.r2UserId,
                    //     "postId": results.r2PostId,
                    //     "parentId": results.r2ParentId,
                    //     "createdAt": results.r2CreatedAt,
                    //     "updatedAt": results.r2UpdatedAt,
                    //   }
                    // }
                  };
                  
                  
                }
                
                if(experiment){
                   if(results.rParentId === experiment.id && !experiment.replies){
                     experiment["replies"] = []
                  } 
                  
               
                   var exp2 = { "id": results.rId,
                      "comment": results.rComment,
                      "userId": results.rUserId,
                      "postId": results.rPostId,
                      "parentId": results.rParentId,
                      "createdAt": results.rCreatedAt,
                      "updatedAt": results.rUpdatedAt
                   }
                   
                   experiment.replies.push(exp2)
                }
                 
        
                
               experiment ? comArr.push(experiment) : null
                // console.log(binC);
                // //console.log(comObj[1]);
                // comArr.forEach(function(results) {
                //   if (results.rParentId === binC[results.cId]) {
                //     binR[results.rParentId] = results.rParentId;
                //     comArr[results.cId - 1].replies = [{
                //       "id": results.rId,
                //       "comment": results.rComment,
                //       "userId": results.rUserId,
                //       "postId": results.rPostId,
                //       "parentId": results.rParentId,
                //       "createdAt": results.rCreatedAt,
                //       "updatedAt": results.rUpdatedAt
                //     }];
                //   }
                //});
              });

              callback(null, comArr);
            }
          }
        );
      }
    }
  };
};

          //ORDER BY c.createdAt DESC
          //WHERE r.parentId != null OR r2.parentID != null