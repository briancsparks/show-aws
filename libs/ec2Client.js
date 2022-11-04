
const  { EC2Client } = require( "@aws-sdk/client-ec2");

const region = process.env.AWS_REGION || 'us-east-1';
const ec2Client = new EC2Client({region});
module.exports = { ec2Client };

// // Set the AWS Region.
// const REGION = "REGION"; //e.g. "us-east-1"
// // Create anAmazon EC2 service client object.
// const ec2Client = new EC2Client({ region: process.env.AWS_REGION || 'us-east-1' });
// module.exports = { ec2Client };
