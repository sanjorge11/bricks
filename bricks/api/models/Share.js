/**
 * Share
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    donorname: {
      type: 'string',
      required: true,
      notEmpty: true,
      unique: true
    },

    code: {
      type: 'string',
      required: true
    },

    active: {
      type: 'boolean',
      required: true
    }

  }

};
