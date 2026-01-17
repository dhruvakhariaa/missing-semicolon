const express = require('express');
const { check } = require('express-validator');
const {
    registerFarmer,
    loginFarmer,
    getFarmerProfile,
    addLandParcel,
    updateLandParcel,
    enrollInScheme
} = require('../controllers/farmerController');

const router = express.Router();

router.post(
    '/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('phone', 'Please include a valid phone number').isLength({ min: 10, max: 10 }),
        check('aadharNumber', 'Aadhar number is required').not().isEmpty(),
        check('village', 'Village is required').not().isEmpty(),
        check('state', 'State is required').not().isEmpty()
    ],
    registerFarmer
);

router.post('/login', loginFarmer);
router.get('/:id', getFarmerProfile);
router.post('/:id/land', addLandParcel);
router.put('/:id/land/:parcelId', updateLandParcel);
router.post('/:id/schemes/enroll', enrollInScheme);

module.exports = router;
