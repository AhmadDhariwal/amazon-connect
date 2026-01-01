const express = require('express');
const { createitems,getitems,updatebyid,deletebyid } = require('../controllers/controller');
const router = express.Router();


router.get('/home', (req, res) => {
  res.send({ message: 'Home route working' });
});
router.post('/',createitems);
router.get('/',getitems);
router.delete('/:id',deletebyid);
router.put('/:id',updatebyid);

module.exports = router;