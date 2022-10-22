
import {EC2}    from '@aws-sdk/client-ec2';

const ec2 = new EC2({
  region: process.env.AWS_REGION || 'us-east-1',
});

// invoke main
void async function() {await main();}();

async function main() {
  const vpcs = await ec2.describeVpcs({});
  const subnets = await ec2.describeSubnets({});
  const routeTables = await ec2.describeRouteTables({});
  const gw = await ec2.describeInternetGateways({});
  const dhcpOptions = await ec2.describeDhcpOptions({});
  const elasticIps = await ec2.describeAddresses({});
  const endpoints = await ec2.describeVpcEndpoints({});
  const natGateways = await ec2.describeNatGateways({});
  const peering = await ec2.describeVpcPeeringConnections({});
  const acls = await ec2.describeNetworkAcls({});
  const sgs = await ec2.describeSecurityGroups({});

  const instances = await ec2.describeInstances({});
  const keys = await ec2.describeKeyPairs({});
  const volumes = await ec2.describeVolumes({});

  const i = 10;
}

