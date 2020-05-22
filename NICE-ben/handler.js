'use strict';
const AWS = require('aws-sdk'); //requires AWS
const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2019.11.21' }); //requires DynamoDB
const uuid = require('uuid/v4'); //requires UUID, the thing that generates the IDs for us

const benismsTable = process.env.BENISMS_TABLE;

//PLAN:
//-fetch all (for the dictionary)
//-fetch randomised (for the TAG)
//-post (for the form)

//helper function to create the response sent:
function response(statusCode, message) {
  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': 'GET, OPTIONS, POST, PUT',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  };
}

//--------GET ALL BENISMS:--------

module.exports.getAllBenisms = (event, context, callback) => {
  return db
    .scan({
      TableName: benismsTable,
    })
    .promise()
    .then((res) => callback(null, response(200, res.Items)))
    .catch((err) => callback(null, response(err.statusCode, err)));
};

//--------POST NEW BENISM:--------

module.exports.addBenism = (event, context, callback) => {
  const reqBody = JSON.parse(event.body); //request body

  //id, created date, and form fields:
  const benism = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    benismName: reqBody.benismName,
    benismDef: reqBody.benismDef,
  };

  return db
    .put({
      TableName: benismsTable,
      Item: benism,
    })
    .promise()
    .then(() => {
      callback(null, response(200, org));
    })
    .catch((err) => response(null, response(err.statusCode, err)));
};

//--------GET ORG BY ID:--------TODO: search term??
//TODO: use .includes() on the dictionary lookup?
