var Book = require("../models/book");
var Author = require("../models/author");
var Genre = require("../models/genre");
var BookInstance = require("../models/bookinstance");
const cloudinary = require("cloudinary");
var async = require("async");
var { body, validationResult } = require("express-validator/check");
var { sanitizeBody } = require("express-validator/filter");
// Setup Cloudinary
cloudinary.config({
  cloud_name: "sstt",
  api_key: 878854271598434,
  api_secret: "UyilBk07KLomikO5mafQJdDt-zw",
});

exports.index = function (req, res) {
  // hiện Thư viện có số lượng bản ghi sau

  async.parallel(
    {
      book_count: function (data) {
        Book.count(data);
      },
      book_instance_count: function (data) {
        BookInstance.count(data);
      },
      book_instance_available_count: function (data) {
        BookInstance.count({ status: "Available" }, data);
      },
      author_count: function (data) {
        Author.count(data);
      },
      genre_count: function (data) {
        Genre.count(data);
      },
    },
    function (err, data) {
      res.render("index", { title: "Life is a book", error: err, data: data });
    }
  );
};

// Hiển thị danh sách tất cả sách
exports.book_list = function (req, res, next) {
  Book.find({}, "title author")
    .populate("author")
    .exec(function (err, list_books) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("books/book_list", {
        title: "Book List",
        book_list: list_books,
      }); //(có thể dùng ajax)
    });
};

// Hiển thị trang chi tiết cho một cuốn sách cụ thể
exports.book_detail = function (req, res, next) {
  async.parallel(
    {
      book: function (data) {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(data);
      },
      book_instance: function (data) {
        BookInstance.find({ book: req.params.id })
          //.populate('book')
          .exec(data);
      },
    },
    function (err, data) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("books/book_detail", {
        title: "Title",
        book: data.book,
        book_instances: data.book_instance,
      });
    }
  );
};

// Hiển thị biểu mẫu tạo sách trên GET
exports.book_create_get = function (req, res, next) {
  //Nhận tất cả các tác giả và thể loại mà chúng tôi có thể sử dụng để thêm vào sách của mình.
  async.parallel(
    {
      authors: function (data) {
        Author.find(data);
      },
      genres: function (data) {
        Genre.find(data);
      },
    },
    function (err, data) {
      if (err) {
        return next(err);
      }
      res.render("books/book_form", {
        title: "Create Book",
        authors: data.authors,
        genres: data.genres,
      });
    }
  );
};

// Xử lý sách create on POST
exports.book_create_post = async (req, res, next) => {
  req.checkBody("title", "Title must not be empty.").notEmpty(); //Tiêu đề không được để trống.
  req.checkBody("author", "Author must not be empty").notEmpty();
  req.checkBody("summary", "Summary must not be empty").notEmpty();
  req.checkBody("isbn", "ISBN must not be empty").notEmpty();

  req.sanitize("title").escape();
  req.sanitize("author").escape();
  req.sanitize("summary").escape();
  req.sanitize("isbn").escape();
  req.sanitize("title").trim();
  req.sanitize("author").trim();
  req.sanitize("summary").trim();
  req.sanitize("isbn").trim();
  req.sanitize("genre").escape();
  const result = await cloudinary.v2.uploader.upload(req.file.path);
  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    ImageUrl: result.secure_url,
    genre:
      typeof req.body.genre === "undefined" ? [] : req.body.genre.split(","),
  });

  console.log("BOOK: " + book);

  var errors = req.validationErrors();
  if (errors) {
    //Một số vấn đề nên chúng tôi cần re-render our books

    // Nhận tất cả các tác giả và thể loại cho biểu mẫu
    async.parallel(
      {
        authors: function (data) {
          Author.find(data);
        },
        genres: function (data) {
          Genre.find(data);
        },
      },
      function (err, data) {
        if (err) {
          return next(err);
        }

        //Đánh dấu các thể loại đã chọn của chúng tôi là đã chọn
        for (i = 0; i < data.genres.length; i++) {
          if (book.genre.indexOf(data.genres[i]._id) > -1) {
            //Thể loại hiện tại được chọn. Đặt cờ "đã kiểm tra".
            data.genres[i].checked = "true";
          }
        }

        res.render("books/book_form", {
          title: "Create Book",
          authors: data.authors,
          genres: data.genres,
          book: book,
          errors: errors,
        });
      }
    );
  } else {
    // Dữ liệu từ biểu mẫu là hợp lệ.
    // Chúng ta có thể kiểm tra xem sách đã tồn tại chưa, nhưng hãy cứ lưu lại.

    book.save(function (err) {
      if (err) {
        return next(err);
      }
      //Successful - redirect to new book record.
      res.redirect(book.url);
    });
  }
};

// Hiển thị biểu mẫu xóa sách trên GET
exports.book_delete_get = function (req, res, next) {
  async.parallel(
    {
      book: function (data) {
        Book.findById(req.params.id).exec(data);
      },
      book_bookinstances: function (data) {
        BookInstance.find({ book: req.params.id }).exec(data);
      },
    },
    function (err, data) {
      if (err) {
        return next(err);
      }
      //Successful
      res.render("books/book_delete", {
        title: "Delete Book",
        book: data.book,
        book_bookinstances: data.book_bookinstances,
      });
    }
  );
};

// Xử lý việc xóa sách trên POST
exports.book_delete_post = function (req, res) {
  req.checkBody("id", "Book id must exist").notEmpty(); //Id sách phải tồn tại

  async.parallel(
    {
      book: function (data) {
        Book.findById(req.body.id).exec(data);
      },
      book_bookinstances: function (data) {
        BookInstance.find({ book: req.body.id }, "imprint status").exec(data);
      },
    },
    function (err, data) {
      if (err) {
        return next(err);
      }
      //Successful
      if (data.book_bookinstances.length > 0) {
        //Checked if book has instances.
        res.render("books/book_delete", {
          title: "Delete Book",
          book: data.book,
          book_instances: data.book_bookinstances,
        });
        return;
      } else {
        //Sách không có phiên bản nào. Xóa sách ngay bây giờ
        Book.findByIdAndRemove(req.body.id, function deleteBook(err) {
          if (err) {
            return next(err);
          }
          //Successful - redirect to book list_
          res.redirect("/catalog/books");
        });
      }
    }
  );
};

// Hiển thị biểu mẫu cập nhật sách trên GET
exports.book_update_get = function (req, res, next) {
  // Nhận cuốn sách, tác giả và thể loại cho hình thức.
  async.parallel(
    {
      book: function (data) {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(data);
      },
      authors: function (data) {
        Author.find(data);
      },
      genres: function (data) {
        Genre.find(data);
      },
    },
    function (err, data) {
      if (err) {
        return next(err);
      }
      if (data.book == null) {
        // No data.
        var err = new Error("Book not found");
        err.status = 404;
        return next(err);
      }
      // Success
      //Đánh dấu các thể loại đã chọn của chúng tôi là đã chọn
      for (var all_g_iter = 0; all_g_iter < data.genres.length; all_g_iter++) {
        for (
          var book_g_iter = 0;
          book_g_iter < data.book.genre.length;
          book_g_iter++
        ) {
          if (
            data.genres[all_g_iter]._id.toString() ==
            data.book.genre[book_g_iter]._id.toString()
          ) {
            data.genres[all_g_iter].checked = "true";
          }
        }
      }
      res.render("books/book_form", {
        title: "Update Book",
        authors: data.authors,
        genres: data.genres,
        book: data.book,
      });
    }
  );
};

// Xử lý cập nhật sách on POST
exports.book_update_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Xác thực các trường
  body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
  body("author", "Author must not be empty.").isLength({ min: 1 }).trim(),
  body("summary", "Summary must not be empty.").isLength({ min: 1 }).trim(),
  body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim(),

  // Sanitize fields
  sanitizeBody("title").trim().escape(),
  sanitizeBody("author").trim().escape(),
  sanitizeBody("summary").trim().escape(),
  sanitizeBody("isbn").trim().escape(),
  sanitizeBody("genre.*").trim().escape(),

  // Xử lý yêu cầu sau khi xác thực and sanitization
  async (req, res, next) => {
    // Trích xuất các lỗi xác thực từ một yêu cầu
    const errors = validationResult(req);
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    // Tạo đối tượng Sách với dữ liệu thoát / cắt và id cũ.
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      ImageUrl: result.secure_url,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id, //Điều này là bắt buộc, nếu không ID mới sẽ được chỉ định!
    });

    if (!errors.isEmpty()) {
      // Có lỗi. Hiển thị lại biểu mẫu với các giá trị / thông báo lỗi được làm sạch.

      // Nhận tất cả các tác giả và thể loại cho biểu mẫu
      async.parallel(
        {
          authors: function (data) {
            Author.find(data);
          },
          genres: function (data) {
            Genre.find(data);
          },
        },
        function (err, data) {
          if (err) {
            return next(err);
          }

          // Đánh dấu các thể loại đã chọn của chúng tôi là đã chọn
          for (let i = 0; i < data.genres.length; i++) {
            if (book.genre.indexOf(data.genres[i]._id) > -1) {
              data.genres[i].checked = "true";
            }
          }
          res.render("books/book_form", {
            title: "Update Book",
            authors: data.authors,
            genres: data.genres,
            book: book,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Dữ liệu từ biểu mẫu là hợp lệ. Cập nhật hồ sơ.
      Book.findByIdAndUpdate(req.params.id, book, {}, function (err, thebook) {
        if (err) {
          return next(err);
        }
        // Thành công - chuyển hướng đến trang chi tiết sách.
        res.redirect(thebook.url);
      });
    }
  },
];
