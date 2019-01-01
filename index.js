process.env["NTBA_FIX_319"] = 1;
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config()
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/hostFather";

MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db('hostFather');
});


const token = process.env.BOT_TOKEN;



const bot = new TelegramBot(token, { polling: true });
//last pm that sent to user
let lastPm;
//meg to get username from user
let UsernameLabel = 'Please Enter your User name:';
let NumLabel = 'Please Enter your Phone Number:';
let tempUsername='';
let tempNum='';
bot.onText(/\/start/, (msg) => {
    //welcome msg and defualt keyboard
    bot.sendMessage(msg.chat.id, "Welcome", {
        "reply_markup": {
            "keyboard": [["/login"], ["/register"]],
            "one_time_keyboard": true,
        }
    });

});
//if user selected /Register
bot.onText(/\/register/, (msg) => {

    bot.sendMessage(msg.chat.id,
        UsernameLabel,
        { reply_markup: JSON.stringify({ force_reply: true }) })
        .then(rep => {
            //update the last pm state
            lastPm = rep;
        });


});
bot.onText(/New Register Form/, (msg) => {

    bot.sendMessage(msg.chat.id,
        UsernameLabel,
        { reply_markup: JSON.stringify({ force_reply: true }) })
        .then(rep => {
            //update the last pm state
            lastPm = rep;
        });


});
bot.onText(/\/login/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome");
});
//if user sent any message
bot.on('message', (msg) => {
    //  console.log(msg);



    //if that message had reply_to_message proprty 
    if (msg.reply_to_message) {
        //if user replyed to usernaemLable 
        if (msg.reply_to_message.text == UsernameLabel) {

            let msgText = msg.text
            if (msgText.length < 3) {
                console.log(msgText.length);

                bot.sendMessage(msg.chat.id, "User name Should contain more than 3 letter!", {
                    "reply_markup": {
                        "keyboard": [["New Register Form"]],
                        "one_time_keyboard": true,
                    }
                });
                return;
            }
            else {
                tempUsername = msg.text;
                bot.sendMessage(msg.chat.id,
                    NumLabel,
                    { reply_markup: JSON.stringify({ force_reply: true }) })
                    .then(rep => {
                        //update the last pm state
                        lastPm = rep;
                    });
            }
        }
        if (msg.reply_to_message.text == NumLabel) {
            let msgText = msg.text
            if (msgText.length < 11) {
                bot.sendMessage(msg.chat.id, "Phone Number Should contain more than 11 letter!", {
                    "reply_markup": {
                        "keyboard": [["New Register Form"]],
                        "one_time_keyboard": true,
                    }
                });
                return;
            }
            var regex = /^[0-9]*(?:\.\d{1,2})?$/;    // allow only numbers [0-9] 
            if (!regex.test(msg.text)) {
                bot.sendMessage(msg.chat.id, "Invalid Number");
            }
            else {
                tempNum = msg.text;
                CreateUser(tempUsername, tempNum);
            }

        }

    }
    else {
        return;
    }

});
bot.on('polling_error', (error) => {
    console.log(error);  // => 'EFATAL'
});

function CreateUser(tempUsername, tempNum) {
    // console.log(`${tempUsername} : ${tempNum}`);
    bot.sendMessage(msg.chat.id, "OK let me make your account");
}