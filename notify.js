var email = require("emailjs");


exports.sendNotifyEmail = function(userId, callBack) {

    var server = email.server.connect({
        user:    "service@fillcart4.me",
        password:"1q2w3e4r!",
        host: 'smtp.gmail.com',
        port: 465,
        ssl: true

    });
    server.send({
        text:    "i hope this works",
        from:    "FillCart4.me <service@fillcart4.me>",
        to:      "userId",
        subject: "testing emailjs"
    }, function(err, message) {
        console.log(err || message);
    });
}