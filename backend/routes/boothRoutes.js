const express = require('express');
const Booth = require('../models/Booth');
const Customer = require('../models/Customer');
const BoothAssignment = require('../models/BoothAssignment');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const booths = await Booth.find().sort({ boothNumber: 1 });
        const boothAssignments = await BoothAssignment.find().populate('customerId boothId');
        res.json({ booths, boothAssignments });
    } catch (error) {
        res.status(500).json({ message: 'Failed to load booth assignments', error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { customerId, boothId, salesManagerName, status, remark } = req.body;

        if (!customerId || !boothId || !salesManagerName || !status) {
            return res.status(400).json({ message: 'Customer, booth, sales manager, and status are required' });
        }

        const booth = await Booth.findById(boothId);
        const customer = await Customer.findById(customerId);

        if (!booth || !customer) {
            return res.status(404).json({ message: 'Customer or booth not found' });
        }

        if (booth.customerId && booth.customerId.toString() !== customerId && status === 'Assigned') {
            return res.status(409).json({ message: 'Booth already assigned to another customer' });
        }

        booth.customerId = customer._id;
        booth.status = status === 'Assigned' ? 'Assigned' : booth.status;
        await booth.save();

        customer.assignedBooth = booth.boothNumber;
        customer.eventStatus = status;
        await customer.save();

        const assignment = await BoothAssignment.create({
            customerId,
            boothId,
            boothNumber: booth.boothNumber,
            salesManagerName,
            status,
            remark: remark || ''
        });

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create booth assignment', error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const assignment = await BoothAssignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const { boothId, salesManagerName, status, remark } = req.body;

        if (boothId && boothId !== assignment.boothId.toString()) {
            const newBooth = await Booth.findById(boothId);
            if (!newBooth) {
                return res.status(404).json({ message: 'Booth not found' });
            }
            if (newBooth.customerId && newBooth.customerId.toString() !== assignment.customerId.toString() && status === 'Assigned') {
                return res.status(409).json({ message: 'Booth already assigned to another customer' });
            }

            const previousBooth = await Booth.findById(assignment.boothId);
            if (previousBooth) {
                previousBooth.customerId = null;
                previousBooth.status = 'Available';
                await previousBooth.save();
            }

            newBooth.customerId = assignment.customerId;
            newBooth.status = status === 'Assigned' ? 'Assigned' : newBooth.status;
            await newBooth.save();

            assignment.boothId = newBooth._id;
            assignment.boothNumber = newBooth.boothNumber;
        }

        if (salesManagerName) assignment.salesManagerName = salesManagerName;
        if (status) assignment.status = status;
        if (remark !== undefined) assignment.remark = remark;

        await assignment.save();

        const customer = await Customer.findById(assignment.customerId);
        if (customer) {
            customer.assignedBooth = assignment.boothNumber;
            customer.eventStatus = status || customer.eventStatus;
            await customer.save();
        }

        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update booth assignment', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const assignment = await BoothAssignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const booth = await Booth.findById(assignment.boothId);
        const customer = await Customer.findById(assignment.customerId);

        if (booth) {
            booth.customerId = null;
            booth.status = 'Available';
            await booth.save();
        }

        if (customer) {
            customer.assignedBooth = null;
            customer.eventStatus = 'Checked-In';
            await customer.save();
        }

        await assignment.deleteOne();
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete booth assignment', error: error.message });
    }
});

module.exports = router;
