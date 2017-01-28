var express = require('express');
var router = express.Router();
var Book = require("../models").Book;

// GET book listings
router.get('/', function(req, res, next) {
    res.render("books/all_books");
});


// ADD book listings
router.get('/add', function(req, res, next) {
    res.render("books/new_book");
});

// POST - Create a new book
router.post('/', function(req, res, next) {
    Book.create(req.body).then(function(book){
        res.redirect("/books");
    })
    .catch(function(err){
       res.sendStatus(500);
    });
});

module.exports = router;
