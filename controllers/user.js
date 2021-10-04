const fs = require("fs");
const sharp = require("sharp");
const uid = require("uid");
const Comment = require("../models/comment");
const Book = require("../models/book")
const UserModel = require("../models/user");
const PostRV = require("../models/PostRv")
const Activity = require("../models/activity")
var async = require("async");

const deleteImage = require('../utils/delete_image')

const PER_PAGE = 5;

exports.getUserDashboard = async(req, res, next) => {
  var page = req.params.page || 1;
  const user_id = req.user._id
  try {
    const user = await UserModel.findById(user_id)
    const activities = await Activity
    .find({"user_id.id": req.user._id})
    .sort({_id: -1})
    .skip((PER_PAGE * page) - PER_PAGE)
    .limit(PER_PAGE)
  
  const activity_count = await Activity.find({"user_id.id": req.user._id}).countDocuments();

  res.render("user/index", {
    user:user,
    current: page,
    pages: Math.ceil(activity_count/PER_PAGE),
    activities: activities,
  })
  } catch (err) {
    console.log(err);
    res.redirect('back')
  }
}


exports.getUserProfile = (req, res, next) => {
  res.render("user/profile")
}
// upload image
exports.postUploadUserImage = async(req, res, next) =>{
  try {
    const user_id = req.user._id;
    const user = await UserModel.findById(user_id)

    let imageUrl
    if(req.file){
      imageUrl = `${uid()}__${req.file.originalname}`
      let filename = `images/${imageUrl}`
      let previousImagePath = `images/${user.image}`

      const imageExist = fs.existsSync(previousImagePath)
      if(imageExist) {
        deleteImage(previousImagePath)
      }
      await sharp(req.file.path)
      .rotate()
      .resize(500, 500)
      .toFile(filename);
    fs.unlink(req.file.path, (err) =>{
      if(err) {
        console.log(err);
      }
    })  
    }else{
      imageUrl = 'profile.png'
    }
    user.image = imageUrl;
    await user.save();

    const activity = new Activity({
      categogy: "upload photo",
      user_id: {
        id: req.user._id,
        username: user.username
      }
    })
    await activity.save()
    res.redirect("/user/1/profile")
  } catch (err) {
    console.log(err);
    res.redirect("back")
  }
}

//update pass
exports.putUpdatePassword = async(req, res, next) => {
  const username = req.user.username;
  const oldPassword = req.body.oldPassword
  const newPassword = req.body.password
  
  try {
    const user = await UserModel.findOne(username)
    await user.changePassword(oldPassword, newPassword)
    await user.save();

    const activity = new Activity({
      categogy: "Update Password",
      user_id: {
        id: req.user._id,
        username: user.username
      }
    })
    await activity.save()
    res.redirect("/auth/user-login")
  } catch (err) {
    console.log(err);
    return res.redirect("back")
  }
}

// update profile
exports.putUpdateUserProfile = async(req, res, next) => {
  try {
    const userUpdateInfo = {
      "firstName" : req.body.firstName,
      "lastName"  : req.body.lastName,
      "email"     : req.body.email,
      "gender"    : req.bo.gender,
      "address"   : req.body.address,
    }
    await UserModel.findByIdAndUpdate(req.user._id,userUpdateInfo)

    const activity = new Activity({
      categogy: "Update Profile",
      user_id: {
        id: req.user._id,
        username: user.username
      }
    })
    await activity.save()

    res.redirect('back')
  } catch (err) {
    console.log(err);
    return res.redirect("back")
  }
}
exports.deleteUserAccount = async(req, res, next) => {
  try {
    const user_id = req.user._id;
    const user = await UserModel.findById(user_id)
    await user.remove();
    
    let imagePath = `images/${user.image}`
    if(fs.existsSync(imagePath)) {
      deleteImage(imagePath)
    }
    await Comment.deleteMany({"author.id":user_id})
    await  PostRV.deleteMany({"author.id":user_id})

    res.redirect("/")
  } catch (err) {
    console.log(err);
    return res.redirect("back")
  }
} 
exports.postNewComment = async(req, res, next) => {
  try {
    const comment_text = req.body.comment
    const user_id = req.user._id
    const username = req.user.username

    // tìm nạp sách được nhận xét bằng id
    const book_id = req.params.book_id;
    const book = await Book.findById(book_id)
    // tạo comment mới
    const comment = new Comment({
      text: comment_text,
      author: {
        id: user_id,
        username: username
      },
      book: {
        id: book._id,
        title: book.title
      }
    })
    await comment.save();
    // đẩy id nhận xét vào sách
    book.comments.push(comment._id)
    await book.save();

    const activity = new Activity({
      info: {
        id: book._id,
        title: book.title,
      },
      categogy: "Comment",
      user_id: {
        id: user_id,
        username: username,
      }
    })
    await activity.save()

    res.redirect("/book/details/" + book_id)
  } catch (err) {
    console.log(err);
    return res.redirect("back")
  }
}
exports.postUpdateComment = async(req, res, next) => {
  const comment_id = req.params.comment_id
  const comment_text = req.body.comment
  const book_id = req.params.book_id
  const user_id = req.user._id
  const username = req.user.username

  try {
    await Comment.findByIdAndUpdate(comment_id,comment_text)

    const book = await Book.findById(book_id)
    const activity = new Activity({
      info: {
        id: book._id,
        title: book.title,
      },
      categogy: "Update Comment",
      user_id: {
        id: user_id,
        username: username,
      }
    })
    await activity.save()
    res.redirect("/book/details/" + book_id)
  } catch (err) {
    console.log(err);
    return res.redirect("back")
  }
}

exports.deleteComment = async(req, res, next) => {
  const book_id = req.params.book_id
  const comment_id = req.params.comment_id
  const user_id = req.user._id
  const username = req.user.username

  try {
    const book = await Book.findById(book_id)

    const pos = book.comments.indexof(comment_id)
    book.comments.splice(pos, 1)
    await book.save

    await Comment.findByIdAndRemove(comment_id)
    const activity = new Activity({
      info: {
        id: book._id,
        title: book.title,
      },
      categogy: "Delete Comment",
      user_id: {
        id: user_id,
        username: username,
      }
    })
    await activity.save()
    
    res.redirect("/book/details/" + book_id)
  } catch (err) {
    console.log(err);
    return res.redirect("back")
  }
}
exports.getNewPost = (req, res) => {
  Book.find({}, "title").exec(function (err, books) {
    if (err) {
      return next(err);
    }
    //Successful, so render
    res.render("user/postRV/postRV_form", {
      title: "Create postRV",
      book_list: books,
    });
  });
}

exports.postNewPost = async (req, res, next) => {
  req.checkBody("book", "Book must be specified").notEmpty(); 
  req.checkBody("text", "Imprint must be specified").notEmpty();
  req
    .checkBody("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .notEmpty();

  req.sanitize("book").escape();
  req.sanitize("text").escape();
  req.sanitize("status").escape();
  req.sanitize("book").trim();
  req.sanitize("text").trim();
  req.sanitize("status").trim();
  req.sanitize("due_back").toDate();

try {
  const user_id = req.user._id
  const username = req.body.username;
  
  // tìm nạp sách được nhận xét bằng id
  const book_id = req.params.book_id;
  const book = await Book.findById(book_id)

  const postrv = new PostRV({
    author: {
      id: user_id,
      username: username
    },
    book: {
      id: book._id,
      title: book.title
    },
    text: req.body.text,
    status: req.body.status,
    due_back: req.body.due_back,
  });

  var errors = req.validationErrors();
  if (errors) {
    Book.find({}, "title").exec(function (err, books) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("user/postRV/postRV_form", {
        title: "Create Postrv",
        errors: errors,
        postrv: postrv,
      });
    });
    return;
  } else {
    //Data from form is valid
    await postrv.save()
    book.postRv.push(postrv._id)
    await book.save()
    const activity = new Activity({
      info: {
        id: book._id,
        title: book.title,
      },
      categogy: "Post Review",
      user_id: {
        id: user_id,
        username: username,
      }
    })
    await activity.save()
    res.redirect("/book/details/" + book_id);
  } 
} catch (err) {
  console.log(err);
  return res.redirect("back")
} 
}

exports.getUpdatePost = (req, res, next) => {
    // Get book, authors and genres for form.
    async.parallel({
      PostRV: function (callback) {
        PostRV.findById(req.params.id).populate('book').exec(callback)
      },
      books: function (callback) {
          Book.find(callback)
      },

  }, function (err, results) {
      if (err) { return next(err); }
      if (results.PostRV == null) { // No results.
          var err = new Error('Book copy not found');
          err.status = 404;
          return next(err);
      }
      // Success.
      res.render('user/postRV/postRV_form', { 
        title: 'Update  postRV',        
        errors: errors,
        postrv: postrv,
      });
  });
}
exports.postUpdatePost = async (req, res, next) => {
  req.checkBody("book", "Book must be specified").notEmpty(); 
  req.checkBody("text", "Imprint must be specified").notEmpty();
  req
    .checkBody("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .notEmpty();

  req.sanitize("book").escape();
  req.sanitize("text").escape();
  req.sanitize("status").escape();
  req.sanitize("book").trim();
  req.sanitize("text").trim();
  req.sanitize("status").trim();
  req.sanitize("due_back").toDate();

try {
  const user_id = req.user._id
  const username = req.body.username;
  
  // tìm nạp sách được nhận xét bằng id
  const book_id = req.params.book_id;
  const book = await Book.findById(book_id)

  const postrv = new PostRV({
    author: {
      id: user_id,
      username: username
    },
    book: {
      id: book._id,
      title: book.title
    },
    text: req.body.text,
    status: req.body.status,
    due_back: req.body.due_back,
  });

  var errors = req.validationErrors();
  if (errors) {
    Book.find({}, "title").exec(function (err, books) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("user/postRV/postRV_form", {
        title: "Create Postrv",
        errors: errors,
        postrv: postrv,
      });
    });
    return;
  } else {
    //Data from form is valid
    await postrv.findByIdAndUpdate(req.params.id, req.body.postRv )
    const book = await Book.findById(req.params.book_id)
    const activity = new Activity({
      info: {
        id: book._id,
        title: book.title,
      },
      categogy: "Update Post Review",
      user_id: {
        id: user_id,
        username: username,
      }
    })
    await activity.save()

    res.redirect("/book/details/" + book_id);
  } 
} catch (err) {
  console.log(err);
  return res.redirect("back")
} 
}

exports.deletePost= async(req, res, next) => {
  const book_id = req.params.book_id
  const postrv_id = req.params.postrv_id
  const user_id = req.user._id
  const username = req.user.username

  try {
    const book = await Book.findById(book_id)

    const pos = book.postRv.indexof(postrv_id)
    book.postRv.splice(pos, 1)
    await book.save

    await postRv.findByIdAndRemove(postrv_id)
    const activity = new Activity({
      info: {
        id: book._id,
        title: book.title,
      },
      categogy: "Delete Post Review",
      user_id: {
        id: user_id,
        username: username,
      }
    })
    await activity.save()
    res.redirect("/book/details/" + book_id)
  } catch (err) {
    console.log(err);
    return res.redirect("back")
  }
}