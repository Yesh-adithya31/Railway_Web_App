let express = require('express');
let router = express.Router();
let firebase = require('firebase/app');
let multer = require('multer');
let fs = require('fs');
let admin = require('firebase-admin');
let storage = require('firebase/storage');

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

let serviceAccount = require("../railapplication-a11c3-firebase-adminsdk-ckoul-732c8f6dcd.json");
const { url } = require('inspector');

if (!firebase.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://railapplication-a11c3-default-rtdb.asia-southeast1.firebasedatabase.app"
      });
}


const Storage = multer.diskStorage({

    destination: function (req, file, callback) {
        callback(null, "./public/images/shops");
    },

    filename: function (req, file, callback) {

        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);

    }


});


const upload = multer({
    storage: Storage
}).single("txt_img");


router.get('/', function (req, res, next) {
    res.send("shop js is working");
});


router.get('/shopDetails', function (req, res) {
    if (req.session.user) {

        if (req.session.user.privileges.shop_access === 1) {
            res.render('Template/template', {
                Page_Content: 'Shop',
                title: 'Rail Web App | Shop Details',
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



////////////////////////////////////////////// CREATE Shop Owners HERE/////////////////////////////////////////////////////
router.post('/createShopOwner',function (req, res) {



    console.log("add new Shop Owners")
    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER' || req.session.user.account_type.toString() === 'COORDINATOR')) {

            upload(req, res, function (err) {

                if (err) {
                    console.log('Error: ' + err)
                    res.end('{"message" : "Profile picture is not uploaded.!", "status" : 500}');
                }

                firebase.auth().createUserWithEmailAndPassword(req.body.txt_email, req.body.txt_password).then(function () {
                    let user = firebase.auth().currentUser;

                    firebase.database().ref('shop_data').child(user.uid).set({
                        account_type: 'Shop',
                        email: req.body.txt_email,
                        first_name: req.body.txt_first_name,
                        last_name: req.body.txt_last_name,
                        contact_no: req.body.txt_tel,
                        live_location: {
                            live_lat: req.body.txt_live_location_lat,
                            live_long: req.body.txt_live_location_long,

                        },
                        shop: {
                            category: req.body.cmb_vehicle_type,
                            shop_name: req.body.txt_vehicle_name,
                            shop_no: req.body.txt_vehicle_number,
                        },
                        uid: user.uid,
                        blocked_status: 0,
                        download_URL: 1,
                    }, function (errors) {
                        if (errors) {
                            console.log(errors);
                            res.end('{"message" : "Firebase error.!", "status" : 500}');
                        } else {

                            res.end('{"message" : "Account created successfully...", "status" : 200}');
                            console.log('user created successfully');

                        }
                    });

                }).catch(function (error) {
                    console.log(error);
                    res.end('{"message" : "This account is already exist.!", "status" : 500}');
                    fs.unlink('./public/images/shops/' + req.file.filename, function (err) {
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

////////////////////////////////////////////// REMOVE SHOPS HERE/////////////////////////////////////////////////////
////////////////////////////////////////////// REMOVE SHOPS HERE/////////////////////////////////////////////////////
////////////////////////////////////////////// REMOVE SHOPS HERE/////////////////////////////////////////////////////
router.post('/removeShops', function (req, res) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER' || req.session.user.account_type.toString() === 'COORDINATOR')) {

            let starCountRef = firebase.database().ref('shop_data').child(req.body.ID);
            starCountRef.once('value', function (snapshot) {
                admin.auth().deleteUser(req.body.ID)
                    .then(function () {
                        let usr = firebase.database().ref('shop_data').child(req.body.ID);
                        usr.remove()
                            .then(function () {
                                res.end('{"message" : "Account removed successfully.!", "status" : 200}');
                            })
                            .catch(function (error) {
                                console.log(error);
                                res.end('{"message" : "Firebase error.!", "status" : 500}');
                            });
                    })
                    .catch(function (error) {
                        res.end('{"message" : "Authentication error.!", "status" : 500}');
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

////////////////////////////////////////////// REMOVE SHOPS END  HERE/////////////////////////////////////////////////////
////////////////////////////////////////////// REMOVE SHOPS END HERE/////////////////////////////////////////////////////
////////////////////////////////////////////// REMOVE SHOPS  END HERE/////////////////////////////////////////////////////



////////////////////////////////////////////// BLOCK SHOPS HERE/////////////////////////////////////////////////////
////////////////////////////////////////////// BCLOCK SHOPS HERE/////////////////////////////////////////////////////
////////////////////////////////////////////// BLOCK SHOPS HERE/////////////////////////////////////////////////////

router.post('/blocShops', function (req, res) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER' || req.session.user.account_type.toString() === 'COORDINATOR')) {

            let starCountRef = firebase.database().ref('shop_data').child(req.body.ID).once('value', function (snapshot) {
                console.log(snapshot.val());
                if (req.body.status === '0') {
                    admin.auth().updateUser(req.body.ID, {
                        disabled: true
                    }).then(function (userRecord) {

                        firebase.database().ref('shop_data').child(req.body.ID).update({
                            blocked_status: 1
                        }, function (errors) {
                            if (errors) {
                                console.log(errors);
                                res.end('{"message" : "Firebase error.!", "status" : 500}');
                            } else {
                                res.end('{"message" : "Selected account has been blocked.!", "status" : 200}');
                                console.log(req.body.ID);

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

                        firebase.database().ref('shop_data').child(req.body.ID).update({
                            blocked_status: 0
                        }, function (errors) {
                            if (errors) {
                                console.log(errors);
                                res.end('{"message" : "Firebase error.!", "status" : 500}');
                            } else {
                                res.end('{"message" : "Selected account has been activated.!", "status" : 200}');
                                console.log(req.body.ID);

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
////////////////////////////////////////////// BLOCK SHOPS END HERE/////////////////////////////////////////////////////
////////////////////////////////////////////// BCLOCK SHOPS END HERE/////////////////////////////////////////////////////
////////////////////////////////////////////// BLOCK SHOPS END HERE/////////////////////////////////////////////////////











module.exports = router;