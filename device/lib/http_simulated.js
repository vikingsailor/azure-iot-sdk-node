// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var ArgumentError = require('azure-iot-common').errors.ArgumentError;
var Message = require('azure-iot-common').Message;
var DeviceToken = require('azure-iot-common').authorization.DeviceToken;
var SharedAccessSignature = require('./shared_access_signature.js');

function Response(statusCode) {
  this.statusCode = statusCode;
}

function makeError(statusCode) {
  var err = new Error();
  err.response = new Response(statusCode);
  return err;
}

function SimulatedHttp(config) {
  this.handleRequest = function(done) {
    var sig = SharedAccessSignature.parse(config.sharedAccessSignature);

    if (config.host === 'bad') {                      // bad host
      done(new Error('getaddrinfo ENOTFOUND bad'));
    }
    else if (config.deviceId === 'bad') {             // bad policy
      done(makeError(404));
    }
    else {
      var cmpSig = (new DeviceToken(config.host, config.deviceId, 'bad', sig.se)).toString();
      if (config.sharedAccessSignature === cmpSig) {  // bad key
        done(makeError(401));
      }
      else {
        done(null, new Response(204));
      }
    }
  };
}

SimulatedHttp.prototype.sendEvent = function (message, done) {
  this.handleRequest(function (err, response) {
    done(err, response);
  });
};

SimulatedHttp.prototype.sendEventBatch = function (message, done) {
  this.handleRequest(function (err, response) {
    done(err, response);
  });
};

SimulatedHttp.prototype.receive = function (done) {
  this.handleRequest(function (err, response) {
    done(err, err ? null : new Message(''), response);
  });
};

SimulatedHttp.prototype.sendFeedback = function (feedbackAction, lockToken, done) {
  if (!lockToken) {
    done(new ArgumentError('invalid lockToken'));
  }
  else if (lockToken === 'FFA945D3-9808-4648-8DD7-D250DDE66EA9') {
    done(makeError(412));
  }
  else {
    this.handleRequest(function (err, res) {
      done(err, res);
    });
  }
};

module.exports = SimulatedHttp;