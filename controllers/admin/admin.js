var Book = require("../../models/book");
var Author = require("../../models/author");
var Genre = require("../../models/genre");
const fs = require("fs");
const Comment = require("../../models/comment");
const PostRv = require("../../models/PostRv");
const deleteImage = require("../../utils/delete_image");
const UserModel = require("../../models/user");
const Activity = require("../../models/activity")



const PER_PAGE = 10;
// Setup Cloudinary



exports.getDashboard = async(req, res, next) => {
  var page = req.query.page || 1;
  try {
    const users_count = await UserModel.find().countDocuments() - 1;
    const books_count = await Book.find().countDocuments()
    const authors_count = await Author.find().countDocuments()
    const genres_count = await Genre.find().countDocuments()
    const activity_count = await Activity.find().countDocuments()

    const activities = await Activity
    .find()
    .sort('-entryTime')
    .skip((PER_PAGE * page) - PER_PAGE)
    .limit(PER_PAGE)

    res.render("admin/index", {
      users_count:users_count,
      books_count,
      authors_count,
      genres_count,
      activities,
      current: page,
      pages: Math.ceil(activity_count/ PER_PAGE),
    })
  } catch (err) {
    console.log(err);
  }
}



exports.getAdminBookInventory = async (req, res, next) => {
  try {
    let page = req.params.page || 1;
    const filter = req.params.filter
    const value = req.params.value

    let searchObj = {};
    if(filter !== 'all' && value !== 'all') {
      searchObj[filter] = value;
    }

    const books_count = await Book.find(searchObj).countDocuments()

    const books = await Book
    .find(searchObj)
    .skip((PER_PAGE * page) - PER_PAGE)
    .limit(PER_PAGE)

    res.render("admin/bookInventory", {
      books: books,
      current: page,
      pages: Math.ceil(books_count / PER_PAGE),
      filter: filter,
      value: value,
    })
  } catch (err) {
    console.log(err);
    return res.redirect('back')
  }
}
exports.postAdminBookInventory = async (req, res, next) => {
  try {
    let page = req.params.page || 1;
    const filter = req.body.filter.toLowerCase()
    const value = req.body.searchName;

    if(value == ""){
      return res.redirect('back');
    }
    const searchObj = {}
    searchObj[filter] = value;

    const books_count = await Book.find(searchObj).countDocuments();

    const books = await Book
    .find(searchObj)
    .skip((PER_PAGE * page) - PER_PAGE)
    .limit(PER_PAGE)

    res.render("admin/bookInventory", {
      books: books,
      current: page,
      pages: Math.ceil(books_count / PER_PAGE),
      filter: filter,
      value: value,
    })
  } catch (err) {
    console.log(err);
    return res.redirect('back')
  }
}
exports.getAdminAuthorInventory = async (req, res, next) => {
  try {
    let page = req.params.page || 1;
    const filter = req.params.filter
    const value = req.params.value

    let searchObj = {};
    if(filter !== 'all' && value !== 'all') {
      searchObj[filter] = value;
    }

    const authors_count = await Author.find(searchObj).countDocuments()

    const authors = await Author
    .find(searchObj)
    .skip((PER_PAGE * page) - PER_PAGE)
    .limit(PER_PAGE)

    res.render("admin/authorInventory", {
      authors: authors,
      current: page,
      pages: Math.ceil(authors_count / PER_PAGE),
      filter: filter,
      value: value,
    })
  } catch (err) {
    console.log(err);
    return res.redirect('back')
  }
}
exports.postAdminAuthorInventory = async (req, res, next) => {
  try {
    let page = req.params.page || 1;
    const filter = req.body.filter.toLowerCase()
    const value = req.body.searchName;

    if(value == ""){
      return res.redirect('back');
    }
    const searchObj = {}
    searchObj[filter] = value;

    const authors_count = await Author.find(searchObj).countDocuments();

    const authors = await Author
    .find(searchObj)
    .skip((PER_PAGE * page) - PER_PAGE)
    .limit(PER_PAGE)

    res.render("admin/bookInventory", {
      authors: authors,
      current: page,
      pages: Math.ceil(authors_count / PER_PAGE),
      filter: filter,
      value: value,
    })
  } catch (err) {
    console.log(err);
    return res.redirect('back')
  }
}
exports.getAdminGenreInventory = async (req, res, next) => {
  try {
    let page = req.params.page || 1;
    const filter = req.params.filter
    const value = req.params.value

    let searchObj = {};
    if(filter !== 'all' && value !== 'all') {
      searchObj[filter] = value;
    }

    const genres_count = await Genre.find(searchObj).countDocuments()

    const genres = await Genre
    .find(searchObj)
    .skip((PER_PAGE * page) - PER_PAGE)
    .limit(PER_PAGE)

    res.render("admin/genreInventory", {
      genres: genres,
      current: page,
      pages: Math.ceil(genres_count / PER_PAGE),
      filter: filter,
      value: value,
    })
  } catch (err) {
    console.log(err);
    return res.redirect('back')
  }
}
exports.postAdminGenreInventory = async (req, res, next) => {
  try {
    let page = req.params.page || 1;
    const filter = req.body.filter.toLowerCase()
    const value = req.body.searchName;

    if(value == ""){
      return res.redirect('back');
    }
    const searchObj = {}
    searchObj[filter] = value;

    const genres_count = await Genre.find(searchObj).countDocuments();

    const genres = await Genre
    .find(searchObj)
    .skip((PER_PAGE * page) - PER_PAGE)
    .limit(PER_PAGE)

    res.render("admin/genreInventory", {
      genres: genres,
      current: page,
      pages: Math.ceil(genres_count / PER_PAGE),
      filter: filter,
      value: value,
    })
  } catch (err) {
    console.log(err);
    return res.redirect('back')
  }
}


exports.getAdminProfile = (req, res) => {
  res.render("admin/profile");
};
exports.postUpdateAdminProfile = async (req, res, next) => {
  try {
    const user_id = req.user._id;
    const update_info = req.body.admin;

    await UserModel.findByIdAndUpdate(user_id, update_info);

    res.redirect("/admin/profile");
  } catch (err) {
    console.log(err);
    res.redirect("back");
  }
};
exports.putUpdatePassword = async (req, res, next) => {
  try {
    const user_id = req.user._id;
    const old_password = req.body.oldPassword;
    const new_password = req.body.password;

    const admin = await UserModel.findById(user_id);
    await admin.changePassword(old_password, new_password);
    await admin.save();

    res.redirect("/adminLogin");
  } catch (err) {
    console.log(err);
    res.redirect("back");
  }
};
exports.deleteAdminProfile = async (req, res, next) => {
  try {
    await UserModel.findByIdAndRemove(req.user._id);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("back");
  }
};
exports.user_list = async (req, res, next) => {
  try {
    const page = req.params.page || 1;

    const users = await UserModel.find()
      .skip(PER_PAGE * page - PER_PAGE)
      .limit(PER_PAGE);
    const users_count = await UserModel.find().countDocuments();

    res.render("admin/users", {
      users: users,
      current: page,
      pages: Math.ceil(users_count / PER_PAGE),
    });
  } catch (err) {
    console.log(err);
    res.redirect("back");
  }
};
exports.getUserProfile = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;

    const user = await UserModel.findById(user_id);
    const comments = await Comment.find({ "author.id": user_id });
    const postRvs = await PostRv.find({ "author.id": user_id });
    const activities = await Activity.find({"user_id.id":user_id}).sort('-entryTime')

    res.render("admin/user", {
      user: user,
      comments: comments,
      activities:activities,
      postRvs: postRvs,
    });
  } catch (err) {
    console.log(err);
    res.redirect("back");
  }
};
exports.getDeleteUser = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const user = await UserModel.findById(user_id);
    await user.remove();

    let imagePath = `iamges/${user.image}`;
    if (fs.existsSync(imagePath)) {
      deleteImage(imagePath);
    }

    await Comment.deleteMany({ "author.id": user_id });
    await PostRv.deleteMany({ "author.id": user_id });

    res.redirect("/users");
  } catch (err) {
    console.log(err);
    res.redirect("back");
  }
};
exports.postShowSearchedUser = async (req, res, next) => {
  try {
    const page = req.params.page || 1;
    const search_value = req.body.searchUser;

    const users = await UserModel.find({
      $or: [
        { firstName: search_value },
        { lastName: search_value },
        { userName: search_value },
        { email: search_value },
      ],
    });
    if (user.length <= 0) {
      return res.redirect("back");
    } else {
      res.render("admin/users", {
        users: users,
        current: page,
        pages: 0,
      });
    }
  } catch (err) {
    console.log(err);
    res.redirect("back");
  }
};

exports.getUserAllActivities = async(req, res, next) => {
  try {
    const user_id = req.params.user_id;

    const activities = await Activity.find({"user_id.id": user_id}).sort('-entryTime')
    res.render("admin/activities",{activities:activities})
  } catch (err) {
    console.log(err);
    res.redirect('back')
  }
}
exports.postShowActivitiesByCategory = async(req, res, next) => {
  try {
    const activities = await Activity.find({"Category":req.body.category })
    res.render("admin/activities",{activities})
  } catch (err) {
    console.log(err);
    res.redirect('back')
  }
}

