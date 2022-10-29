
const {inspect} = require('util');

const logit = function (obj) {
  console.log(inspect(obj, {depth:null, colors:true}));
};

const logJson = function (obj) {
  console.log(inspect(obj, {depth:null}));
};

const errJson = function (msg, obj) {
  console.error(msg, inspect(obj, {depth:null, colors:true}));
};

const errIf = function (test, msg, obj) {
  if (test) {
    console.error(msg, inspect(obj, {depth:null, colors:true}));
  }
};

module.exports = { logit, logJson, errJson, errIf };



