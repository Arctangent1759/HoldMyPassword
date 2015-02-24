/* This is a useless comment. */
var mysql = require('mysql');

var connection = mysql.createConnection({
    host    : 'localhost',
    user    : 'Steve',
    password: 'dongers1234'
});

connection.query('CREATE DATABASE IF NOT EXISTS passStore');
connection.query('USE passStore');
connection.query('CREATE TABLE IF NOT EXISTS passTable (keyText text, start_time int, duration int, password text, correct text)', function (err, result) {
    if (err) {
        console.log(err);
    } else { 
        console.log("Created table.");
    }
});

/* Adds key to store. If the key already exists return false. */
function AddKeyToStore(key, start_time, duration, encrypted_password, correct) {
    var post = {keyText: key, start_time: start_time, duration: duration, password: encrypted_password, correct: correct};
    var query = connection.query('INSERT INTO passTable SET ?', post, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("Succesfully added key.");
        }
    });
    console.log(query.sql);
}

/* Gets value from store. If the key doesn't exists return false. */
function GetKeyFromStore(key) {
    var query = connection.query('SELECT * FROM passTable WHERE keyText=?', [key], function(err, result) {
        if (err) {
            console.log(err);
            return false;
        } else {
            console.log("Succesfully retrieved key.");
        }
        console.log(result);
        return result
    });
    console.log(query.sql);
}

/* Deletes key and value from store. If the key doesn't exist return false. */
function DeleteKeyFromStore(key) {
    var query = connection.query('DELETE FROM passTable WHERE keyText=?', [key], function(err, result) {
        if (err) {
            console.log(err);
            return false;
        } else {
            console.log("Succesfully deleted key.");
        }
    });
}

function IsKeyInStore(key) {
    var query = connection.query("SELECT COUNT(*) AS 'has_key' FROM passTable WHERE keyText=?", [key], function(err, result) {
        if (err) {
            console.log(err);
            return false;
        } else {
            if (result[0].has_key == 1) {
                return true;
            } else {
                return false;
            }
        }
    });
}

AddKeyToStore('test', 1, 1, 'hello', 'world');
IsKeyInStore('test');
console.log(GetKeyFromStore('test'));
DeleteKeyFromStore('test');
