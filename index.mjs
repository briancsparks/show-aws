
import {logJson, errIf}  from './libs/utils.js';
import {EC2}    from '@aws-sdk/client-ec2';
import {S3}     from '@aws-sdk/client-s3';
import {autoCleanAwsJson, objKeyArray, idKeyFromType} from './libs/aws-json.js';

const ec2 = new EC2({region: process.env.AWS_REGION || 'us-east-1'});
const s3  = new S3({region: process.env.AWS_REGION || 'us-east-1'});

// DataExchange
// EC2, S3, VPC, ELB, Route53, Lambda, CloudWatch, Auto Scaling, CloudFormation, IAM, Cognito
// DynamoDB, Timestream
// Amplify, AppSync, Step Functions, EventBridge, SNS, SES, SQS
// API Gateway
// Graphana, Prometheus

// invoke main
void async function() {await main();}();

async function main() {
  let resolved;
  let data = {};

  const ec2data = await getEC2();
  const s3data = await getS3();

  data = merge(data, ec2data, s3data);

  const i = 10;
}


async function getRoute53() {
  let resolved, data;

  // S3
  let buckets   = s3.listBuckets({});
  // let objects   = s3.listObjects({Bucket: 'jordan-datascience'})
  // let objects2  = s3.listObjectsV2({Bucket: 'jordan-datascience'});

  resolved      = await Promise.all([buckets /*, objects2, objects*/]);
  [buckets /*, objects2, objects*/] = resolved;

  data = autoCleanAwsJson({}, {buckets /*, objects2, objects*/});
  // logJson(data);

  return data;
}


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

async function getEC2() {
  let resolved, data;

  // VPC and EC2
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

  resolved = await Promise.all([vpcs, subnets, routeTables, gw, dhcpOptions, elasticIps, endpoints, natGateways, peering, acls, sgs, instances, keys, volumes]);

  [vpcs, subnets, routeTables, gw, dhcpOptions, elasticIps, endpoints, natGateways, peering, acls, sgs, instances, keys, volumes] = resolved;
  data = {vpcs, subnets, routeTables, gw, dhcpOptions, elasticIps, endpoints, natGateways, peering, acls, sgs, instances, keys, volumes};

  data = autoCleanAwsJson({}, data);
  // logJson(data);

  return data;
}

async function getS3() {
  let resolved, data;

  // S3
  let buckets   = s3.listBuckets({});
  // let objects   = s3.listObjects({Bucket: 'jordan-datascience'})
  // let objects2  = s3.listObjectsV2({Bucket: 'jordan-datascience'});

  resolved      = await Promise.all([buckets /*, objects2, objects*/]);
  [buckets /*, objects2, objects*/] = resolved;

  data = autoCleanAwsJson({}, {buckets /*, objects2, objects*/});
  // logJson(data);

  return data;
}


