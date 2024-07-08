const axios = require('axios');
const Transaction = require('../models/Transaction');

const initializeDatabase = async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        await Transaction.deleteMany({});
        await Transaction.insertMany(response.data);
        res.status(200).json({ message: 'Database initialized with seed data' });
    } catch (error) {
        res.status(500).json({ message: 'Error initializing database', error });
    }
};

const listTransactions = async (req, res) => {
    const { page = 1, perPage = 10, search = '', month } = req.query;
    const regex = new RegExp(search, 'i');
    const query = { $or: [{ title: regex }, { description: regex }, { price: regex }] };
    if (month) {
        query.dateOfSale = { $regex: `-${month}-` };
    }

    try {
        const transactions = await Transaction.find(query)
            .skip((page - 1) * perPage)
            .limit(Number(perPage));
        const count = await Transaction.countDocuments(query);
        res.status(200).json({ transactions, count });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error });
    }
};

const getStatistics = async (req, res) => {
    const { month } = req.query;
    const query = month ? { dateOfSale: { $regex: `-${month}-` } } : {};

    try {
        const totalSaleAmount = await Transaction.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);

        const totalSoldItems = await Transaction.countDocuments({ ...query, sold: true });
        const totalNotSoldItems = await Transaction.countDocuments({ ...query, sold: false });

        res.status(200).json({
            totalSaleAmount: totalSaleAmount[0] ? totalSaleAmount[0].total : 0,
            totalSoldItems,
            totalNotSoldItems
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching statistics', error });
    }
};

const getBarChart = async (req, res) => {
    const { month } = req.query;
    const query = month ? { dateOfSale: { $regex: `-${month}-` } } : {};

    const ranges = [
        { range: '0-100', min: 0, max: 100 },
        { range: '101-200', min: 101, max: 200 },
        { range: '201-300', min: 201, max: 300 },
        { range: '301-400', min: 301, max: 400 },
        { range: '401-500', min: 401, max: 500 },
        { range: '501-600', min: 501, max: 600 },
        { range: '601-700', min: 601, max: 700 },
        { range: '701-800', min: 701, max: 800 },
        { range: '801-900', min: 801, max: 900 },
        { range: '901-above', min: 901, max: Infinity },
    ];

    try {
        const barChartData = await Promise.all(ranges.map(async (range) => {
            const count = await Transaction.countDocuments({
                ...query,
                price: { $gte: range.min, $lt: range.max }
            });
            return { range: range.range, count };
        }));
        res.status(200).json(barChartData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bar chart data', error });
    }
};

const getPieChart = async (req, res) => {
    const { month } = req.query;
    const query = month ? { dateOfSale: { $regex: `-${month}-` } } : {};

    try {
        const pieChartData = await Transaction.aggregate([
            { $match: query },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $project: { _id: 0, category: '$_id', count: 1 } }
        ]);
        res.status(200).json(pieChartData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pie chart data', error });
    }
};

const getCombinedData = async (req, res) => {
    const { month } = req.query;

    try {
        const [statistics, barChart, pieChart] = await Promise.all([
            getStatistics({ query: { month } }, res),
            getBarChart({ query: { month } }, res),
            getPieChart({ query: { month } }, res),
        ]);
        res.status(200).json({ statistics, barChart, pieChart });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching combined data', error });
    }
};

module.exports = {
    initializeDatabase,
    listTransactions,
    getStatistics,
    getBarChart,
    getPieChart,
    getCombinedData
};
