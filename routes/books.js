var express = require('express');
var router = express.Router();
var Book = require("../models").Book;
var Loan = require("../models").Loan;
var Patron = require("../models").Patron;

// GET book listings
router.get('/', function(req, res, next) {
    Book.findAll({order: [["title", "ASC"]]}).then(function(books){
        res.render("books/all_books", {books: books, title: "Books"});
    }).catch(function(err){
        console.log(err);
       res.sendStatus(500);
    });
});

// Get checked out book listings
router.get('/overdue', function(req, res, next) {
    Book.findAll({include: [{model: Loan, required: true}], where: {'$Loans.return_by$' : {lt: new Date()},'$Loans.returned_on$' : null}, order: [["title", "ASC"]]}).then(function(books){
        res.render("books/all_books", {books: books, title: "Checked Out Books"});
    }).catch(function(err){
        res.sendStatus(500);
    });
});

// Get overdue book listings
router.get('/checked', function(req, res, next) {
    Book.findAll({include: [{model: Loan, required: true}], where: {'$Loans.returned_on$' : null}, order: [["title", "ASC"]]}).then(function(books){
        res.render("books/all_books", {books: books, title: "Overdue Books"});
    }).catch(function(err){
        res.sendStatus(500);
    });
});

// ADD book listings
router.get('/add', function(req, res, next) {
    res.render("books/new_book", {book: Book.build(), title: "New Book"});
});

// POST - Create a new book
router.post('/', function(req, res, next) {
    Book.build(req.body).save().then(function(book){
        res.redirect("/books");
    }).catch(function(err){
        if (err.name === "SequelizeValidationError") {
            res.render("books/new_book", {
                book: Book.build(req.body),
                title: "New Book",
                errors: err.errors
            });
        }
    }).catch(function(err){
       res.sendStatus(500);
    });
});


// Get Book Details
router.get('/:id', function(req, res, next) {
    Book.findById(req.params.id, {include: [{model: Loan, required: false, include: [{model: Patron}]}]}).then(function(bookDetails){
        if (bookDetails) {
            res.render("books/book_detail", {book: bookDetails, loans: bookDetails.Loans, title: 'Book: ' + bookDetails.title})
        } else {
            res.sendStatus(400);
        }
    }).catch(function(err){
       res.sendStatus(500);
    });
});

// Save book details
router.post("/:id", function(req, res, next){

    Book.findById(req.params.id).then(function(book){
        if (book) {
            return book.update(req.body);
        } else {
            res.sendStatus(400);
        }
    }).catch(function(err){
        if(err.name === "SequelizeValidationError") {
            res.render("books/book_detail", {
                book: book,
                loans: book.Loans,
                title: "Book: " + book.title,
                errors: err.errors
            });
        } else {
            throw err;
        }
    }).then(function(book){
        res.redirect("/books/" + book.id);
    });

});

module.exports = router;
