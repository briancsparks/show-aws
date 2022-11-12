
import {logJson, errIf, logit, merge, awaitObj} from './libs/utils.js';
import {EC2}    from '@aws-sdk/client-ec2';
import {S3}     from '@aws-sdk/client-s3';
import {Route53}     from '@aws-sdk/client-route-53';
import {Lambda}      from '@aws-sdk/client-lambda';
import {autoCleanAwsJson, objKeyArray, idKeyFromType} from './libs/aws-json.js';

const ec2 = new EC2({region: process.env.AWS_REGION || 'us-east-1'});
const s3  = new S3({region: process.env.AWS_REGION || 'us-east-1'});
const route53  = new Route53({region: process.env.AWS_REGION || 'us-east-1'});
const lambda  = new Lambda({region: process.env.AWS_REGION || 'us-east-1'});

// DataExchange
// EC2, S3, VPC, Route53, Lambda, ELB, CloudWatch, Auto Scaling, CloudFormation, IAM, Cognito
// DynamoDB, Timestream
// Amplify, AppSync, Step Functions, EventBridge, SNS, SES, SQS
// API Gateway
// Graphana, Prometheus


/** -------------------------------------------------------------------------------------------------------------------
 * invoke main
 */
void async function() {await main();}();

/** -------------------------------------------------------------------------------------------------------------------
 *
 * @returns {Promise<void>}
 */
async function main() {
  let resolved;
  let data = {};

  const ec2data       = await getEC2();
  // const s3data        = {} /*await getS3()*/;
  // const route53Data   = await getRoute53();
  // const lambdaData    = await getLambda();

  data = merge(data, lambdaData /*, ec2data, route53Data, s3data*/);
  logit(data);

  const i = 10;
}

/** -------------------------------------------------------------------------------------------------------------------
 *
 * @returns {Promise<*&{data: {}, awsOrig: {}}>}
 */
async function getLambda() {
  let resolved, data;

  // Lambda
  let values0 = {};
  values0.functions = lambda.listFunctions({});
  values0.codeSigningConfigs = lambda.listCodeSigningConfigs({});
  values0.eventSourceMappings = lambda.listEventSourceMappings({});
  values0.layers = lambda.listLayers({});

  values0 = await awaitObj(values0);


  let functions   = values0.functions;
  let fnNames = [];
  for (let i = 0; i < 3 /*functions.Functions.length*/; i++) {
    const fn = functions.Functions[i];
    fnNames.push(fn.FunctionName);

    let values1 = {};
    values1.functionEventInvokeConfigs =  lambda.listFunctionEventInvokeConfigs({FunctionName: fn.FunctionName});
    values1.functionUrlConfigs =  lambda.listFunctionUrlConfigs({FunctionName: fn.FunctionName});
    values1.provisionedConcurrencyConfigs =  lambda.listProvisionedConcurrencyConfigs({FunctionName: fn.FunctionName});
    values1.versionsByFunction =  lambda.listVersionsByFunction({FunctionName: fn.FunctionName});
    values1.aliases = lambda.listAliases({FunctionName: fn.FunctionName});
    values1 = await awaitObj(values1);

    // logJson({i, values1: Object.keys(values1)});

    let x = autoCleanAwsJson(values1);
    functions.Functions[i] = {...functions.Functions[i], ...x.data};
  }

  for (let i = 0; i < values0.layers.Layers.length; i++) {
    const layer = values0.layers.Layers[i];
    const layerVersions = await lambda.listLayerVersions({LayerName: layer.LayerName});

    // logJson({i, values2: Object.keys({layerVersions})});

    let x = autoCleanAwsJson({layerVersions});
    let LayerVersions = {};
    for (const key in x.data.LayerVersions) {
      LayerVersions[`${layer.LayerName}:${key}`] = x.data.LayerVersions[key];
    }

    values0.layers.Layers[i] = {...values0.layers.Layers[i], ...{LayerVersions}};
  }

  // let values3 = {};
  // values3.functionsByCodeSigningConfig = lambda.listFunctionsByCodeSigningConfig({});
  // values3.tags = lambda.listTags({});
  // values3 = awaitObj(values3);

  data = autoCleanAwsJson(values0);

  return data;
}

/** -------------------------------------------------------------------------------------------------------------------
 *
 * @returns {Promise<*&{data: {}, awsOrig: {}}>}
 */
async function getEC2() {
  let resolved, data;

  // VPC
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

  // EC2
  let   instances = ec2.describeInstances({});
  let   keys = ec2.describeKeyPairs({});
  let   volumes = ec2.describeVolumes({});

  // Merged
  resolved = await Promise.all([vpcs, subnets, routeTables, gw, dhcpOptions, elasticIps, endpoints, natGateways, peering, acls, sgs, instances, keys, volumes]);

  [vpcs, subnets, routeTables, gw, dhcpOptions, elasticIps, endpoints, natGateways, peering, acls, sgs, instances, keys, volumes] = resolved;
  data = {vpcs, subnets, routeTables, gw, dhcpOptions, elasticIps, endpoints, natGateways, peering, acls, sgs, instances, keys, volumes};

  data = autoCleanAwsJson(data);
  // logJson(data);

  return data;
}

/** -------------------------------------------------------------------------------------------------------------------
 *
 * @returns {Promise<*&{data: {}, awsOrig: {}}>}
 */
async function getS3() {
  let resolved, data;

  // S3
  let buckets   = s3.listBuckets({});
  // let objects   = s3.listObjects({Bucket: 'jordan-datascience'})
  // let objects2  = s3.listObjectsV2({Bucket: 'jordan-datascience'});

  resolved      = await Promise.all([buckets /*, objects2, objects*/]);
  [buckets /*, objects2, objects*/] = resolved;

  data = autoCleanAwsJson({buckets /*, objects2, objects*/});

  return data;
}

/** -------------------------------------------------------------------------------------------------------------------
 *
 * @returns {Promise<{}>}
 */
async function getRoute53() {
  let resolved, data;

  // Route53
  // let cidrBlocks  = route53.listCidrBlocks({});
  // let geoLocations = route53.listGeoLocations({});
  // let hostedZonesByVpc  = route53.listHostedZonesByVPC({VPCId: 'vpc-06b265e85462f82bf', VPCRegion: 'us-east-1'});

  let hostedZones = route53.listHostedZones({});

  resolved      = await Promise.all([hostedZones /*, cidrBlocks*/ /*, geoLocations*/ /*, hostedZonesByVpc*/]);
  [hostedZones /*, cidrBlocks*/ /*, geoLocations*/ /*, hostedZonesByVpc*/] = resolved;

  data = autoCleanAwsJson({hostedZones /*, cidrBlocks*/ /*, geoLocations*/ /*, hostedZonesByVpc*/});

  // Resource Records (aka DNS records) - must request for a specific domain
  let rrPromises = [];
  for (const hostedZone of hostedZones.HostedZones) {
    let rrSet = route53.listResourceRecordSets({HostedZoneId: hostedZone.Id});
    rrPromises.push(rrSet);
  }
  resolved = await Promise.all(rrPromises);

  // Loop over the domains' records, un-aws-ify them, and prepare to put into 'data'
  let rrSetAws  = [];
  let rrSetData = {};
  for (const awsRrSet of resolved) {
    const rrSet = autoCleanAwsJson({awsRrSet});

    rrSetAws = [...rrSetAws, ...rrSet.awsOrig.ResourceRecordSets];
    rrSetData = {...rrSetData, ...rrSet.data.ResourceRecordSets};
  }

  // Pack the results
  data = merge(data, {
    awsOrig:  {ResourceRecordSets: [...rrSetAws]},
    data:     {ResourceRecordSets: {...rrSetData}}
  });

  return data;
}


