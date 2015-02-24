var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var server = require('http').createServer(app);
var crypto = require('crypto');
var nunjucks  = require('nunjucks');

var salt = 'hi github. not the real salt.'
var correct = 'CORRECT'

function Encrypt(buffer,password){
  var cipher = crypto.createCipher('aes-256-ctr',password)
  var crypted = Buffer.concat([cipher.update(buffer),cipher.final()]);
  return crypted.toString('base64');
}
function Decrypt(buffer,password){
  var decipher = crypto.createDecipher('aes-256-ctr',password)
  var dec = Buffer.concat([decipher.update(new Buffer(buffer,'base64')) , decipher.final()]);
  return dec.toString('ascii');
}
function GetBigRandomNumber() {
  return Math.floor(Math.random() * 99999999999999999999);
}
function Hash(x, encoding) {
  return crypto.createHash('sha512').update(salt + x).digest(encoding);
}

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

var datastore = {
}
function AddKeyToStore(key, start_time, duration, encrypted_password, pass_correct) {
  if (key in datastore) {
    return false;
  } else {
    datastore[key] = [start_time, duration, encrypted_password, pass_correct];
    console.log(datastore);
  }
}
function GetKeyFromStore(key) {
  if (!(key in datastore)) {
    return false;
  }
  return datastore[key];
}
function DeleteKeyFromStore(key) {
  if (!(key in datastore)) {
    return false;
  }
  delete(datastore[key]);
}
function IsKeyInStore(key) {
  return key in datastore;
}

app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function (req, res) {
    res.render('index.html',{});
});

app.post('/lock', function(req, res){
  var now = Number(new Date());
  var duration = Number(req.body.duration);
  var key;
  var secret = Hash(GetBigRandomNumber(),'base64');
  var password = Hash(GetBigRandomNumber(),'hex');
  while (true) {
    key = Hash(GetBigRandomNumber(),'base64');
    if (!IsKeyInStore(key)) {
      break;
    }
  }
  AddKeyToStore(key, now, duration, Encrypt(password,secret), Encrypt(correct,secret));
  res.render('lock.html', {'password':password,
                               'key':key,
                               'secret':secret,
                               'duration':duration});
});

app.post('/unlock', function(req, res){
  var now = Number(new Date());
  var row = GetKeyFromStore(req.body.key);
  if (!row) {
    res.render('unrecognized_key.html', {});
    return;
  }
  var secret = req.body.secret;
  var start_time = row[0]
  var duration = row[1]
  var cyphertext = row[2]
  console.log(row[3])
  console.log(secret)
  var pass_correct = (Decrypt(row[3],secret) == correct)
  if (!pass_correct){
    res.render('wrong_secret.html', {});
    return;
  }
  var password = Decrypt(cyphertext, secret);
  if (now < start_time + duration) {
    res.render('time.html', {'time':start_time+duration-now});
  }
  res.render('unlock.html', {'password':password});
});


server.listen(1759);
