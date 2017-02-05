var express = require('express');
var router = express.Router();
var moment = require('moment');
var Loan = require("../models").Loan;
var Book = require("../models").Book;
var Patron = require("../models").Patron;

module.exports = router;

// GET loan listings
router.get('/', function(req, res, next) {
    Loan.findAll({include: [{model: Book}, {model: Patron}]}).then(function(loans){
        res.render("loans/all_loans", {loans: loans, title: "Loans"});
    }).catch(function(err){
        res.send(500);
    });
});


// GET Overdue loan listings
router.get('/overdue', function(req, res, next) {
    Loan.findAll({include: [{model: Book}, {model: Patron}], where: {'return_by': {lt: moment().format('YYYY-MM-DD').toString()}, 'returned_on' : null}}).then(function(loans){
        res.render("loans/all_loans", {loans: loans, title: "Overdue Loans"});
    }).catch(function(err){
        res.sendStatus(500);
    });
});


// GET checked out  listings
router.get('/checked', function(req, res, next) {
    Loan.findAll({include: [{model: Book}, {model: Patron}], where: {'returned_on' : null}}).then(function(loans){
        res.render("loans/all_loans", {loans: loans, title: "Checked Out Books"});
    }).catch(function(err){
        res.sendStatus(500);
    });
});

// Get create new loan
router.get('/add', function(req, res, next) {
    var bookList;
    Book.findAll({attributes: ['id', 'title']}).then(function(books){
        bookList = books;
    }).then(Patron.findAll({attributes: ['id', 'first_name', 'last_name']}).then(function(patrons){
        res.render("loans/new_loan", {
            loan: Loan.build(
                {
                    loaned_on: moment().format('YYYY-MM-DD'),
                    return_by: moment().add(7, 'days').format('YYYY-MM-DD')
                }
            ),
            books: bookList,
            patrons: patrons,
            title: "New Loan"
        });
    }));
});

// Post create new loan
router.post('/', function(req, res, next) {
    Loan.build(req.body).save().then(function(loan){
        res.redirect("/loans");
    }).catch(function(err){
        if (err.name === "SequelizeValidationError") {
            var bookList;
            Book.findAll({attributes: ['id', 'title']}).then(function(books){
                bookList = books;
            }).then(Patron.findAll({attributes: ['id', 'first_name', 'last_name']}).then(function(patrons){
                res.render("loans/new_loan", {
                    loan: Loan.build(req.body),
                    books: bookList,
                    patrons: patrons,
                    title: "New Loan",
                    errors: err.errors
                });
            }));

        }
    }).catch(function(err){
        res.sendStatus(500);
    });
});

// Get return a book
router.get('/return/:id', function(req, res, next) {
    Loan.findById(req.params.id, {include: [{model: Book}, {model: Patron}]}).then(function(loanDetails) {
        loanDetails.returned_on = moment().format('YYYY-MM-DD');
        res.render("loans/return", {
            loan: loanDetails,
            book: loanDetails.Book,
            patron: loanDetails.Patron,
            title: 'Patron: Return Book'
        });
        //return loan.update({returned_on: moment().format('YYYY-MM-DD')});
    }).catch(function(err){
       res.sendStatus(500);
    });
});

// POST return a book
router.post('/return/:id', function(req, res, next) {
    Loan.findById(req.params.id).then(function(loan) {
        loan.update(req.body);
    }).then(function(loan){
        res.redirect("/loans");
    }).catch(function(err){
        if (err.name === "SequelizeValidationError") {
            Loan.findById(req.params.id, {include: [{model: Book}, {model: Patron}]}).then(function(loanDetails) {
                if (loanDetails) {
                    loanDetails.returned_on = moment().format('YYYY-MM-DD');
                    res.render("loans/return", {
                        loan: loanDetails,
                        book: loanDetails.Book,
                        patron: loanDetails.Patron,
                        title: 'Patron: Return Book'
                    });
                } else {
                    res.sendStatus(400);
                }
            });
        }
    }).catch(function(err){
        res.sendStatus(500);
    });
});


