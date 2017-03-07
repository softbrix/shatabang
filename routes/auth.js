"use strict"
var _ = require('underscore');
var express = require('express');
var router  = express.Router();

var auth_methods = [];

router.initialize = function(config) {
  [{conf : 'admin_hash', name : 'admin'},
   {conf : 'google_client_id', name : 'google'} ]
   .forEach(function(e) {
     if(!_.isEmpty(config[e.conf])) {
         auth_methods.push(e.name);
     }
   });
};

router.get('/list',function(req,res){
    res.setHeader('content-type', 'application/json');
    res.send(auth_methods).status(200);
});

module.exports = router;
