/**
 * Author: petar
 * Date: 9/29/13
 */

/** Dependencies **/

var twilio = require('twilio'),
    accountSid = process.env.TWILIO_ACCOUNT_SID,
    authToken = process.env.TWILIO_AUTH_TOKEN,
    tNumber = process.env.TWILIO_NUMBER;

// Create a new REST API client to make authenticated requests against the twilio back end
var client = new twilio.RestClient(accountSid, authToken);

function sendSMS(number, msg) {

    console.log('Sending ' + msg + ' to ' + number);

    client.sms.messages.create({
        body: msg,
        to: number,
        from: tNumber.toString()
    }, function(error, message) {
        // The HTTP request to Twilio will run asynchronously. This callback
        // function will be called when a response is received from Twilio
        // The "error" variable will contain error information, if any.
        // If the request was successful, this value will be "falsy"
        if (!error) {
            // The second argument to the callback will contain the information
            // sent back by Twilio for the request. In this case, it is the
            // information about the text messsage you just sent:
            console.log('Success! The SID for this SMS message is:');
            console.log(message.sid);

            console.log('Message sent on:');
            console.log(message.dateCreated);
        }
        else {
            console.log('Oops! There was an error. ', error);
        }
    });
}

/** Expose Public API **/
exports.sendSMS = sendSMS;