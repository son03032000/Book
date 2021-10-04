var express = require('express');
var router = express.Router();

var author_controller = require('../controllers/author');
/* GET request for list of all Authors. */
router.get('/authors/:filter/:value/:page', author_controller.author_list);

router.post('/authors/:filter/:value/:page', author_controller.findAuthors)
/* GET request for one Author. */
router.get('/author/details/:author_id', author_controller.author_detail);

module.exports = router;