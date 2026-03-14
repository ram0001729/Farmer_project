const express = require('express');
const router = express.Router();
const listingCtrl = require('../controllers/listing.controller');
const auth = require('../middlewares/auth.middleware');
const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate');

router.get("/search", listingCtrl.searchListings);

router.post(
  '/',
  auth.authenticate,
  [
    body('title').notEmpty(),
     body("mobile").notEmpty(),
    body("available").optional().isBoolean(),

    body('price').optional().isNumeric(),
    body('priceUnit').optional().isIn(['hour', 'day', 'fixed']),
    body('location.coordinates').optional().isArray({ min: 2, max: 2 })
  ],
  validate,
  listingCtrl.createListing
);


router.get(
  '/',
  [
    query('jobId').optional().isMongoId(),
    query('available').optional().isBoolean(),
  ],
  validate,
  listingCtrl.getListing
);

/**
 * GET single listing
 */
router.get(
  '/:id',
  [param('id').isMongoId()],
  validate,
  listingCtrl.getSingleListing
);

/**
 * UPDATE listing (owner only)
 */
router.patch(
  '/:id',
  auth.authenticate,
  [param('id').isMongoId()],
  validate,
  listingCtrl.updateListing
);


router.patch(
  '/me/availability',
  auth.authenticate,
  listingCtrl.setProviderAvailability
);

router.patch(
  '/:id/availability',
  auth.authenticate,
  [param('id').isMongoId()],
  validate,
  listingCtrl.availableListing
);


router.delete(
  '/:id',
  auth.authenticate,
  param('id').isMongoId(),
  validate,
  listingCtrl.deleteListing
);

router.patch(
  "/location",
  auth.authenticate,
    listingCtrl.updateDriverLocation
);



module.exports = router;

