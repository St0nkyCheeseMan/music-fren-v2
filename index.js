const Discord = require("discord.js");
const Config = require("./config");
var db = require('quick.db');
const myIntents = new Discord.Intents();
myIntents.add(Discord.Intents.FLAGS.GUILD_MESSAGES);
const Bot = new Discord.Client({intents: myIntents});


const fs = require('fs');


async function init(guild){
    await guild.channels.fetch();
    await Bot.application?.fetch();
    // here we do the shit, look for channel rec and do stuff
}

Bot.once("ready", async () => {
    console.log("This bot is online!"); //standard protocol when starting up the bot
    Bot.user.setPresence({ activities: [{ name: 'music videos', type:'WATCHING' }], status: 'online' });
    Bot.user?.setUsername("music fren");
    
    Bot.guilds.fetch().then(() => {
        Bot.guilds.cache.forEach(async (guild) => {
            console.log(guild.name);
            await init(guild);
        })
    })
    })


Bot.login(Config.config.token); //logs in using token in config.config (not accessible to you)