/**
 * Global adapter config
 * 
 * The `adapters` configuration object lets you create different global "saved settings"
 * that you can mix and match in your models.  The `default` option indicates which 
 * "saved setting" should be used if a model doesn't have an adapter specified.
 *
 * Keep in mind that options you define directly in your model definitions
 * will override these settings.
 *
 * For more information on adapter configuration, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.adapters = {
 'default': 'mongo',

  mongo: {
      module: 'sails-mongo',
      host: 'localhost',
      port: 27017,
      database: "CrowdSource410",
  }

};

/*
Add these to your setting collection or things may not work!

db.setting.insert({"name":"feedback","on":false})
db.setting.insert({"name":"share","on":false})
db.setting.insert({"name":"points","value":0})

*/
