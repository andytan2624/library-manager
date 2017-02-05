var express = require('express');
var router = express.Router();
var Patron = require("../models").Patron;
var Book = require("../models").Book;
var Loan = require("../models").Loan;

module.exports = router;

// GET patron listings
router.get('/', function(req, res, next) {
   Patron.findAll().then(function(patrons) {
       res.render("patrons/all_patrons", {patrons: patrons, title: "Patrons"});
   }).catch(function(err){
      res.send(500);
   });
});

// ADD book listings
router.get('/add', function(req, res, next) {
    res.render("patrons/new_patron", {patron: Patron.build(), title: "New Patron"});
});

// POST - Create a new patron
router.post('/', function(req, res, next) {
    Patron.build(req.body).save().then(function(patron){
        res.redirect("/patrons");
    }).catch(function(err){
        if (err.name === "SequelizeValidationError") {
            res.render("patrons/new_patron", {
                patron: Patron.build(req.body),
                title: "New Patron",
                errors: err.errors
            });
        }
    }).catch(function(err){
        res.sendStatus(500);
    });
});


// Get patron Details
router.get('/:id', function(req, res, next) {
    Patron.findById(req.params.id, {include: [{model: Loan, required: false, include: [{model: Book}]}]}).then(function(patronDetails){
        if (patronDetails) {
            res.render("patrons/patron_detail", {patron: patronDetails, loans: patronDetails.Loans, title: 'Patron: ' + patronDetails.first_name + ' ' + patronDetails.last_name})
        } else {
            res.sendStatus(400);
        }
    }).catch(function(err){
        res.sendStatus(500);
    });
});

// POST - Save patron details
router.post("/:id", function(req, res, next){
    Patron.findById(req.params.id).then(function(patron){
        if (patron) {
            return patron.update(req.body);
        } else {
            res.sendStatus(400);
        }
    }).catch(function(err){
        if(err.name === "SequelizeValidationError") {
            Patron.findById(req.params.id, {include: [{model: Loan, required: false, include: [{model: Book}]}]}).then(function(patronDetails){
                if (patronDetails) {
                        res.render("patrons/patron_detail", {
                            patron: Patron.build(req.body),
                            loans: patronDetails.Loans,
                            title: 'Patron: ' + patronDetails.first_name + ' ' + patronDetails.last_name,
                            errors: err.errors
                        }
                    )
                } else {
                    res.sendStatus(400);
                }
            });
        } else {
            throw err;
        }
    }).then(function(patron){
        res.redirect("/patrons/" + patron.id);
    });

});