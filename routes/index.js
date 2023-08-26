let express = require('express');
let router = express.Router();
let firebase = require('firebase/app');

require("firebase/auth");
require("firebase/database");



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




router.get('/', function(req, res, next) {
  res.render('Login/login', {
    title: 'Rail Web App | Login',
    data: '',
    status: ''
  });
});

router.post('/signIn', function(req, res, next) {
  let email = req.body.txt_email;
  let password = req.body.txt_password;

  firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
    let user = firebase.auth().currentUser;
    if(user.emailVerified){
      if (user) {
        let starCountRef = firebase.database().ref('backend_users').child(user.uid);
        starCountRef.once('value', function (snapshot) {

          req.session.user = snapshot.val();
          console.log(req.session.user);
          res.render('Template/template', {
            Page_Content: 'Dashboard',
            title: 'Rail Web App | Dashboard',
            profile: req.session.user
          });

        }).catch(function (error) {
          res.render('Login/login', {
            data: error.message,
            title: 'Error | User Login'
          });
        });
      }
    }else{
      res.render('Login/login', {
        data: 'Please verify your given email account',
        title: 'Error | User Login'
      });
    }

  }).catch(function (error) {
    console.log(error.code);

    let message = '';
    if(error.code === 'auth/user-disabled'){
      message = error.message;
    }
    if(error.code === 'auth/wrong-password'){
      message = 'Invalid username or password.!';
    }

    res.render('Login/login', {
      title: 'Rail Web App | Login',
      data: message
    });

  });
});
//forget Email sending
router.post('/forgetPassword', function(req, res, next) {
  let email = req.body.txt_email;

  firebase.auth().sendPasswordResetEmail(email).then(function() {
    res.render('Login/login', {
      data: "Account recovery mail has been sent.!",
      title: 'Sherlock | User Login'
    });
  }).catch(function(error) {
    res.render('Login/login', {
      data: "Internal Server Error.!",
      title: 'Sherlock | User Login'
    });
  });
});

router.get('/logout', function(req, res, next) {

  if(req.session.user){

    firebase.auth().signOut().then(function () {
      req.session.destroy();

      res.render('Login/login', {
        data: 'Please login!.',
        title: 'Rail Web App | Login',
        status: ''
      });

    }).catch(function (error) {
      res.render('Login/login', {
        data: error.message,
        title: 'Rail Web App | Login',
        status: ''
      });
    });

  }else{
    res.render('Login/login', {
      data: 'Please login!.',
      title: 'Rail Web App | Login',
      status: ''
    });
  }

});


router.get('/trainSchedule', function (req, res) {
  if (req.session.user) {

      if (req.session.user.privileges.create_user === 1) {
          res.render('Template/template', {
              Page_Content: 'Schedule',
              title: 'Rail Web App | Schedule Details',
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

router.post('/createSchedule', function (req, res) {

  if (req.session.user) {

      if (req.session.user.privileges.create_user === 1 && req.session.user.account_type.toString() === 'SUPER ADMIN') {

        var databaseRef= firebase.database().ref();
        console.log(req.body)
        // console.log(req.body.cmb_location ,req.body.txt_trainID ,req.body.cmb_station,req.body.cmb_to_station,req.body.txt_depature,req.body.txt_arrival,req.body.txt_2_local_fee,req.body.txt_2_foreign_fee,req.body.txt_3_local_fee,req.body.txt_3_foreign_fee,req.body.txt_day,req.body.txt_dayString)
        let date = Date.now()
        firebase.database().ref('train_station').child(date).set({
            endAndBegin: req.body.cmb_location,
            trainID: req.body.txt_trainID,
            fromStation: req.body.cmb_station,
            toStation: req.body.cmb_to_station,
            depature: req.body.txt_depature,
            arrival: req.body.txt_arrival,
            secondClassAN: "Available",
            secondClassLocal: req.body.txt_2_local_fee,
            secondClassForeign: req.body.txt_2_foreign_fee,
            thirdClassAN: "Available",
            thirdClassLocal: req.body.txt_3_local_fee,
            thirdClassForeign: req.body.txt_3_foreign_fee,
            day: req.body.txt_day,
            dayString: req.body.txt_dayString,
            uid: date
        }, function (errors) {
            if (errors) {
                console.log(errors);
                res.end('{"message" : "Firebase error.!", "status" : 500}');
            } else {

                    res.end('{"message" : "Train Schedule created successfully.!", "status" : 200}');
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
