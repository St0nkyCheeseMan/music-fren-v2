const Discord = require("discord.js");
const Config = require("./config");
const myIntents = new Discord.Intents();
myIntents.add(Discord.Intents.FLAGS.GUILD_MESSAGES);
const Bot = new Discord.Client({intents: myIntents});
const {google} = require('googleapis');
const path = require('path');
const {authenticate} = require('@google-cloud/local-auth');
const youtube = google.youtube('v3');


const fs = require('fs');

async function fetchAll(channel){
    let collection = new Discord.Collection();
    let options = {};
    const finId = parseInt(fs.readFileSync("finid.txt").toString());
    //channel.send("Starting compilation process");
    let lastId = await channel.messages.fetch({limit : 1}).id;
    var numOfNewMessages = 0;
    while(true){
        options.before = lastId;
        let messages = await channel.messages.fetch(options);
        numOfNewMessages += messages.size;
        collection = collection.concat(messages);
        if(!messages.last() || parseInt(lastId) < finId){
            break;
        }
        lastId = messages.last().id;
    }
    channel.messages.fetch({limit:1}).then(msg => {
      fs.writeFile('finid.txt', msg.at(0).id, err => {
        if (err) {
          console.error(err)
          return
        }
      })
    })
    console.log(numOfNewMessages)
    return collection;
}

Bot.once("ready", async () => {
    console.log("This bot is online!"); //standard protocol when starting up the bot
    Bot.user.setPresence({ activities: [{ name: 'music videos', type:'WATCHING' }], status: 'online' });
    const auth = await authenticate({
      keyfilePath: path.join(__dirname, 'auth.json'),
      scopes: ['https://www.googleapis.com/auth/youtube'],
    });
    google.options({auth});
  //  Bot.user.setUsername("Playlist Plus");
  //  Bot.user.setAvatar("download.png");
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
            ytlinks.push(matches[0].slice(-11));
        }
        catch(error){
            //pass
        }
    } 
    console.log(ytlinks)
    //console.log("yo im here now")
    let A = fs.readFileSync('./links.txt').toString().split((/\r?\n/));
    let diff = ytlinks.filter(x => !A.includes(x))

    // Returns a Promise that resolves after "ms" Milliseconds
    const timer = ms => new Promise(res => setTimeout(res, ms))

    async function load () { // We need to wrap the loop into an async function for this to work
      for (var i = 0; i < diff.length; i++) {
        addSong(diff[i]);
        await timer(2000); // then the created Promise can be awaited
      }
    }

    load();

    fs.appendFile('links.txt', diff.join('\n'), err => {
      if (err) {
        console.error(err)
        return
      }
      //file written successfully
    })

})

Bot.login(Config.config.token); //logs in using token in config.config (not accessible to you)

// a very simple example of getting data from a playlist
async function addSong(id) {
  youtube.playlistItems.insert({
    part: 'id,snippet',
    resource: {
        snippet: {
            playlistId:"PLpi_S6FB4f2im56r1qXYzkhNLkP7sGEdm",
            resourceId:{
                videoId:id,
                kind:"youtube#video"
            }
        }
    }
}, function (err, data, response) {
    if (err) 
        console.log(err);
   /* else if (data) {
        lien.end(data);
   */
    if (response) {
        console.log('Status code: ' + response.statusCode);
    }
});
}
