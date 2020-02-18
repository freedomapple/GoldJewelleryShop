var express = require('express');
var userModule = require('../modules/user');
var adminModule = require('../modules/admin');
var uploadModel = require('../modules/upload');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var multer = require('multer');
var path = require('path');
var upload = multer({ dest: 'uploads/' });
var router = express.Router();

router.use(express.static(__dirname + "./public/"));

function checkLogUser(req, res, next) {
    var userToken = localStorage.getItem('userToken');
    try {

        var decoded = jwt.verify(userToken, 'loginToken');
    }
    catch (err) {
        //res.redirect('/');
        res.render('index', { title: 'Login', msg: 'Please Login First !!' });
    }
    next();
}
//------------logintoken-------------------

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
} 

//-------------------------------------------
//---------------Middlewares area----------------------


function checkEmail(req, res, next) {
    var email = req.body.email;
    var checkexitemail = userModule.findOne({ email: email });
    checkexitemail.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render('signup', { title: 'Signup', msg: 'This Email is already Exist...Try again!' });
        }
        next();
    });
}

function checkUname(req, res, next) {
    var uname = req.body.uname;
    var checkexituname = userModule.findOne({ uname: uname });
    checkexituname.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render('signup', { title: 'Signup', msg: 'This Username is already Exist...Try again!' });
        }
        next();
    });
}

function checkaEmail(req, res, next) {
    var aemail = req.body.aemail;
    var checkexitaemail = adminModule.findOne({ aemail: aemail });
    checkexitaemail.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render('signup', { title: 'Signup', msg: 'This Email is already Exist...Try again!' });
        }
        next();
    });
}

function checkaUname(req, res, next) {
    var admin = req.body.admin;
    var checkexitadmin = adminModule.findOne({ admin: admin});
    checkexitadmin.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render('signup', { title: 'Signup', msg: 'This Username is already Exist...Try again!' });
        }
        next();
    });
}

//-----------------------------------------------------

 var imageData = uploadModel.find({});

/* GET/POSt home page. ------------------------------------------------------------------*/

var Storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({
    storage: Storage  
}).single('file');

router.get('/uploadItems', upload, function (req, res, next) {
    res.render('uploadItems', { title: 'Upload File', records: '', success: '' });
});

router.post('/upload', upload, function (req, res, next) {
    var imageFile = req.file.filename;
    var success = req.file.filename + " uploaded successfully";

    var imageDetails = new uploadModel({
        imagename: imageFile
    });
    imageDetails.save(function (err, doc) {
        if (err) throw err;

        imageData.exec(function (err, data) {
            if (err) throw err;
            res.render('uploadItems', { title: 'Upload File', records: data, success: success });
        });

    });

});

router.get('/', function (req, res, next) {
    var loginU = localStorage.getItem('loginUser');
    if (loginU)
        res.redirect('/home');
    else
        res.render('index', { title: 'Login', msg: '' });
});

router.post('/', function (req, res, next) {
    var uname = req.body.uname;
    var pass = req.body.pass;
    var checkUser = userModule.findOne({ uname: uname });
    checkUser.exec((err, data) => {
        if (err) throw err;
        var gerUserID = data._id;
        var getPass = data.pass;
        if (bcrypt.compareSync(pass, getPass)) {
            var token = jwt.sign({ userID: gerUserID }, 'loginToken');
            localStorage.setItem('userToken', token);
            localStorage.setItem('loginUser', uname);
            res.redirect('/home');
           // res.render('index', { title: 'Login', msg: 'Nice' });
        }
        else {
            res.render('index', { title: 'Login', msg: 'Invalid Username/Password' });
        }
    });

});

router.get('/signup', function (req, res, next) {
    var loginU = localStorage.getItem('loginUser');
    if (loginU)
        res.redirect('/home');
    else
        res.render('signup', { title: 'Signup', msg: '' });
});

router.post('/signup', checkEmail, checkUname, function (req, res, next) {
    var fname = req.body.fname;
    var email = req.body.email;
    var uname = req.body.uname;
    var pass = req.body.pass;
    var cpass = req.body.cpass;
    if (cpass != pass)
        res.render('signup', { title: 'Signup', msg: 'Password not matched...' });
    else {
        pass = bcrypt.hashSync(req.body.pass, 10);
        var userDetails = new userModule({
            fname: fname,
            email: email,
            uname: uname,
            pass: pass
        });
        userDetails.save((err, doc) => {
            if (err) throw err;
            res.render('signup', { title: 'Signup', msg: 'Signup Successfully...' });
        });
    }

});

router.get('/adminlogin', function (req, res, next) {
        res.render('adminlogin', { title: 'Admin Login', msg: '' });
});

router.post('/adminlogin', function (req, res, next) {
    var admin = req.body.admin;
    var apass = req.body.apass;
    var checkAdmin = adminModule.findOne({ admin: admin });
    checkAdmin.exec((err, data) => {
        if (err) throw err;

        var getApass = data.apass;
        if (bcrypt.compareSync(apass, getApass)) {
            res.redirect('/home');
            // res.render('adminlogin', { title: 'Admin Login', msg: 'Login Successfully...' });
        }
        else {
            res.render('adminlogin', { title: 'Admin Login', msg: 'Invalid Username/Password' });
        }
    });

});

router.get('/adminsignup', function (req, res, next) {
        res.render('adminsignup', { title: 'Signup', msg: '' });
});

router.post('/adminsignup', checkaEmail, checkaUname, function (req, res, next) {
    var aname = req.body.aname;
    var aemail = req.body.aemail;
    var admin = req.body.admin;
    var apass = req.body.apass;
    var acpass = req.body.acpass;
    if (acpass != apass)
        res.render('signup', { title: 'Signup', msg: 'Password not matched...' });
    else {
        apass = bcrypt.hashSync(req.body.apass, 10);
        var adminDetails = new adminModule({
            aname: aname,
            aemail: aemail,
            admin: admin,
            apass: apass
        });
        adminDetails.save((err, doc) => {
            if (err) throw err;
            res.render('adminsignup', { title: 'Signup', msg: 'Signup Successfully...' });
        });
    }

});

router.get('/logout', function (req, res, next) {
    localStorage.removeItem('userToken');
    localStorage.removeItem('loginUser');
    res.redirect('/');

    
});

router.get('/home', checkLogUser, function (req, res, next) {
    var loginU = localStorage.getItem('loginUser');
    res.render('home', { title: '~VIJAY JEWELLERS~', loginU: loginU });
    
});

router.get('/shop', checkLogUser, function (req, res, next) {
    var loginU = localStorage.getItem('loginUser');
    res.render('shop', { title: '~Shop~', loginU: loginU});
});

router.get('/about', function (req, res, next) {
    var loginU = localStorage.getItem('loginUser');
    res.render('about', { title: '~About~', loginU: loginU});
});

router.get('/cart', checkLogUser, function (req, res, next) {
    var loginU = localStorage.getItem('loginUser');
    res.render('cart', { title: '~Cart~', loginU: loginU});
});

router.get('/checkout', checkLogUser, function (req, res, next) {
    var loginU = localStorage.getItem('loginUser');
    res.render('checkout', { title: '~CheckOut~', loginU: loginU});
});

router.get('/contact', function (req, res, next) {
    var loginU = localStorage.getItem('loginUser' );
    res.render('contact', { title: '~Contact~', loginU: loginU});
});

router.get('/shop-single', checkLogUser, function (req, res, next) {
    var loginU = localStorage.getItem('loginUser');
    res.render('shop-single', { title: '~Shop Single~', loginU: loginU});
});

router.get('/thankyou', checkLogUser, function (req, res, next) {
    var loginU = localStorage.getItem('loginUser');
    res.render('thankyou', { title: '~ThankYou~', loginU: loginU});
});

router.get('/uploadItems', checkLogUser, function (req, res, next) {
    
    res.render('uploadItems', { title: '~ThankYou~'});
});

//---------------------------------------------------------------------------
module.exports = router;
