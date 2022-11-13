const myutils = require("./utils");

// import {logJson, errIf}  from './libs/utils.js';
const {logJson, errIf} = require('./utils');


module.exports = {
  autoCleanAwsJson,
  objKeyArray,
  idKeyFromType,
};



/** -------------------------------------------------------------------------------------------------------------------
 *
 * @param json - new AWS object of objects
 */
function autoCleanAwsJson(json) {
  let data = {awsOrig:{}, data:{}};
  for (const key in json) {
    const obj = json[key];
    const subItems = objKeyArray(obj);
    for (const item of subItems) {
      const [subKey, map, awsValues] = item;    /* 'Vpcs', 'VpcId', {'vpc-abc123':vpcData}, [Vpcs array] */
      data.awsOrig[subKey]  = [...(data.awsOrig[subKey] || []), ...awsValues];
      data.data[subKey]     = {...(data.data[subKey] || {}), ...map};
    }
  }

  return data;
}

/** -------------------------------------------------------------------------------------------------------------------
 *
 * @param obj
 * @param extra
 * @returns {*[]}
 */
function objKeyArray(obj, extra ={}) {
  let result = [];
  for (let key in obj) {
    if (key === 'Reservations') {
      return objKeyArrayReservations(obj);
    }

    if (key[0] === '$' || key === 'NextToken' || !Array.isArray(obj[key]))    { continue; }

    let   values  = obj[key];
    let   map     = {};

    if (Array.isArray(values)) {
      for (let value of values) {
        value = {...value, ...extra};

        let   itemKey = getItemKey(value, key);
        errIf(!itemKey, `Cannot determine itemKey`, {key, item: value});

        map[itemKey] = {...value};
      }

      result.push([key, map, values]);     /* 'Vpcs', {'vpc-abc123':vpcData}, [Vpcs array] */
    }
  }

  return result;
}

/** -------------------------------------------------------------------------------------------------------------------
 *
 * @param obj
 * @returns {*[]}
 */
function objKeyArrayReservations(obj) {
  let result = [];
  for (let key in obj) {
    if (key[0] === '$' || key === 'NextToken' || !Array.isArray(obj[key]))    { continue; }

    let   level1Values  = obj[key];
    let   map           = {};
    let   values        = [];

    if (Array.isArray(level1Values)) {
      for (let value of level1Values) {

        let itemKey = getItemKey(value, key);
        errIf(!itemKey, `Cannot determine itemKey`, {key, item: value});

        // Special processing for instances -- value is the list of reservations: {Groups:[], Instances:[], ...}
        if (key === 'Reservations') {

          const reservation = {...value};
          const {OwnerId, RequesterId, ReservationId} = reservation;
          const subItems = objKeyArray(reservation, {OwnerId, RequesterId, ReservationId});
          for (let subItem of subItems) {
            const [subKey, oneInstancesMap, oneInstancesAwsValues] = subItem;     /* 'Instances', 'InstanceId', {'i-abc123':instanceData}, [Instances array] */
            if (subKey !== 'Instances') {
              continue                                              /* subKey will also be 'Groups', 'OwnerId', 'RequesterId', etc */
            }

            map = {...map, ...oneInstancesMap};
            values = [...values, ...oneInstancesAwsValues];
          }

        }
      }

      key = 'Instances';
      // idKey = 'InstanceId';

      result.push([key, map, values]);     /* 'Vpcs', 'VpcId', {'vpc-abc123':vpcData}, [Vpcs array] */
    }
  }

  return result;
}

/** -------------------------------------------------------------------------------------------------------------------
 *
 * @param value
 * @param key
 * @param root
 * @param idKey
 * @returns {*}
 */
function getItemKey(value, key) {
  const root    = key.substring(0, key.length-1);            /* key: 'Vpcs', root: 'Vpc' */
  let   idKey   = idKeyFromType(key, root + 'Id');      /* idKey: 'VpcId' */
  let itemKey = value[idKey];
  itemKey = itemKey || value[idKey = (key + 'Id')];
  itemKey = itemKey || value[idKey = (root + 'Name')];
  itemKey = itemKey || value[idKey = (key + 'Name')];
  itemKey = itemKey || value[idKey = idKeyFromType(key)];
  itemKey = itemKey || value[idKey = ('Name')];
  itemKey = itemKey || value[idKey = ('Key')];
  itemKey = itemKey || value[idKey = (root)];

  return itemKey;
}

/** -------------------------------------------------------------------------------------------------------------------
 *
 * @param key
 * @param key2
 * @returns {string}
 */
function idKeyFromType(key, key2 =null) {
  if (key === 'Addresses') {
    return 'AllocationId';
  }

  if (key === 'SecurityGroups') {
    return 'GroupId';
  }

  if (key === 'Aliases') {
    return 'Name';
  }

  if (key === 'LayerVersions') {
    return 'Version';
  }

  return key2 || 'ERROR_UNKKEYId';
}

