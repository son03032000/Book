var Book = require("../../models/book");
var Author = require("../../models/author");
var Genre = require("../../models/genre");
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
        res.render("admin/book/book_form", {
          title: "Create Book",
          authors: data.authors,
          genres: data.genres,
        });
      }
    );
  };
  
  // Xử lý sách create on POST
  exports.book_create_post = async (req, res, next) => {
try {
  req.checkBody("title", "Title must not be empty.").notEmpty(); //Tiêu đề không được để trống.
  req.checkBody("author", "Author must not be empty").notEmpty();
  req.checkBody("summary", "Summary must not be empty").notEmpty();

  req.sanitize("title").escape();
  req.sanitize("author").escape();
  req.sanitize("summary").escape();
  req.sanitize("title").trim();
  req.sanitize("author").trim();
  req.sanitize("summary").trim();
  req.sanitize("genre").escape();
  const result = await cloudinary.v2.uploader.upload(req.file.path);
  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
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

        res.render("admin/book/book_form", {
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
} catch (err) {
  console.log(err);
  res.redirect("back");
}
  };
  
  // Hiển thị biểu mẫu xóa sách trên GET
  exports.book_delete_get = function (req, res, next) {
    async.parallel(
      {
        book: function (data) {
          Book.findById(req.params.id).exec(data);
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
          book_comments: data.book_comments,
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
      },
      function (err, data) {
        if (err) {
          return next(err);
        }
        //Successful
        if (data.book_comments.length > 0) {
          //Checked if book has instances.
          res.render("books/book_delete", {
            title: "Delete Book",
            book: data.book,
            comments: data.book_comments,
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
  
    // Sanitize fields
    sanitizeBody("title").trim().escape(),
    sanitizeBody("author").trim().escape(),
    sanitizeBody("summary").trim().escape(),
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
  