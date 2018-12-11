/**
 * UserController
 */

module.exports = {
   
    setup: function (req, res) {
        if (!req.user) {
            return res.redirect("/login");
        }
        User.find({admin: true}).exec(function(err, users) {
            if(users.length == 0) {    
                return res.redirect("/setup");
            } else {
                return res.redirect("/");
            }
        });
    },
    read: function (req, res) {
        var id = req.param("id") || null;
        var onyen = req.param("onyen") || null;
        var me = req.param("me") || null;

        if(id){
            User.findOne({id:id}).exec(function (err, user) {
                if (err) {
                    res.send(500, {error: "DB error finding user"});
                    return;
                } else {
                    res.send(user);
                }
            });
        }else if(onyen){
            User.findOne({username:onyen}).exec(function (err, user) {
                if (err) {
                    res.send(500, {error: "DB error finding user"});
                    return;
                } else {
                    res.send(user);
                }
            });
        }else if(me){
            User.findOne({username:req.user.username}).exec(function (err, user) {
                if (err) {
                    res.send(500, {error: "DB error finding user"});
                    return;
                } else {
                    res.send(user);
                }
            });

        } else {
            User.find()
            .sort({"displayName": 1})
            .exec(function(err, users) {
                res.send(users);
            });
        }

       
    },

    delete: function (req, res) {
        var onyen = req.param("onyen");    
        User.destroy({username: onyen}).done(function(err, user){
            if(err){
                console.log(err);
            } else {
            }
        });
        //delete all children submissions
        Submission.find({user: onyen}).done(function(err, submissions){
            if(submissions.length == 0){
                res.end();
            }
          submissions.forEach( function (submission) {
              Submission.destroy({id: submission.id}).done(function(err, submission){
                if(err){
                    console.log(err);
                } else {
                  res.end();
                }
              });
          });
        });


    },

    readAdmin: function (req, res) {
        User.find({admin: true})
        .sort({"displayName": 1})
        .exec(function(err, users) {
            if(err) {
                console.log(err);
            } else {
                res.send(users);
            }
        });
    },
    setAdmin: function (req, res) {
        if(req.user.admin) {
            var id = req.param("user");
            User.update({username: id}, {admin: true}).exec(function(err, user) {
                if(err) {
                    console.log(err);
                    res.send(500, {error: "DB Error updating user"});
                } else if (user.length > 0) {
                    res.send(user[0]);
                } else {
                    res.send(null);
                }
            });
        } else {
            User.find({admin: true}).exec(function(err, user) {
                if(user.length > 0) {
                    console.log("User is not admin and therefore cannot set admin");
                } else {
                     var id = req.user.id;
                     User.update({id: id}, {admin: true}).exec(function(err, user) {
                        if(err) {
                            res.send(500, {error: "DB Error updating user"});
                        } else {
                            res.redirect("/admin");
                        }
                    });
                }
            });
        }
    },

    removeAdmin: function (req, res) {
        var id = req.param("id");
        User.update({id: id}, {admin: false}).exec(function(err, user) {
            if(err) {
                console.log(err);
            } else {
                res.send(user);
            }
        });
    },

    updateScore: function (req, res) {
        var id = req.param("user");
        var onyen = req.param("onyen");
        var currentScore = req.param("currentScore");
        if(onyen){
            var float = parseFloat(parseFloat(currentScore).toFixed(4));
            User.update({username: onyen}, {currentScore: float.toFixed(4)}).exec(function(err, user) {
                if(err) {
                    console.log(err);
                } else {
                    res.send(user);
                }
            });
        }else {
            var float = parseFloat(parseFloat(currentScore).toFixed(4));
            User.update({username: req.user.username}, {currentScore: float.toFixed(4)}).exec(function(err, user) {
                if(err) {
                    console.log(err);
                } else {
                    res.send(user);
                }
            });
        }
    },

    //Save student's current draft of code to appear next time they reload the window
    saveCode: function (req, res) {
        var code = req.param("code");
        var username = req.user.username;
        User.update({username: username}, {latestCode: code}).exec(function(err, user) {
            if(err) {
                console.log(err);
            } else {
                res.send(user);
            }
        });
    },

    changeName: function (req, res) {
        var name = req.param("name");
        var onyen = req.param("onyen");
        User.update({username: onyen}, {displayName: name}).exec(function(err, user) {
            if(err) {
                console.log(err);
            } else {
                res.send(user);
            }
        });
    },
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {}

  
};
