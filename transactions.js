const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');

router.get('/initialize', transactionsController.initializeDatabase);
router.get('/transactions', transactionsController.listTransactions);
router.get('/statistics', transactionsController.getStatistics);
router.get('/bar-chart', transactionsController.getBarChart);
router.get('/pie-chart', transactionsController.getPieChart);
router.get('/combined', transactionsController.getCombinedData);

module.exports = router;
