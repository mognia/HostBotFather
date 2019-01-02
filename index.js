process.env["NTBA_FIX_319"] = 1;
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
var EventEmitter = require('events');
var eventEmitter = new EventEmitter();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/hostFather";
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
let isAuth = false;
let LogedUser;
function CreateUser(tempUsername, tempNum, msg) {
    // console.log(`${tempUsername} : ${tempNum}`);

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db('hostFather');
        //new user object
        let newUser = { userName: tempUsername, Phone: tempNum }
        dbo.collection("users").find({ userName: tempUsername }).toArray(function (err, result) {
            // if (err) throw err;
            //if userName alredy exist
            if (result.length != 0) {
                bot.sendMessage(msg.chat.id, "This user name is alredy exist \nif you registred befor you can login now!", {
                    "reply_markup": {
                        "keyboard": [["/login"]],
                        "one_time_keyboard": true,
                    }
                });
                db.close();
            }
            if (result.length == 0) {
                //if user name is not exist in next step checking Phone existing
                dbo.collection("users").find({ Phone: tempNum }).toArray(function (err, result) {
                    // if (err) throw err;
                    //if phone number alredy exist
                    if (result.length != 0) {
                        bot.sendMessage(msg.chat.id, "This Phone number is alredy exist \nif you registred befor you can login now!", {
                            "reply_markup": {
                                "keyboard": [["/login", "New Register Form"]],
                                "one_time_keyboard": true,
                            }
                        });
                        db.close();
                    } else {

                        //adding new User to DB
                        dbo.collection('users').insertOne(newUser, function (err, res) {
                            // if (err) {
                            //     console.log(err);

                            // }
                            bot.sendMessage(msg.chat.id, "cool now you are one of us!", {
                                "reply_markup": {
                                    "keyboard": [["/login"]],
                                    "one_time_keyboard": true,
                                }
                            });
                            console.log(`${tempUsername} added to db`);
                            db.close();

                        });
                    }
                });
            }

        });


    });

}

AuthNumber = '123';

let LogedPhone;
function AuthUser(tempUsername, tempNum, msg) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db('hostFather');
        dbo.collection("users").find({ Phone: tempNum }).toArray(function (err, result) {
            //if Phone number not exist

            if (result.length == 0) {
                bot.sendMessage(msg.chat.id, "hey, i think still i don't have This Phone :( \nif you'r not registred yet you can doit now!", {
                    "reply_markup": {
                        "keyboard": [["/register"], ['/login']],
                        "one_time_keyboard": true,
                    }
                });
                db.close();
            } else {
                LogedPhone = tempNum;
                bot.sendMessage(msg.chat.id, AuthTxt, { reply_markup: JSON.stringify({ force_reply: true }) }, {
                    "reply_markup": {
                        "keyboard": [["Resend The code!"], ['/login']],
                        "one_time_keyboard": true,
                    }
                });
            }
        });

    });

}

function Landing(msg) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        var dbo = db.db('hostFather');
        dbo.collection("users").findOne({ Phone: LogedPhone }, function (err, result) {
            if (err) throw err;
            // console.log(result);
            LogedUser = result;
            isAuth = true;
            bot.sendMessage(msg.chat.id, `Welcome back dear ${result.userName}`, {
                "reply_markup": {
                    "keyboard": [["Add New Bot", "Delete Bot", "Edit Bot"], ["My Bots"]],
                }
            });
            db.close();
        });
    });
}

function CreatBot(NewBotName, NewBotKey, msg) {
    let newBot = { name: NewBotName, owner: LogedUser.userName, Key: NewBotKey }
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        var dbo = db.db('hostFather');
        //adding new User to DB
        dbo.collection('bots').insertOne(newBot, function (err, res) {
            // if (err) {
            //     console.log(err);

            // }
            bot.sendMessage(msg.chat.id, `${NewBotName} Succesfully Added! ^_^`, {
                "reply_markup": {
                    "keyboard": [["/login"]],
                    "one_time_keyboard": true,
                }
            });
            console.log(`${NewBotName} added to db`);
            db.close();

        });
    });
}
function ListBots(msg) {

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        var dbo = db.db('hostFather');
        //Find Bots that Loged user Have!
        dbo.collection("bots").find({ owner: LogedUser.userName }).toArray(function (err, result) {
            if (err) throw err;
            let botNames=[]
            for (const i of result) {
                botNames.push(i.name)
            }
            
            let keyBoard = [];
            for (let i = 0; i < botNames.length; i++) {
                keyBoard.push([{'text':botNames[i],'callback_data':botNames[i]}])
            }
            
            bot.sendMessage(msg.message.chat.id, `Corrently You have ${botNames.length} bots`, {
                "reply_markup": {
                    "inline_keyboard": keyBoard
                }
            });
        });
    });
}

//mesg to get username from user
let UsernameLabel = 'Please Enter your User name:';
let NumLabel = 'Please Enter your Phone Number:';
let UserLoginLabel = 'User name:';
let PassLoginLabel = 'Phone Number:';
let AuthTxt = "i sent a Authentication number to you'r phone \ntell me what is that?!";
let addBotName = 'ok what should i call your New Bot?!';
let addBotKey = 'nice name! now give me your Bot Key\n that key when you make new bot the BotFather gives to you....'
let tempUsername = '';
let tempNum = '';
let NewBotName;
let NewBotKey;
bot.onText(/\/start/, (msg) => {
    //welcome msg and defualt keyboard
    bot.sendMessage(msg.chat.id, "Welcome", {
        "reply_markup": {
            "keyboard": [["/login"], ["/register"]],
            "one_time_keyboard": true,
        }
    });

});
bot.onText(/My Bots/, (msg) => {
    if (!isAuth) {
        // err 503
        bot.sendMessage(msg.chat.id, "ok but\nYou need To Login or Register first", {
            "reply_markup": {
                "keyboard": [["/login"], ["/register"]],
                "one_time_keyboard": true,
            }
        });

    } else {
        bot.sendMessage(msg.chat.id, `Welcome back dear ${LogedUser.userName}`, {
            "reply_markup": {
                "inline_keyboard": [
                    [{ text: "Your Bots", callback_data: 'my_bots' }], // Clicking will send "my_bots"
                ]
            }
        });
    }

});
//if user selected /Register
bot.onText(/\/register/, (msg) => {
    
    bot.sendMessage(msg.chat.id,
        UsernameLabel,
        { reply_markup: JSON.stringify({ force_reply: true }) });
});
bot.onText(/New Register Form/, (msg) => {

    bot.sendMessage(msg.chat.id,
        UsernameLabel,
        { reply_markup: JSON.stringify({ force_reply: true }) })

});
bot.onText(/\/login/, (msg) => {
    bot.sendMessage(msg.chat.id,
        UserLoginLabel,
        { reply_markup: JSON.stringify({ force_reply: true }) });
});
bot.onText(/Add New Bot/, (msg) => {
    if (!isAuth) {
        // err 503
        bot.sendMessage(msg.chat.id, "ok but\nYou need To Login or Register first", {
            "reply_markup": {
                "keyboard": [["/login"], ["/register"]],
                "one_time_keyboard": true,
            }
        });

    }
    else{
        bot.sendMessage(msg.chat.id,
            addBotName,
            { reply_markup: JSON.stringify({ force_reply: true }) })
    }


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
                CreateUser(tempUsername, tempNum, msg);
            }

        }
        //if user sent username to loging in
        if (msg.reply_to_message.text == UserLoginLabel) {
            tempUsername = msg.text;
            bot.sendMessage(msg.chat.id,
                PassLoginLabel,
                { reply_markup: JSON.stringify({ force_reply: true }) })
        }
        //if user sent pass to loginig in
        if (msg.reply_to_message.text == PassLoginLabel) {


            tempNum = msg.text;
            AuthUser(tempUsername, tempNum, msg);

        }

        //if user sent Auth code to loginig in
        if (msg.reply_to_message.text == AuthTxt) {

            if (msg.text == AuthNumber) {

                Landing(msg);
            }
            else {
                bot.sendMessage(msg.chat.id, 'This is not that code i sent to you!\n', {
                    "reply_markup": {
                        "keyboard": [["Resend The code!"], ['/login']],
                        "one_time_keyboard": true,
                    }
                });
            }

        }


        //if user want to sent new bot name
        if (msg.reply_to_message.text == addBotName) {
            NewBotName = msg.text;


            bot.sendMessage(msg.chat.id,
                addBotKey,
                { reply_markup: JSON.stringify({ force_reply: true }) })
        }
        //if user want to sent new bot key
        if (msg.reply_to_message.text == addBotKey) {
            console.log(NewBotName);
            NewBotKey = msg.text;
            CreatBot(NewBotName, NewBotKey, msg);
        }
    }
    else {
        return;
    }

});

bot.on('callback_query', (msg) => {
    if (msg.data == 'my_bots') {
        ListBots(msg);
    }

})
bot.on('polling_error', (error) => {
    console.log(error);  // => 'EFATAL'
});
