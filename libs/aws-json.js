const myutils = require("./utils");

// import {logJson, errIf}  from './libs/utils.js';
const {logJson, errIf} = require('./utils');


module.exports = {
  autoCleanAwsJson,
  objKeyArray,
  idKeyFromType,
};



/**
 *
 * @param orig - already-existing object to hold results
 * @param json - new AWS object of objects
 */
function autoCleanAwsJson(orig, json) {
  let data = {awsOrig:{}, data:{}};
  for (const key in json) {
    const obj = json[key];
    const subItems = objKeyArray(obj);
    for (const item of subItems) {
      const [subKey, subKeyId, map, awsValues] = item;    /* 'Vpcs', 'VpcId', {'vpc-abc123':vpcData}, [Vpcs array] */
      data.awsOrig[subKey] = [data.awsOrig[subKey] || [], ...awsValues];
      data.data[subKey] = {...(data.data[subKey] || {}), ...map};
    }
  }

  const result = {...orig,
    awsOrig: {
      ...(orig.awsOrig || {}),
      ...data.awsOrig,
    },
    data: {
      ...(orig.data || {}),
      ...data.data,
    }
  };

  return result;
}

function objKeyArray(obj, extra ={}) {
  let result = [];
  for (let key in obj) {
    if (key[0] === '$') { continue; }
    if (key === 'NextToken') { continue; }
    if (!Array.isArray(obj[key])) { continue; }
    if (obj[key].length === 0) { continue; }

    let   level1Values = obj[key];

    const root   = key.substring(0, key.length-1);      /* key: 'Vpcs', root: 'Vpc' */
    let   idKey  = root + 'Id';                        /* idKey: 'VpcId' */
    let   map    = {};
    let   values = [...level1Values];

    if (key === 'Reservations') {
      values = [];
    }

    if (Array.isArray(level1Values)) {
      for (let value of level1Values) {
        value = {...value, ...extra};

        let itemKey = value[idKey];
        itemKey = itemKey || value[key + 'Id'];
        itemKey = itemKey || value[idKeyFromType(key)];

        errIf(!itemKey, `Cannot determine key`, {root, idKey, item: value});

        // Special processing for instances -- value is the list of reservations: {Groups:[], Instances:[], ...}
        if (key === 'Reservations') {

          const reservation = {...value};
          const {OwnerId, RequesterId, ReservationId} = reservation;
          const subItems = objKeyArray(reservation, {OwnerId, RequesterId, ReservationId});
          for (let subItem of subItems) {
            const [subKey, subKeyId, oneInstancesMap, oneInstancesAwsValues] = subItem;     /* 'Instances', 'InstanceId', {'i-abc123':instanceData}, [Instances array] */
            if (subKey !== 'Instances') {
              continue                                              /* subKey will also be 'Groups', 'OwnerId', 'RequesterId', etc */
            }

            map = {...map, ...oneInstancesMap};
            values = [...values, ...oneInstancesAwsValues];
          }

        } else {
          map[itemKey] = {...value};
        }
      }

      if (key === 'Reservations') {
        key = 'Instances';
        idKey = 'InstanceId';
      }

      result.push([key, idKey, map, values]);     /* 'Vpcs', 'VpcId', {'vpc-abc123':vpcData}, [Vpcs array] */
    }
  }

  return result;
}

function idKeyFromType(key) {
  if (key === 'Addresses') {
    return 'AllocationId';
  }

  if (key === 'SecurityGroups') {
    return 'GroupId';
  }

  return 'ERROR_UNKKEYId';
}

