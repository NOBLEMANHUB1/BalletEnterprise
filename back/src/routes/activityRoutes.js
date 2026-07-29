 const express = require('express');
const router = express.Router();
const { getLogs, createCartLog } = require('../controllers/activityController');
const { protectAdmin } = require('../middleware/adminMiddleware');

router.get('/', protectAdmin, getLogs);
router.post('/', createCartLog); // public — only allowed to write 'Cart' category events

module.exports = router;