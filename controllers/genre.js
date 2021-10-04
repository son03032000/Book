var Book = require("../models/book");
var async = require("async");
var Genre = require("../models/genre");

exports.genre_list = async (req, res) => {
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
    const genres = await Genre.find(searchoObj)
      .skip(PER_PAGE * page - PER_PAGE)
      .limit(PER_PAGE)
      .sort([["name", "ascending"]]);
    const count = await Genre.find(searchoObj).countDocuments();
    res.render("genres", {
      title: "Genre List",
      genres: genres,
      current: page,
      pages: Math.ceil(count / PER_PAGE),
      filter: filter,
      value: value,
      user: req.user,
    });
  } catch (err) {
    res.json({ error, mess: "server error", status: 500 });
  }
};
exports.FindGenres = async (req, res, next) => {
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
    const genres = await Genre.find(searchoObj)
      .skip(PER_PAGE * page - PER_PAGE)
      .limit(PER_PAGE)
      .sort([["name", "ascending"]]);
    const count = await Genre.find(searchoObj).countDocuments();
    res.render("genres", {
      title: "Genre List",
      genres: genres,
      current: page,
      pages: Math.ceil(count / PER_PAGE),
      filter: filter,
      value: value,
      user: req.user,
    });
  } catch (err) {
    res.json({ error, mess: "server error", status: 500 });
  }
};
// Display detail page for a specific Genre
exports.genre_detail = async (req, res, next) => {
  try {
    await async.parallel(
      {
        genre: function (data) {
          Genre.findById(req.params.id).exec(data);
        },

        genre_books: function (data) {
          Book.find({ genre: req.params.id }).exec(data);
        },
      },
      function (err, data) {
        if (err) {
          return next(err);
        }
        //Successful, so render
        res.render("genre/genre_detail", {
          title: "Genre Detail",
          genre: data.genre,
          genre_books: data.genre_books,
        });
      }
    );
  } catch (err) {
    res.json({ error, mess: "server error", status: 500 });
  }
};
