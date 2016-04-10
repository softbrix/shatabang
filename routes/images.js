"use strict"
var express = require('express');
var router = express.Router(),
    multer  =   require('multer');

var sourceDir;
router.initialize = function(source) {
  sourceDir = source;
};

router.post('/delete',function(req,res){
    //console.log(req);
    res.json(req.body);
});

module.exports = router;
