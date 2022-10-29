
import myutils  from './libs/utils.js';
import {EC2}    from '@aws-sdk/client-ec2';

const {logJson, errIf} = myutils;

const ec2 = new EC2({
  region: process.env.AWS_REGION || 'us-east-1',
});

// invoke main
void async function() {await main();}();

async function main() {
  let   vpcs = ec2.describeVpcs({});
  let   subnets = ec2.describeSubnets({});
  let   routeTables = ec2.describeRouteTables({});
  let   gw = ec2.describeInternetGateways({});
  let   dhcpOptions = ec2.describeDhcpOptions({});
  let   elasticIps = ec2.describeAddresses({});
  let   endpoints = ec2.describeVpcEndpoints({});
  let   natGateways = ec2.describeNatGateways({});
  let   peering = ec2.describeVpcPeeringConnections({});
  let   acls = ec2.describeNetworkAcls({});
  let   sgs = ec2.describeSecurityGroups({});

  let   instances = ec2.describeInstances({});
  let   keys = ec2.describeKeyPairs({});
  let   volumes = ec2.describeVolumes({});

  let   resolved = await Promise.all([vpcs, subnets, routeTables, gw, dhcpOptions, elasticIps, endpoints,
            natGateways, peering, acls, sgs, instances, keys, volumes]);

  [vpcs, subnets, routeTables, gw, dhcpOptions, elasticIps, endpoints, natGateways, peering, acls, sgs, instances, keys, volumes] = resolved;
  let   data = {vpcs, subnets, routeTables, gw, dhcpOptions, elasticIps, endpoints, natGateways, peering, acls, sgs, instances, keys, volumes};

  data = autoCleanAwsJson({}, data);
  logJson(data);

  const i = 10;
}

/**
 *
 * @param data - already-existing object to hold results
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
      // data.data.Vpcs = {...(data.data.Vpcs || {}), ...map}
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

    const root   = key.substring(0, key.length-1);      /* key: 'Vpcs', root: 'Vpc' */
    let   idKey  = root + 'Id';                        /* idKey: 'VpcId' */
    let   map    = {};
    let   values = [];
    let   level1Values = obj[key];
    if (Array.isArray(level1Values)) {
      // const level1ValuesA = {...level1Values};
      // let map = {};

      if (key === 'Reservations') {
        values = [];
      } else {
        values = [...values, ...level1Values];
      }

      for (let value of level1Values) {
        value = {...value, ...extra};
        let itemKey = value[idKey];
        if (!itemKey) {
          idKey = key + 'Id';
          itemKey = value[idKey];
        }
        if (!itemKey) {
          idKey = idKeyFromType(key);
          itemKey = value[idKey];
        }
        errIf(!itemKey, `Cannot determine key`, {root, idKey, item: value});

        let item = {...value};

        // Special processing for instances -- value is the list of reservations: {Groups:[], Instances:[], ...}
        if (key === 'Reservations') {
          // let   instancesMap = {};
          let   instancesAwsValues = [];

          // const reservations = objKeyArray(value);
          const reservation = {...value};
          // for (const reservation of reservations) {
            // OwnerId: '108906662218',
            // RequesterId: '043234062703',
            // ReservationId: 'r-03ea9ff1313a5fd5b'

            const {OwnerId, RequesterId, ReservationId} = reservation;
            const subItems = objKeyArray(reservation, {OwnerId, RequesterId, ReservationId});
            for (let subItem of subItems) {
              const [subKey, subKeyId, oneInstancesMap, oneInstancesAwsValues] = subItem;     /* 'Instances', 'InstanceId', {'i-abc123':instanceData}, [Instances array] */
              if (subKey !== 'Instances') {
                continue                                              /* subKey will also be 'Groups', 'OwnerId', 'RequesterId', etc */
              }

              map = {...map, ...oneInstancesMap};
              values = [...values, ...oneInstancesAwsValues];

              // const instanceId = subItem.InstanceId;
              // subItem = {...subItem, OwnerId, RequesterId, ReservationId};
              //
              // data.awsOrig[subKey] = [data.awsOrig[subKey] || [], ...oneInstancesAwsValues];
              // // data.data.Vpcs = {...(data.data.Vpcs || {}), ...map}
              // data.data[subKey] = {...(data.data[subKey] || {}), ...oneInstancesMap};
            }
          // }

          // // TODO: map[itmKey] = ???
          // map = {...map, ...instancesMap};
          // values = [...values, ...instancesAwsValues];

        } else {
          map[itemKey] = item;
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

