var async = require("async");
const PER_PAGE = 16;
var Author = require("../models/author");
var Book = require("../models/book");

// Hiển thị danh sách tất cả các tác giả
exports.author_list = async (req, res, next) => {
  var page = req.params.page || 1;
  const filter = req.params.filter;
  const value = req.params.value;
  let searchoObj = {};
  // xây dựng đối tượng tìm kiếm

  if (filter != "all" && value != "all") {
    // tìm nạp sách theo giá trị tìm kiếm và bộ lọc
    searchoObj[filter] = value;
  }
  try {
    const authors = await Author.find(searchoObj)
      .skip(PER_PAGE * page - PER_PAGE)
      .limit(PER_PAGE)
      .sort([["last_name", "ascending"]]);
    const count = await Author.find(searchoObj).countDocuments();
    res.render("authors", {
      title: "Author List",
      authors: authors,
      current: page,
      pages: Math.ceil(count / PER_PAGE),
      filter: filter,
      value: value,
      user: req.user,
    });
  } catch (error) {
    res.json({ error, mess: "server error", status: 500 });
  }
};
exports.findAuthors = async (req, res, next) => {
  var page = req.params.page || 1;
  const filter = req.body.filter.toLowerCase();
  const value = req.body.searChName;

  // hiển thị thông báo flash nếu trường tìm kiếm trống được gửi đến chương trình phụ trợ
  if (value == "") {
    return res.redirect("back");
  }
  const searchoObj = {};
  searchoObj[filter] = value;
  try {
    const authors = await Author.find(searchoObj)
      .skip(PER_PAGE * page - PER_PAGE)
      .limit(PER_PAGE)
      .sort([["last_name", "ascending"]]);
    const count = await Author.find(searchoObj).countDocuments();
    res.render("authors", {
      title: "Author List",
      authors: authors,
      current: page,
      pages: Math.ceil(count / PER_PAGE),
      filter: filter,
      value: value,
      user: req.user,
    });
  } catch (error) {
    res.json({ error, mess: "server error", status: 500 });
  }
};

exports.author_detail = async (req, res, next) => {
  try {
    await async.parallel(
      {
        author: function (data) {
          Author.findById(req.params.author_id).exec(data);
        },
        authors_books: function (data) {
          Book.find({ author: req.params.author_id }, "title description").exec(
            data
          );
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
  } catch (err) {
    res.json({ error, mess: "server error", status: 500 });
  }
};
