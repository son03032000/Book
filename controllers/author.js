var async = require("async");
var Book = require("../models/book");
var Author = require("../models/author");

// Hiển thị danh sách tất cả các tác giả
exports.author_list = async (req, res, next) => {
  try {
    const list_authors = await Author.find().sort([["last_name", "ascending"]]);
    if (list_authors) {
      return res.render("author/author_list", {
        title: "Author List",
        author_list: list_authors,
      });
    }
  } catch (error) {
    res.json({ error, mess: "server error", status: 500 });
  }
};

exports.author_detail = (req, res, next) => {
  async.parallel(
    {
      author: function (data) {
        Author.findById(req.params.id).exec(data);
      },
      authors_books: function (data) {
        Book.find({ author: req.params.id }, "title summary").exec(data);
      },
    },
    function (err, data) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("author/author_detail", {
        title: "Author Detail",
        author: data.author,
        author_books: data.authors_books,
      });
    }
  );
};

// Hiển thị Tác giả tạo biểu mẫu on GET
exports.author_create_get = (req, res) => {
  res.render("author/author_form", { title: "Create Author" });
};

// Xử lý Tác giả tạo on POST
exports.author_create_post = (req, res) => {
  req.checkBody("first_name", "First name must be specified.").notEmpty(); //Chúng tôi sẽ không ép buộc chữ và số, vì mọi người có thể có khoảng trắng.
  req.checkBody("last_name", "last name must be specified.").notEmpty();
  req
    .checkBody("last_name", "last name must be Alphanumeric.")
    .isAlphanumeric();

  req.sanitize("first_name").escape();
  req.sanitize("last_name").escape();
  req.sanitize("first_name").trim();
  req.sanitize("last_name").trim();
  req.sanitize("date_of_birth").toDate();
  req.sanitize("date_of_dealth").toDate();

  var errors = req.validationErrors();

  var author = new Author({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    date_of_birth: req.body.date_of_birth,
    date_of_death: req.body.date_of_death,
  });

  if (errors) {
    res.render("author/author_form", {
      title: "Create Author",
      author: author,
      errors: errors,
    });
    return;
  } else {
    //Dữ liệu từ biểu mẫu là hợp lệ

    author.save(function (err) {
      if (err) {
        return next(err);
      }
      //successful - redirect to new author record.
      res.redirect(author.url);
    });
  }
};

// Display Author delete form on GET
exports.author_delete_get = function (req, res, next) {
  async.parallel(
    {
      author: function (data) {
        Author.findById(req.params.id).exec(data);
      },
      authors_books: function (data) {
        Book.find({ author: req.params.id }).exec(data);
      },
    },
    function (err, data) {
      if (err) {
        return next(err);
      }
      if (data.author == null) {
        // No data.
        res.redirect("/catalog/authors");
      }
      //Successful, so render
      res.render("author/author_delete", {
        title: "Delete Author",
        author: data.author,
        author_books: data.authors_books,
      });
    }
  );
};

// Handle Author delete on POST
exports.author_delete_post = function (req, res) {
  req.checkBody("authorid", "Author id must exist").notEmpty();

  async.parallel(
    {
      author: function (data) {
        Author.findById(req.body.authorid).exec(data);
      },
      authors_books: function (data) {
        Book.find({ author: req.body.authorid }).exec(data);
      },
    },
    function (err, data) {
      if (err) {
        return next(err);
      }
      // Success
      if (data.authors_books.length > 0) {
        // Author has books. Render in same way as for GET route.
        res.render("author/author_delete", {
          title: "Delete Author",
          author: data.author,
          author_books: data.authors_books,
        });
        return;
      } else {
        // Author has no books. Delete object and redirect to the list of authors.
        Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
          if (err) {
            return next(err);
          }
          // Success - go to author list
          res.redirect("/catalog/authors");
        });
      }
    }
  );
};

// Display Author update form on GET
exports.author_update_get = function (req, res) {
  res.send("NOT IMPLEMENTED: Author update GET");
};

// Handle Author update on POST
exports.author_update_post = function (req, res) {
  res.send("NOT IMPLEMENTED: Author update POST");
};
