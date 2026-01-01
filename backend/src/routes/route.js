const express = require('express');
const { createitems,getitems,updatebyid,getbyid,deletebyid } = require('../controllers/controller');
const router = express.Router();


router.get('/home', (req, res) => {
  res.send({ message: 'Home route working' });
});
router.post('/',createitems);
router.get('/',getitems);
router.get('/:id',getbyid);
router.delete('/:id',deletebyid);
router.put('/:id',updatebyid);

module.exports = router;