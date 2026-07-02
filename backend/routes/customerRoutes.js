const express = require('express');
const Customer = require('../models/Customer');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { search, status } = req.query;
        const filter = {};

        if (search) {
            const q = new RegExp(search, 'i');
            filter.$or = [{ name: q }, { mobileNumber: q }];
        }

        if (status) {
            filter.eventStatus = status;
        }

        const list = await Customer.find(filter).sort({ createdAt: -1 });
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, mobileNumber, email, projectName } = req.body;
        let qrCode = req.body.qrCode;

        if (!name || !mobileNumber || !email || !projectName) {
            return res.status(400).json({ message: 'All fields except QR code are required' });
        }

        if (!qrCode) {
            const crypto = require('crypto');
            qrCode = crypto.randomUUID();
        }

        const existing = await Customer.findOne({ qrCode });
        if (existing) {
            return res.status(409).json({ message: 'QR Code already exists' });
        }

        const newCustomer = await Customer.create({
            name,
            mobileNumber,
            email,
            projectName,
            qrCode,
            eventStatus: 'Waiting',
            assignedBooth: null,
            qrUsed: false,
            statusHistory: [{ status: 'Waiting', remark: 'Created' }]
        });

        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create customer', error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch customer', error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const customer = await Customer.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update customer', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete customer', error: error.message });
    }
});

module.exports = router;
