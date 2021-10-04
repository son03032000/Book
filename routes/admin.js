var express = require('express');
var router = express.Router();
const upload = require('../handlers/upload.multer')
// Require controller modules
var book_controller = require('../controllers/admin/adbook');
var author_controller = require('../controllers/admin/adauthor');
var genre_controller = require('../controllers/admin/adgenre');
var admin_controller = require('../controllers/admin/admin')
const { checkLogin, checkAdmin } = require("../middleWare/check");

//admin-> dashborad
router.get("/", admin_controller.getDashboard)
//admin book inventory
router.get("/bookInventory/:filter/:value/:page",admin_controller.getAdminBookInventory)
router.post("/bookInventory/:filter/:value/:page",admin_controller.postAdminBookInventory)

router.get("/authorInventory/:filter/:value/:page",admin_controller.getAdminAuthorInventory)
router.post("/authorInventory/:filter/:value/:page",admin_controller.postAdminAuthorInventory)

router.get("/genreInventory/:filter/:value/:page",admin_controller.getAdminGenreInventory)
router.post("/genreInventory/:filter/:value/:page",admin_controller.postAdminGenreInventory)

//ad-> profile
router.get('/profile',admin_controller.getAdminProfile);
//update profile
router.post("/update-profile",admin_controller.postUpdateAdminProfile)
//update password
router.put("/update-password",admin_controller.putUpdatePassword)
// delete profile
router.delete("/delete-profile", admin_controller.deleteAdminProfile)
// user list
router.get("/users/:page", admin_controller.user_list);
//show one user
router.get("/users/profile/:user_id",admin_controller.getUserProfile)
//delete a user
router.get("/users/delete/:user_id", admin_controller.getDeleteUser);
//show searched user
router.post("/users/:page",admin_controller.postShowSearchedUser )
router.get("/users/activities/:user_id",admin_controller.getUserAllActivities)
router.post("/users/activities/:user_id",admin_controller.postShowActivitiesByCategory)






/// BOOK ROUTES ///

/* GET request for creating a Book. NOTE This must come before routes that display Book (uses id) */
router.get('/books/add', book_controller.book_create_get);
/* POST request for creating Book. */
router.post('/books/add',upload.single('image'), book_controller.book_create_post);
/* GET request to delete Book. */

router.get('/book/:id/delete',book_controller.book_delete_get);
// POST request to delete Book
router.post('/book/:id/delete', book_controller.book_delete_post);
/* GET request to update Book. */
router.get('/book/:id/update', book_controller.book_update_get);
// POST request to update Book
router.post('/book/:id/update',upload.single('image'), book_controller.book_update_post);



/// AUTHOR ROUTES ///


/* GET request for creating Author. NOTE This must come before route for id (i.e. display author) */
router.get('/authors/add', author_controller.author_create_get);
/* POST request for creating Author. */
router.post('/authors/add',author_controller.author_create_post);
/* GET request to delete Author. */
router.get('/author/:id/delete',author_controller.author_delete_get);
// POST request to delete Author
router.post('/author/:id/delete', author_controller.author_delete_post);
/* GET request to update Author. */
router.get('/author/:id/update', author_controller.author_update_get);
// POST request to update Author
router.post('/author/:id/update', author_controller.author_update_post);





/// GENRE ROUTES ///

/* GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id) */
router.get('/genres/add', genre_controller.genre_create_get);
/* POST request for creating Genre. */
router.post('/genres/add', genre_controller.genre_create_post);
/* GET request to delete Genre. */
router.get('/genre/:id/delete', genre_controller.genre_delete_get);
// POST request to delete Genre
router.post('/genre/:id/delete', genre_controller.genre_delete_post);
/* GET request to update Genre. */
router.get('/genre/:id/update', genre_controller.genre_update_get);
// POST request to update Genre
router.post('/genre/id/update', genre_controller.genre_update_post);






module.exports = router;
