//create express app
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var bcrypt = require('bcrypt');
//connect to mongodb atlas
var saltround = 10;

var mongoose = require('mongoose');
const User = require('./models/User');
const uri =
  'mongodb+srv://snj:snj@cluster0.ndqer.mongodb.net/gdsc?retryWrites=true&w=majority';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('strictQuery', false);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});
const hash_salt = 'gdsc_uvce';
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json({limit: "5mb"}));
app.use(bodyParser.urlencoded({limit: "5mb", extended: true, parameterLimit:5000}));

//create static path
app.use(express.static(path.join(__dirname, 'public')));

//create view engine
app.set('views', path.join(__dirname, 'views'));

//set view engine
app.set('view engine', 'ejs');

//create routes
app.get('/', function (req, res) {
  User.find({}, function (err, users) {
    if (err) {
      console.log(err);
      res.render('index', {
        users: [],
      });
    } else {
      res.render('index', {
        users: users,
      });
    }
  });
});

app.get('/signup', function (req, res) {
  res.render('signup');
});

app.post('/signup', function (req, res) {
  console.log(req.body);
  var newUser = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username.split(' ').join(''),
    branch: req.body.branch,
    year: req.body.year,
    password: req.body.password,
    phone: req.body.phone,
    instagram: req.body.instagram,
    shareInstagram: req.body.shareInstagram == 'on' ? true : false,
  });
  newUser.save(function (err, user) {
    if (err) {
      console.log(err);
      res.render('signup');
    } else {
      res.redirect('/');
    }
  });
});

app.get('/html/:username', function (req, res) {
  User.findOne({ username: req.params.username }, function (err, user) {
    if (err) {
      res.send('404');
    } else {
      res.send(user.html);
    }
  });
});

// app.get('/edit/:username', function (req, res) {
//   User.findOne({ username: req.params.username }, function (err, user) {
//     if (err) {
//       res.send('404');
//     } else {
//       res.render('editauth', {
//         username: user.username,
//       });
//     }
//   });
// });

app.post('/:hash/gdsc_uvce/edit/:username', function (req, res) {
  bcrypt.compare(
    req.params.username,
    decodeURIComponent(req.params.hash),
    function (err, result) {
      if (err) res.send('404');
      if (result) {
        User.findOne({ username: req.params.username }, (err, user) => {
          if (err || user === null) res.send('404');
          else {
            user.html = req.body.html;
            user.modifiedCount = user.modifiedCount + 1;
            user.save(function (err, user) {
              if (err) {
                res.send('404');
              } else {
                res.redirect('/');
              }
            });
          }
        });
      } else res.send('Invalid Credentials');
    }
  );
  // User.findOne({ username: req.params.username }, function (err, user) {
  //   if (err) {
  //     res.send(
  //       'An Error Occured while processing your request. Please try again later.'
  //     );
  //   } else {
  //     if (user == null) {
  //       res.send('Invalid Credentials');
  //     } else {
  //       user.html = req.body.html;
  //       user.modifiedCount = user.modifiedCount + 1;
  //       user.save(function (err, user) {
  //         if (err) {
  //           res.send('404');
  //         } else {
  //           res.redirect('/');
  //         }
  //       });
  //     }
  //   }
  // });
});

//Test route to get all the users

// app.get('/admin/test/', (req, res) => {
//   User.find({}, (err, users) => {
//     if (err) res.send('404');
//     else res.send(users);
//   });
// });

function b64EncodeUnicode(str) {
  //encodes the string
  return encodeURIComponent(bcrypt.hash(str, 10));
}

function UnicodeDecodeB64(str) {
  //decodes the string
  return decodeURIComponent(bcrypt.compare());
}

app.get('/edit/:username', (req, res) => {
  res.render('editauth', { username: req.params.username });
});

app.post('/view/:username', (req, res) => {
  User.findOne({ username: req.params.username }, (err, user) => {
    if (err) res.send('404');
    else {
      if (user.password === req.body.password) {
        bcrypt.genSalt(saltround, function (err, salt) {
          if (err) res.send('404');
          bcrypt.hash(user.username, salt, function (err, hs) {
            if (err) res.send('404');
            else {
              str = encodeURIComponent(hs);
              res.redirect(`/${str}/edit/${req.params.username}`);
            }
          });
        });
      } else res.send('Enter a correct password!!');
    }
  });
});
app.get('/:hash/edit/:username', (req, res) => {
  bcrypt.compare(
    req.params.username,
    decodeURIComponent(req.params.hash),
    function (err, result) {
      if (err) res.send('404');
      if (result) {
        User.findOne({ username: req.params.username }, (err, user) => {
          if (err || user === null) res.send('404');
          else {
            var hash_str = encodeURIComponent(req.params.hash);
            res.render('edit', { user: user, hash_str: hash_str });
          }
        });
      } else res.send('url not found');
    }
  );
});
app.listen(3000, function () {
  console.log('Server started on port 3000...');
});
