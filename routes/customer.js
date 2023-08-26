let express = require('express');
let router = express.Router();
let firebase = require('firebase/app');
let multer = require('multer');
let fs = require('fs');
let admin = require('firebase-admin');

// Firebase Configuration Adding here
const firebaseConfig = {

    apiKey: "AIzaSyBAOQsUlXTtonuLy7PUfaNHaXGyCDD3taY",
  
    authDomain: "railapplication-a11c3.firebaseapp.com",
  
    databaseURL: "https://railapplication-a11c3-default-rtdb.asia-southeast1.firebasedatabase.app",
  
    projectId: "railapplication-a11c3",
  
    storageBucket: "railapplication-a11c3.appspot.com",
  
    messagingSenderId: "962823213566",
  
    appId: "1:962823213566:web:a86c36f45942e1ccc4b0af",
  
    measurementId: "G-NSQXKHGPYZ"
  
  };
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Firebase Json adding here
let serviceAccount = require("../reactjs-project-9b8e1-firebase-adminsdk-uhnvy-e56db00864.json");

//firebase Database URL adding here
if (!firebase.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://reactjs-project-9b8e1.firebaseio.com"
    });
}

//call to firebase storage to retrieve images
const Storage = multer.diskStorage({

    destination: function (req, file, callback) {
        callback(null, "./public/images/customers");
    },

    filename: function (req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }

});

const upload = multer({
    storage: Storage
}).single("txt_img");



// router.get('/', function (req, res, next) {
//     res.send("customer js is working");
// });


router.get('/customerDetails', function (req, res) {
    if (req.session.user) {

        if (req.session.user.privileges.shop_access === 1) {
            res.render('Template/template', {
                Page_Content: 'Customers',
                title: 'Rail Web App | Customers',
                profile: req.session.user
            });
        } else {
            res.render('Login/login', {
                data: 'You dont have permissions!.',
                title: 'Rail Web App | Login',
                status: ''
            });
        }
    } else {
        res.render('Login/login', {
            data: 'Please login!.',
            title: 'Rail Web App | Login',
            status: ''
        });
    }
});



// -------------------------------------------Manage Cutomers Data ----------------------------------//
//  createCustomer Here   //
router.post('/createCustomers', function (req, res) {

    console.log("add new customer")
    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER' || req.session.user.account_type.toString() === 'COORDINATOR')) {

            upload(req, res, function (err) {
                if (err) {
                    console.log('Error: ' + err)
                    res.end('{"message" : "Profile picture is not uploaded.!", "status" : 500}');
                }

                firebase.auth().createUserWithEmailAndPassword(req.body.txt_email, req.body.txt_password).then(function () {
                    let user = firebase.auth().currentUser;

                    firebase.database().ref('services_data').child(user.uid).set({
                        account_type: 'CUSTOMER',
                        email: req.body.txt_email,
                        first_name: req.body.txt_first_name,
                        last_name: req.body.txt_last_name,
                        profile_pic_url: req.file.filename,
                        contact_no: req.body.txt_tel,
                        uid: user.uid,
                        blocked_status: 0,
                        rating: 0,
                        review:{
                            review_ID: true,
                            review_Text: true,
                        },
                    }, function (errors) {
                        if (errors) {
                            console.log(errors);
                            res.end('{"message" : "Firebase error.!", "status" : 500}');
                        } else {

                            res.end('{"message" : "Account created successfully...", "status" : 200}');
                            console.log('user craeted successfully');

                        }
                    });

                }).catch(function (error) {
                    console.log(error);
                    res.end('{"message" : "This account is already exist.!", "status" : 500}');
                    fs.unlink('./public/images/customers/' + req.file.filename, function (err) {
                        if (err) return console.log(err);
                        console.log('file deleted successfully');
                    });

                });
            });
        } else {
            res.render('Login/login', {
                data: 'You dont have permissions!.',
                title: 'Rail Web App | Login',
                status: ''
            });
        }

    } else {
        res.render('Login/login', {
            data: 'Please login!.',
            title: 'Rail Web App | Login',
            status: ''
        });
    }

});



// -----------------------------------------------remove customer ------------------------------------------------------------------///

router.post('/removeCustomer', function (req, res) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER' || req.session.user.account_type.toString() === 'COORDINATOR')) {

            let starCountRef = firebase.database().ref('services_data').child(req.body.ID);
            starCountRef.once('value', function (snapshot) {
                admin.auth().deleteUser(req.body.ID)
                    .then(function () {
                        let usr = firebase.database().ref('services_data').child(req.body.ID);
                        usr.remove()
                            .then(function () {
                                fs.unlink('./public/images/customers/' + snapshot.val().profile_pic_url, function (err) {
                                    if (err) return console.log(err);
                                    console.log('file deleted successfully');
                                    res.end('{"message" : "Account removed successfully.!", "status" : 200}');
                                });
                            })
                            .catch(function (error) {
                                res.end('{"message" : "Internal server error.!", "status" : 500}');
                            });
                    })
                    .catch(function (error) {
                        res.end('{"message" : "Internal server error.!", "status" : 500}');
                    });
            });

        } else {
            res.render('Login/login', {
                data: 'You dont have permissions!.',
                title: 'Rail Web App | Login',
                status: ''
            });
        }

    } else {
        res.render('Login/login', {
            data: 'Please login!.',
            title: 'Rail Web App | Login',
            status: ''
        });
    }

});



// -------------------------------------------------------------blockk customer --------------------------//
router.post('/blocCustomer', function (req, res) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER' || req.session.user.account_type.toString() === 'COORDINATOR')) {

            let starCountRef = firebase.database().ref('services_data').child(req.body.ID).once('value', function (snapshot) {
                console.log(snapshot.val());
                if (req.body.status === '0') {
                    admin.auth().updateUser(req.body.ID, {
                        disabled: true
                    }).then(function (userRecord) {

                        firebase.database().ref('services_data').child(req.body.ID).update({
                            blocked_status: 1
                        }, function (errors) {
                            if (errors) {
                                console.log(errors);
                                res.end('{"message" : "Firebase error.!", "status" : 500}');
                            } else {
                                res.end('{"message" : "Selected account has been blocked.!", "status" : 200}');
                            }
                        });

                    }).catch(function (error) {
                        console.log('Error updating user:', error);
                    });
                }
                if (req.body.status === '1') {
                    admin.auth().updateUser(req.body.ID, {
                        disabled: false
                    }).then(function (userRecord) {

                        firebase.database().ref('services_data').child(req.body.ID).update({
                            blocked_status: 0
                        }, function (errors) {
                            if (errors) {
                                console.log(errors);
                                res.end('{"message" : "Firebase error.!", "status" : 500}');
                            } else {
                                res.end('{"message" : "Selected account has been activated.!", "status" : 200}');
                            }
                        });

                    }).catch(function (error) {
                        console.log('Error updating user:', error);
                    });
                }
            });

        } else {
            res.render('Login/login', {
                data: 'You dont have permissions!.',
                title: 'Rail Web App | Login',
                status: ''
            });
        }

    } else {
        res.render('Login/login', {
            data: 'Please login!.',
            title: 'Rail Web App | Login',
            status: ''
        });
    }

});
module.exports = router;