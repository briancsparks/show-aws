
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


module.exports = { logit, logJson, errJson, errIf, merge, awaitObj };



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

/** -------------------------------------------------------------------------------------------------------------------
 *
 * @param obj
 * @returns {Promise<{}>}
 */
async function awaitObj(obj) {
  let keys = [], values = [];
  const keys_ = Object.keys(obj);
  for (let i = 0; i < keys_.length; i++) {
    keys.push(keys_[i]);
    values.push(obj[keys_[i]]);
  }
  values = await Promise.all(values);

  let result = {};
  for (let j = 0; j < keys.length; j++) {
    result[keys[j]] = values[j];
  }

  return result;
}

