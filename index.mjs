
import {logJson, errIf}  from './libs/utils.js';
import {EC2}    from '@aws-sdk/client-ec2';
import {autoCleanAwsJson, objKeyArray, idKeyFromType} from './libs/aws-json.js';

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

  let   resolved = await Promise.all([vpcs, subnets, routeTables, gw, dhcpOptions, elasticIps, endpoints, natGateways, peering, acls, sgs, instances, keys, volumes]);

  [vpcs, subnets, routeTables, gw, dhcpOptions, elasticIps, endpoints, natGateways, peering, acls, sgs, instances, keys, volumes] = resolved;
  let   data = {vpcs, subnets, routeTables, gw, dhcpOptions, elasticIps, endpoints, natGateways, peering, acls, sgs, instances, keys, volumes};

  ec2.describe

  data = autoCleanAwsJson({}, data);
  logJson(data);

  const i = 10;
}


