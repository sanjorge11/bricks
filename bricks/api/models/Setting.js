/**
 * Setting
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	
  	name: {
        type: 'string',
        notEmpty: true,
        required: true,
        unique: true
    },
    on: {
        type: 'boolean',
    },
    value: {
        type: 'float',
    },
  
  }

};
