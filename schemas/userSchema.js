/**
 * Author: petar
 * Date: 9/29/13
 */
/**
 * Author: petar
 * Date: 3/11/13
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    mongoLabDriver = process.env.MONGOLAB_DRIVER;

mongoose.connection.on('open', function (ref) {
    console.log('Mongoose connected to mongo server.');
});
mongoose.connection.on('error', function (err) {
    console.log('Could not connect to mongo server!');
    console.log(err);
});

mongoose.connect(mongoLabDriver.toString());

var UserSchema = new Schema({
    _id: ObjectId,
    uuid: {type: String, required: true},
    phoneNumber: {type: String, required: true},
    device: {
        width: {type: Number},
        height: {type: Number},
        platform: {type: String}
    },
    language: {type: String},
    ip: {type: String},
    time : { type : Date, default: Date.now }
});

exports.UserSchema = UserSchema;
exports.User = mongoose.model('User', UserSchema);

/* Mongoose Types:
 String
 Number
 Boolean | Bool
 Array
 Buffer
 Date
 ObjectId | Oid
 Mixed
 */

/*
 {
 "_id": "50d7fd9178d83f19534b7c0d",
 "id": 1,
 "city": "Alhambra",
 "pos": {
 "lng": -118.1346741,
 "lat": 34.1061096
 },
 "address": "1210 N. Atlantic Blvd. 91801 Los Angeles"
 }
 */