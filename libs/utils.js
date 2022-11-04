
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


module.exports = { logit, logJson, errJson, errIf, merge };



/** -------------------------------------------------------------------------------------------------------------------
 *
 * @param datasets
 * @returns {{}}
 */
function merge(...datasets) {
  let result = {};
  for (const ds of datasets) {
    result = {...result,
      awsOrig: {
        ...(result.awsOrig || {}),
        ...ds.awsOrig,
      },
      data: {
        ...(result.data || {}),
        ...ds.data,
      }
    };
  }
  return result;
}

