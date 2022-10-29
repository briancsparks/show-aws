const  { Route53Client } = require( "@aws-sdk/client-route-53");
// Set the AWS Region.
const REGION = "REGION"; //e.g. "us-east-1"
// Create anAmazon EC2 service client object.
const route53Client = new Route53Client({ region: REGION });
module.exports = { route53Client };
