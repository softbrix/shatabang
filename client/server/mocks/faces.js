/*jshint node:true*/
module.exports = function(app) {
  var express = require('express');
  var listRouter = express.Router();


  listRouter.get('/list', function(req, res) {
    res.send([{"key":"2006/02/08/133627.jpg","items":["[{\"i\":\"1A001306119A1777\",\"b\":\"d03fbe4e-23db-49ef-ab01-636956240df9\"}]"]},{"key":"2006/02/06/143115.jpg","items":["[{\"i\":\"E48847D2119A1777\",\"b\":\"6f2cdf2c-b86f-4bd5-8ec2-0f7c181522aa\"}]"]},{"key":"2006/02/06/143156.jpg","items":["[{\"i\":\"68665C9FB33EEF\",\"b\":\"d7c415cd-cf75-451e-b924-d759032c4315\"}]"]},{"key":"2006/02/07/184357.jpg","items":["[{\"i\":\"89FF24444B336444\",\"b\":\"12f7f0c0-4815-4e1f-b054-0a9afe8b070b\"}]"]},{"key":"2006/02/07/173753.jpg","items":["[{\"i\":\"70886E0BECD13BC\",\"b\":\"6f52285d-444e-4e6f-822e-0f33749ced08\"}]"]},{"key":"2005/07/22/230349.jpg","items":["[{\"i\":\"22AB4F4A1C222583\",\"b\":\"032b5816-61ac-4f60-9d26-56daa721329c\"},{\"i\":\"15BC485B26883361\",\"b\":\"a9e61018-68fb-4fe8-97e4-bc2dfc4a93a1\"}]"]},{"key":"2005/07/23/011547.jpg","items":["[{\"i\":\"D888A96BC44105B\",\"b\":\"85bf3d11-4302-4853-8e72-27f65bf41513\"},{\"i\":\"4CCD39F46E449305\",\"b\":\"d4b642c1-3798-4d39-b5fc-a37abc7d55ed\"}]"]},{"key":"2009/05/14/164240.JPG","items":["[{\"i\":\"AB994AAAD5511C7\",\"b\":\"b01a8fd4-8fcf-410e-95e3-3a553d28ab29\"},{\"i\":\"BD77285BE881361\",\"b\":\"736ff773-2699-4f04-b4fe-fb65a7b2eb5c\"},{\"i\":\"43BB4E9412EF193E\",\"b\":\"3e027765-1469-4bbf-b8bc-247e94c56dd4\"}]"]}]).end();
  });

  app.use('/api/faces', listRouter);
};
