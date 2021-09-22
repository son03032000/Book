var Book = require('../models/book');
var async = require('async');
var Genre = require('../models/genre');



exports.genre_list = async (req, res) => {
try {
  const genre_list = await Genre.find()
    .sort([['name', 'ascending']])
    res.render('genre/genre_list', { title: 'Genre List', genre_list: genre_list});
} catch (err) {
    res.json(err);
}
};
// Display detail page for a specific Genre
exports.genre_detail = function(req, res, next) {

  async.parallel({
    genre: function(data) {
      Genre.findById(req.params.id)
        .exec(data);
    },

    genre_books: function(data) {
      Book.find({ 'genre': req.params.id })
      .exec(data);
    },

  }, function(err, data) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('genre/genre_detail', { title: 'Genre Detail', genre: data.genre, genre_books: data.genre_books } );
  });

};
// Display Genre create form on GET
exports.genre_create_get = function(req, res, next) {
    res.render('genre/genre_form', {title: 'Create Genre'});
};

// Handle Genre create on POST
exports.genre_create_post = function(req, res, next) {

    //Check that the name field is not empty
    req.checkBody('name', 'Genre name required').notEmpty();

    //Trim and escape the name field.
    req.sanitize('name').escape();
    req.sanitize('name').trim();

    //Run the validators
    var errors = req.validationErrors();

    //Create a genre object with escaped and trimmed data.
    var genre = new Genre(
      {name: req.body.name}
    );

    if(errors){
      //If there are errors render the form again, passing the previously values and errors
      res.render('genre/genre_form', {title: 'Create Genre', genre: genre, errors: errors});
      return;
    }
    else {
      //Data from form is valid.
      //Check if Genre with same name already exists
      Genre.findOne({'name': req.body.name})
        .exec(function(err, found_genre){
          console.log('found_genre: ' + found_genre);
          if(err){return next(err); }

          if(found_genre){
            //Genre exists, redirect to its detail page
            res.redirect(found_genre.url);
          }
          else {
            genre.save(function(err){
              if(err){return next(err); }
              //Genre saved. redirect to genre detail page
              res.redirect(genre.url);
            });
          }
        });
    }
};

// Display Genre delete form on GET
exports.genre_delete_get = function(req, res, next) {
    async.parallel({
      genre: function(data){
        Genre.findById(req.params.id).exec(data);
      },
      genre_books: function(data){
        Book.find({'genre': req.params.id }).exec(data);
      },
    }, function(err, data) {
      if(err) {return next(err); }
      //Successful, so render
      res.render('genre/genre_delete', {title: 'Delete Genre', genre: data.genre, genre_books: data.genre_books});
    });
};

// Handle Genre delete on POST
exports.genre_delete_post = function(req, res, next) {
    req.checkBody('genreid', 'Genre id must exist').notEmpty();

    async.parallel({
      genre: function(data){
        Genre.findById(req.body.genreid).exec(data);
      },
      genre_books: function(data){
        Book.find({'genre': req.body.genreid },'title summary').exec(data);
      },
    }, function(err, data){
      if(err){return next(err); }
      //Successful
      if(data.genre_books.length > 0){
        //genre has books. Render in same way as for GET route.
        res.render('genre/genre_delete', {title: 'Delete Genre', genre: data.genre, genre_books: data.genre_books});
        return;
      }
      else {
        //Genre has no books. Delete object and direct to view page
        Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err){
          if(err){return next(err); }
          //Successful, dirent to genre views
          res.redirect('/catalog/genres');
        });
      }
    });
};

// Display Genre update form on GET
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};