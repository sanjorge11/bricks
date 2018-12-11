/**
 * SettingController
 */

module.exports = {
    
  /**
   * Action blueprints:
   *    `/setting/read`
   */
   read: function (req, res) {
      var name = req.param("name") || null;
        Setting.findOne({"name":name}).exec(function (err, setting) {
          if (err) {
            res.send(500, {error: "DB error finding setting"});
            return;
          } else {
            res.send(setting);
          }
        });
  },

  
  /**
   * Action blueprints:
   *    `/folder/update`
   */
   
   update: function (req, res) {
        var name = req.param("name");
        var on = req.param("on");
        var value = req.param("value");

        if(on && !value){
          if(on == "true"){
            on = true;
          }else {
            on = false;
          }
          Setting.update({name:name}, {on: on},{upsert:true}).exec(function(err2, setting) {
              if(err2) {
                  console.log(err2);
              } else {
                  res.send(setting);
              }
          });
        }else {
            var float = parseFloat(parseFloat(value).toFixed(4));
            Setting.update({name:name}, {value: float},{upsert:true}).exec(function(err2, setting) {
                if(err2) {
                    console.log(err2);
                } else {
                    res.send(setting);
                }
            });
        }
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to FolderController)
   */
  _config: {}

  
};
