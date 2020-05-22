'use strict';
const AWS = require('aws-sdk'); //requires AWS
const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2019.11.21' }); //requires DynamoDB
// const uuid = require('uuid/v4'); //requires UUID, the thing that generates the IDs for us
const { v4: uuidv4 } = require('uuid');

const benismsTable = process.env.BENISMS_TABLE;

//PLAN:
//-fetch all (for the dictionary)
//-fetch randomised (for the TAG)
//-post (for the form)

//lambda functions coming thru but no table

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
  // return callback(null, response(200, { message: 'hello world' }));

  return db
    .scan({
      TableName: benismsTable,
    })
    .promise()
    .then((res) => callback(null, response(200, res.Items)))
    .catch((err) => callback(null, response(err.statusCode, err)));
};

//--------GET BENISM BY ID:--------

module.exports.getBenism = (event, context, callback) => {
  //gets the id out of the url parameters:
  const id = event.pathParameters.id;

  //sets up the params to tell the db which table and that the key will be the id grabbed from the url:
  const params = {
    Key: {
      id: id,
    },
    TableName: benismsTable,
  };

  return db
    .get(params)
    .promise()
    .then((res) => {
      //checks if there's an org with that id; if so, it's stored in res.Item
      if (res.Item) callback(null, response(200, res.Item));
      else
        callback(
          null,
          response(404, { error: 'No Benism with that name found' })
        );
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};

//--------POST NEW BENISM:--------

module.exports.addBenism = (event, context, callback) => {
  const reqBody = JSON.parse(event.body); //request body

  //id, created date, and form fields:
  const benism = {
    // id: Date.now(),
    id: uuidv4(),
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
      callback(null, response(200, benism));
    })
    .catch((err) => response(null, response(err.statusCode, err)));
};

//--------UPDATE BENISM BY ID:--------

module.exports.updateBenism = (event, context, callback) => {
  const id = event.pathParameters.id;
  const reqBody = JSON.parse(event.body);

  const benism = {
    id: id,
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
    .then((res) => {
      callback(null, response(200, res));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};

//--------DELETE BENISM:--------

module.exports.deleteBenism = (event, context, callback) => {
  const id = event.pathParameters.id;

  const params = {
    Key: {
      id: id,
    },
    TableName: benismsTable,
  };

  return db
    .delete(params)
    .promise()
    .then(() =>
      callback(
        null,
        response(200, { message: `Benism ${id} deleted successfully` })
      )
    )
    .catch((err) => callback(null, response(err.statusCode, err)));
};
