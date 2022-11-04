
const  { EC2Client }      = require("@aws-sdk/client-ec2");
const  { Route53Client }  = require("@aws-sdk/client-route-53");
const  { S3Client }       = require("@aws-sdk/client-s3");
const  { LambdaClient }   = require("@aws-sdk/client-lambda");

const region = process.env.AWS_REGION || 'us-east-1';

module.exports = {
  ec2Client:      new EC2Client({ region }),
  route53Client:  new Route53Client({ region }),
  s3Client:       new S3Client({ region }),
  LambdaClient:   new LambdaClient({ region }),
};


