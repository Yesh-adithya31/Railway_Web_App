let express = require('express');
let router = express.Router();
let firebase = require('firebase/app');
let multer = require('multer');
let fs = require('fs');
let admin = require('firebase-admin');

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


let serviceAccount = require("../railapplication-a11c3-firebase-adminsdk-ckoul-732c8f6dcd.json");

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://railapplication-a11c3-default-rtdb.asia-southeast1.firebasedatabase.app"
  });

const Storage = multer.diskStorage({

    destination: function (req, file, callback) {
        callback(null, "./public/images/users");
    },

    filename: function (req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }

});

const upload = multer({
    storage: Storage
}).single("txt_img");

router.get('/', function (req, res, next) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && req.session.user.account_type.toString() === 'SUPER ADMIN') {
            res.render('Template/template', {
                Page_Content: 'Super',
                title: 'Rail Web App | Super Admin',
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

router.get('/Advertisment', function (req, res) {
    if (req.session.user) {

        if ( req.session.user.account_type.toString() === 'SUPER ADMIN') {
            res.render('Template/template', {
                Page_Content: 'Ads',
                title: 'Rail Web App | Advertisment',
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
////////////////////////////////////////////// REMOVE SHOPS HERE/////////////////////////////////////////////////////
////////////////////////////////////////////// REMOVE SHOPS HERE/////////////////////////////////////////////////////
////////////////////////////////////////////// REMOVE SHOPS HERE/////////////////////////////////////////////////////
router.post('/removeAds', function (req, res) {

    if (req.session.user) {

        if ( (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER' || req.session.user.account_type.toString() === 'COORDINATOR'))
         {

            let starCountRef = firebase.database().ref('ads_data').child(req.body.ID);
            starCountRef.once('value', function (snapshot) {
                admin.auth().deleteUser(req.body.ID)
                    .then(function () {
                        let usr = firebase.database().ref('ads_data').child(req.body.ID);
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
router.post('/createAds',function (req, res) {



    console.log("add new Services")
    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER' || req.session.user.account_type.toString() === 'COORDINATOR')) {

            upload(req, res, function (err) {

                if (err) {
                    console.log('Error: ' + err)
                    res.end('{"message" : "Profile picture is not uploaded.!", "status" : 500}');
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


////////////////////////////////////////////// BLOCK ADS HERE/////////////////////////////////////////////////////
////////////////////////////////////////////// BCLOCK ADS HERE/////////////////////////////////////////////////////
////////////////////////////////////////////// BLOCK SHOPS HERE/////////////////////////////////////////////////////

router.post('/blockAds', function (req, res) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER' || req.session.user.account_type.toString() === 'COORDINATOR')) {

            let starCountRef = firebase.database().ref('ads_data').child(req.body.ID).once('value', function (snapshot) {
                console.log(snapshot.val());
                if (req.body.status === '0') {
                    admin.auth().updateUser(req.body.ID, {
                        disabled: true
                    }).then(function (userRecord) {

                        firebase.database().ref('ads_data').child(req.body.ID).update({
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
////////////////////////////////////////////// BLOCK ADS END HERE/////////////////////////////////////////////////////
////////////////////////////////////////////// BCLOCK ADS END HERE/////////////////////////////////////////////////////
////////////////
router.get('/regional_admin', function (req, res, next) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN')) {
            res.render('Template/template', {
                Page_Content: 'Regional',
                title: 'Rail Web App | Regional Admin',
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

router.get('/manager', function (req, res, next) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER')) {
            res.render('Template/template', {
                Page_Content: 'Manager',
                title: 'Rail Web App | Manager',
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

router.get('/coordinator', function (req, res, next) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER' || req.session.user.account_type.toString() === 'COORDINATOR')) {
            res.render('Template/template', {
                Page_Content: 'Coordinator',
                title: 'Rail Web App | Coordinator',
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




router.get('/trackShops', function (req, res) {
    if (req.session.user) {

        if (req.session.user.privileges.shop_access === 1) {
            res.render('Template/template', {
                Page_Content: 'Track_Shops',
                title: 'Rail Web App | Track Taxi Drivers',
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

router.post('/updateRegionalUser', function (req, res) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER')) {

            let create_account = 0;
            let shop = 0;

            if (req.body.edit_chk_create_account === '1')
                create_account = 1;

            if (req.body.edit_chk_taxi_access === '1')
                shop = 1;

            firebase.database().ref('backend_users').child(req.body.edit_txt_uid).update({
                pro_id: req.body.edit_cmb_province,
                des_id: req.body.edit_cmb_district,
                privileges: {
                    create_user: create_account,
                    shop_access: shop
                },
                district_name: req.body.edit_txt_district_name,
                province_name: req.body.edit_txt_province_name
            }, function (errors) {
                if (errors) {
                    console.log(errors);
                    res.end('{"message" : "Internal server error.!", "status" : 500}');
                } else {
                    res.end('{"message" : "Account updated successfully.!", "status" : 200}');
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

//create regional users

router.post('/createRegionalUser', function (req, res) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN')) {

            upload(req, res, function (err) {
                if (err) {
                    console.log('Error: ' + err)
                    res.end('{"message" : "Profile picture is not uploaded.!", "status" : 500}');
                }

                firebase.auth().createUserWithEmailAndPassword(req.body.txt_email, req.body.txt_confirm_password).then(function () {
                    let user = firebase.auth().currentUser;

                    let create_account = 0;
                    let shop = 0;


                    if (req.body.chk_create_account === '1')
                        create_account = 1;

                    if (req.body.chk_taxi_access === '1')
                        shop = 1;

                   
                    firebase.database().ref('backend_users').child(user.uid).set({
                        account_type: 'REGIONAL ADMIN',
                        email: req.body.txt_email,
                        first_name: req.body.txt_first_name,
                        last_name: req.body.txt_last_name,
                        profile_pic_url: req.file.filename,
                        contact_no: req.body.txt_tel,
                        pro_id: req.body.cmb_province,
                        des_id: req.body.cmb_district,
                        privileges: {
                            create_user: create_account,
                            shop_access: shop
                        },
                        district_name: req.body.txt_district_name,
                        province_name: req.body.txt_province_name,
                        uid: user.uid,
                        status: 1,
                    }, function (errors) {
                        if (errors) {
                            console.log(errors);
                            res.end('{"message" : "Firebase error.!", "status" : 500}');
                        } else {

                            user.sendEmailVerification().then(function () {
                                res.end('{"message" : "Account created successfully, Please check for verify email for given mail.!", "status" : 200}');
                            }).catch(function (error) {
                                res.end('{"message" : "Message Server Error.!", "status" : 500}');
                            });

                        }
                    });

                }).catch(function (error) {
                    console.log(error);
                    res.end('{"message" : "This account is already exist.!", "status" : 500}');
                    fs.unlink('./public/images/users/' + req.file.filename, function (err) {
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

router.post('/createManager', function (req, res) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER')) {

            upload(req, res, function (err) {
                if (err) {
                    console.log('Error: ' + err)
                    res.end('{"message" : "Profile picture is not uploaded.!", "status" : 500}');
                }

                firebase.auth().createUserWithEmailAndPassword(req.body.txt_email, req.body.txt_confirm_password).then(function () {
                    let user = firebase.auth().currentUser;

                    let create_account = 0;
                    let shop = 0;

                    if (req.body.chk_create_account === '1')
                        create_account = 1;

                    if (req.body.chk_taxi_access === '1')
                        shop = 1;
                    firebase.database().ref('backend_users').child(user.uid).set({
                        account_type: 'MANAGER',
                        email: req.body.txt_email,
                        first_name: req.body.txt_first_name,
                        last_name: req.body.txt_last_name,
                        profile_pic_url: req.file.filename,
                        contact_no: req.body.txt_tel,
                        pro_id: req.body.cmb_province,
                        des_id: req.body.cmb_district,
                        privileges: {
                            create_user: create_account,
                            shop_access: shop
                        },
                        district_name: req.body.txt_district_name,
                        province_name: req.body.txt_province_name,
                        uid: user.uid,
                        status: 1,
                    }, function (errors) {
                        if (errors) {
                            console.log(errors);
                            res.end('{"message" : "Firebase error.!", "status" : 500}');
                        } else {

                            user.sendEmailVerification().then(function () {
                                res.end('{"message" : "Account created successfully, Please check for verify email for given mail.!", "status" : 200}');
                            }).catch(function (error) {
                                res.end('{"message" : "Message Server Error.!", "status" : 500}');
                            });

                        }
                    });

                }).catch(function (error) {
                    console.log(error);
                    res.end('{"message" : "This account is already exist.!", "status" : 500}');
                    fs.unlink('./public/images/users/' + req.file.filename, function (err) {
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

router.post('/createCoordinator', function (req, res) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER' || req.session.user.account_type.toString() === 'COORDINATOR')) {

            upload(req, res, function (err) {
                if (err) {
                    console.log('Error: ' + err)
                    res.end('{"message" : "Profile picture is not uploaded.!", "status" : 500}');
                }

                firebase.auth().createUserWithEmailAndPassword(req.body.txt_email, req.body.txt_confirm_password).then(function () {
                    let user = firebase.auth().currentUser;

                    let create_account = 0;
                    let shop = 0;

                    if (req.body.chk_create_account === '1')
                        create_account = 1;

                    if (req.body.chk_taxi_access === '1')
                        shop = 1;

                    firebase.database().ref('backend_users').child(user.uid).set({
                        account_type: 'COORDINATOR',
                        email: req.body.txt_email,
                        first_name: req.body.txt_first_name,
                        last_name: req.body.txt_last_name,
                        profile_pic_url: req.file.filename,
                        contact_no: req.body.txt_tel,
                        pro_id: req.body.cmb_province,
                        des_id: req.body.cmb_district,
                        privileges: {
                            create_user: create_account,
                            shop_access: shop
                        },
                        district_name: req.body.txt_district_name,
                        province_name: req.body.txt_province_name,
                        uid: user.uid,
                        status: 1,
                    }, function (errors) {
                        if (errors) {
                            console.log(errors);
                            res.end('{"message" : "Firebase error.!", "status" : 500}');
                        } else {

                            user.sendEmailVerification().then(function () {
                                res.end('{"message" : "Account created successfully, Please check for verify email for given mail.!", "status" : 200}');
                            }).catch(function (error) {
                                res.end('{"message" : "Message Server Error.!", "status" : 500}');
                            });

                        }
                    });

                }).catch(function (error) {
                    console.log(error);
                    res.end('{"message" : "This account is already exist.!", "status" : 500}');
                    fs.unlink('./public/images/users/' + req.file.filename, function (err) {
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

router.post('/removeSuperUser', function (req, res) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER' || req.session.user.account_type.toString() === 'COORDINATOR')) {

            let starCountRef = firebase.database().ref('backend_users').child(req.body.ID);
            starCountRef.once('value', function (snapshot) {
                admin.auth().deleteUser(req.body.ID)
                    .then(function () {
                        let usr = firebase.database().ref('backend_users').child(req.body.ID);
                        usr.remove()
                            .then(function () {
                                fs.unlink('./public/images/users/' + snapshot.val().profile_pic_url, function (err) {
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


router.post('/blockSuperUser', function (req, res) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && (req.session.user.account_type.toString() === 'SUPER ADMIN' || req.session.user.account_type.toString() === 'REGIONAL ADMIN' || req.session.user.account_type.toString() === 'MANAGER' || req.session.user.account_type.toString() === 'COORDINATOR')) {

            if (req.body.status === '1') {
                admin.auth().updateUser(req.body.ID, {
                    disabled: true
                }).then(function (userRecord) {

                    firebase.database().ref('backend_users').child(req.body.ID).update({
                        status: 0
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
            if (req.body.status === '0') {
                admin.auth().updateUser(req.body.ID, {
                    disabled: false
                }).then(function (userRecord) {

                    firebase.database().ref('backend_users').child(req.body.ID).update({
                        status: 1
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


router.post('/createUser', function (req, res) {

    if (req.session.user) {

        if (req.session.user.privileges.create_user === 1 && req.session.user.account_type.toString() === 'SUPER ADMIN') {

            upload(req, res, function (err) {
                if (err) {
                    console.log('Error: ' + err)
                    res.end('{"message" : "Profile picture is not uploaded.!", "status" : 500}');
                }

                firebase.auth().createUserWithEmailAndPassword(req.body.txt_email, req.body.txt_confirm_password).then(function () {
                    let user = firebase.auth().currentUser;

                    firebase.database().ref('backend_users').child(user.uid).set({
                        account_type: 'SUPER ADMIN',
                        email: req.body.txt_email,
                        first_name: req.body.txt_first_name,
                        last_name: req.body.txt_last_name,
                        profile_pic_url: req.file.filename,
                        contact_no: req.body.txt_tel,
                        privileges: {
                            create_user: 1,
                            shop_access: 1
                        },
                        uid: user.uid,
                        status: 1,
                    }, function (errors) {
                        if (errors) {
                            console.log(errors);
                            res.end('{"message" : "Firebase error.!", "status" : 500}');
                        } else {

                            user.sendEmailVerification().then(function () {
                                res.end('{"message" : "Account created successfully, Please check for verify email for given mail.!", "status" : 200}');
                            }).catch(function (error) {
                                res.end('{"message" : "Message Server Error.!", "status" : 500}');
                            });

                        }
                    });

                }).catch(function (error) {
                    console.log(error);
                    res.end('{"message" : "This account is already exist.!", "status" : 500}');
                    fs.unlink('./public/images/users/' + req.file.filename, function (err) {
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




module.exports = router;