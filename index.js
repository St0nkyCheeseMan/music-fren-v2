const Discord = require("discord.js");
const Config = require("./config");
const myIntents = new Discord.Intents();
myIntents.add(Discord.Intents.FLAGS.GUILD_MESSAGES);
const Bot = new Discord.Client({intents: myIntents});


const fs = require('fs');

async function fetchAll(channel){
    let collection = new Discord.Collection();
    let options = {};
    //channel.send("Starting compilation process");
    let lastId = await channel.messages.fetch({limit : 1}).id;
    while(true){
        options.before = lastId;
        let messages = await channel.messages.fetch(options);
        collection = collection.concat(messages);
        if(!messages.last()){
            break;
        }
        lastId = messages.last().id;
    }
    return collection;
}

Bot.once("ready", async () => {
    console.log("This bot is online!"); //standard protocol when starting up the bot
    Bot.user.setPresence({ activities: [{ name: 'music videos', type:'WATCHING' }], status: 'online' });
    Bot.user.setUsername("Playlist Plus");
    Bot.user.setAvatar("download.png");
    channel = await Bot.channels.fetch("575857030770851847");
    messages = await fetchAll(channel);
    linkmsgs = messages.filter(msg => msg.content.includes('youtu'));
    linkmsgs = linkmsgs.filter(msg => msg.content.includes('https://'));
    rawmsgs = linkmsgs.map(msg => msg.content);
    ytlinks = []
    var re = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
    for(var i = 0; i < rawmsgs.length; i++){
        matches = await rawmsgs[i].match(re);
        try{
            ytlinks.push(matches[0]);
        }
        catch(error){
            //pass
        }
    }
    //console.log(ytlinks);
})

Bot.login(Config.config.token); //logs in using token in config.config (not accessible to you)