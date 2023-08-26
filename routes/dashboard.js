let express = require('express');
let router = express.Router();
let firebase = require('firebase/app');

require("firebase/auth");


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

    if(req.session.user) {
        res.render('Template/template', {
            Page_Content: 'Dashboard',
            title: 'Rail Web App | Dashboard',
            profile: req.session.user
        });
    }else{
        res.render('Login/login', {
            data: 'Please login!.',
            title: 'Rail Web App | Login',
            status: ''
        });
    }
});

module.exports = router;
