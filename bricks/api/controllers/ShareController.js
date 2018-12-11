/**
 * ShareController
 */

module.exports = {

  //make code available for users to get a copy
  publish: 
    function (req, res) {
      var txt = req.param("code");
      var dnm = req.param("donorname");
      // if the tuple is there already this will and shoul fail
      // as the model has unique donorname
      // so one may not share new code until you unshare the one thats there
      Share.create({donorname:dnm, code:txt, active:true}).exec(
        function(err, user) {
          if(err) { console.log(err); } 
          else { res.send(user); }
        }
      );
    },

  //remove code tuple to get it unshared
  unpublish: 
    function (req, res) {
      var dnm = req.param("donorname");
      // so one may not share new code until you unshare the one thats there
      Share.destroy({donorname:dnm}).exec(
        function(err, user) {
          if(err) { console.log(err); } 
          else { res.send(user); }
        }
      );
    },

  //remove code tuple to get it unshared
  getpublished: 
    function (req, res) {
      var dnm = req.param("donorname");
      // so one may not share new code until you unshare the one thats there
      Share.findOne({donorname:dnm}).exec(
        function(err, share) {
          if(err) { console.log(err); } 
          else { res.send(share); }
        }
      );
    },
   
/*
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
/*

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {}

  
};
