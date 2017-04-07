"use strict";
const Discord = require('discord.js');
const client = new Discord.Client();


const ytdl = require('ytdl-core');					
const streamOptions = { seek: 0, volume: 1 };

var fs = require('fs');

var opus = require('node-opus');
 
// Create the encoder. 
// Specify 48kHz sampling rate and 10ms frame size. 
// NOTE: The decoder must use the same values when decoding the packets. 
var rate = 48000;
var encoder = new opus.OpusEncoder( rate );
 
// Encode and decode. 
var frame_size = rate/100;
//var encoded = encoder.encode( buffer, frame_size );
//var decoded = encoder.decode( encoded, frame_size );
 
// or create streams 
var channels = 2;
var opusEncodeStream = new opus.Encoder(rate, channels, frame_size);
var opusDecodeStream = new opus.Decoder(rate, channels, frame_size);
// see examples folder for a more complete example 


var token = "MjMwODE4Mjc5Nzg1MTAzMzYx.C71EJA.rZI_RHYY8FbLd0SM3uMLz6QeV5k";
var lastMessage;
var voiceConnection;
var voiceReceiver;
var joined = false;
var jesus;
var nowPlaying;
var volume = 0.5;
var ytLink;
var ytQueue = [];
var ytQTitles = [];
var ytQAuthors = [];
var lastVolMsg;

var pokemonProfiles = [[]];

client.login(token, output);





function output(error, token) {
    if (error) {
        console.log('There was an error logging in: ' + error);
        return;
    } else
        console.log('Logged in. ');
}


client.on("ready", function() {
    client.fetchUser("170247863568302080").then(user => {
        jesus = user;
    });
});


//Read message
client.on("message", function(msg) {
    var channel = msg.channel;
    //#music
    if (channel.name === "music" && msg.content.substring(0, 18) !== "http://www.youtube") {
        msg.delete();
        msg.author.sendMessage("#music is exclusive to music links only. If the link you sent is a music but you still got this message, please contact Jesus.");
    }
    if (msg.content.substring(0, 3) === "!bb") { //!msg.author.bot && 

        if (msg.content === "!bb help" || msg.content === "!bb") {
            msg.author.sendMessage(
            "**Testing bot by Jesus, current features:** \n"+
            "```!bb help - shows this message \n"+
            "!bb join - adds BB to voice chat \n"+
            "!bb leave - removes BB from voice chat \n"+
            "!bb roll <number> - rolls a number between 1 and a given number (default 100) \n ```"+
            "**Youtube Commands:** \n"+
            "```!bb play <youtube link> - adds a youtube link to the queue \n"+
            "!bb volume - shows the current volume \n"+
            "!bb queue - shows the audio queue \n"+
            "!bb nowPlaying - shows the link of the current audio \n"+
            "!bb next - plays the next audio in queue\n"+
            "!bb increase <volume> - increases the volume by a percentage value (max 100%, default 10%)\n"+
            "!bb decrease <volume> - lower the volume by a percentage value (max 100%, default 10%)\n"+
            "!bb setVolume <volume> - sets the volume to a percentage value (max 100%)```\n"+
            "**Audio Memes:** \n"+
            "```!bb heh \n"+
            "!bb victory \n"+
            "!bb cuckerino \n"+
            "!bb esbetaculo \n"+
            "!bb badumtss``` \n"+
            "**Auto-deletes non-youtube messages on #music**"
            );
        }

        if (msg.content === "!bb join" && !joined) {
            if(lastVolMsg === undefined)
                lastVolMsg = msg.id;
            var voiceChannel;
            joined = true;
            var channels = client.channels.array();

            for (var i = 0; i < channels.length; i++)
                if (channels[i].name === "General #1") {
                    voiceChannel = channels[i];
                    voiceChannel.join().then(connection => {
                        voiceConnection = connection;
                        voiceReceiver = connection.createReceiver();
                        
                    });

                }

        }

        if (msg.content === "!bb leave") {
            var volume = 0.5;
            ytLink = "";
            ytQueue = [];
            ytQTitles = [];
            ytQAuthors = [];
            joined = false;
            nowPlaying = undefined;
            voiceReceiver.destroy();
            voiceConnection.disconnect();
            client.user.setGame();
        }

        if (msg.content.substring(0, 8) === "!bb play" && voiceConnection !== undefined){
            try{
            if(!msg.author.bot){
                var youtubeLink = msg.content.split(" ")[2];
            
            
            ytQAuthors.push(msg.author.username);
            ytQueue.push(youtubeLink);
            ytdl.getInfo(youtubeLink, function (err2, info){
                        ytQTitles.push(info.title);           
                    });
            if(ytQueue.length === 1){
                    const stream = ytdl(youtubeLink, {filter : 'audioonly'});
                    const dispatcher = voiceConnection.playStream(stream, streamOptions);
                    nowPlaying = dispatcher;
                    nowPlaying.setVolume(volume);
                    nowPlaying.on("start", function(){
                        ytLink = youtubeLink;
                        client.user.setGame("'" + ytQTitles[0] + "' picked by " + ytQAuthors[0]);           //"video added to queue"
                    });
                
                    
                   nowPlaying.on("end", function (once){
                        msg.channel.sendMessage("!bb play update");
                });
            }
            }else{ //bot sent message
               
                ytQueue.shift();
                ytQAuthors.shift();
                ytQTitles.shift();
                if(ytQueue.length > 0){
                   
                const stream = ytdl(ytQueue[0], {filter : 'audioonly'});
                const dispatcher = voiceConnection.playStream(stream, streamOptions);
                    nowPlaying = dispatcher;
                    nowPlaying.setVolume(volume);
                    nowPlaying.on("start", function(){
                        ytdl.getInfo(ytQueue[0], function (err2, info){
                        ytLink = ytQueue[0];
                        client.user.setGame("'" + info.title + "' picked by " + ytQAuthors[0]);           //"video added to queue"
                    });
                });
                    
                   nowPlaying.on("end", function (once){
                        msg.channel.sendMessage("!bb play update");
                });
                }else{  
                            client.user.setGame();
                            ytLink = "www.youtube.com";
                        
                }
            }



                
            }catch(err){ 
                msg.author.sendMessage("**The following link you tried to play is invalid:** ```" + youtubeLink + "```");
                ytQueue.pop();
                ytQAuthors.pop();
        }
        }
        

        if (msg.content === "!bb next" && nowPlaying !== undefined)
            nowPlaying.end();

        if (msg.content === "!bb pause" && nowPlaying !== undefined)
            nowPlaying.pause();

        if (msg.content === "!bb resume" && nowPlaying !== undefined)
            nowPlaying.resume();

        if (msg.content === "!bb queue" && nowPlaying !== undefined){
            if(ytQueue.length !== 0){
            var message = "```";
           
            for(var i = 0; i < ytQueue.length; i++){
                
                message = message + ytQTitles[i] + " - picked by " + ytQAuthors[i] + "\n";
                
            }
            message = message + "```";
            msg.author.sendMessage(
            "**Current audio queue:** \n"+ message);}
            else
                msg.author.sendMessage("**Audio queue is currently empty**");
        }
            





        if (msg.content.substring(0, 12) === "!bb decrease" && nowPlaying !== undefined){
            var volValue = parseInt(msg.content.split(" ")[2]);
            if(typeof volValue === "number" && !isNaN(volValue))
                volume = volume - volValue*0.02;
            else
                volume = volume - 0.2;
            updateVolume(volume, channel);
        }

        if (msg.content.substring(0, 12) === "!bb increase" && nowPlaying !== undefined){
            var volValue = parseInt(msg.content.split(" ")[2]);
            if(typeof volValue === "number" && !isNaN(volValue))
                volume = volume + volValue*0.02;
            else
                volume = volume + 0.2;
            updateVolume(volume, channel);
        }

        if (msg.content.substring(0, 13) === "!bb setVolume" && nowPlaying !== undefined){
            var volValue = parseInt(msg.content.split(" ")[2]);
            if(typeof volValue === "number" && !isNaN(volValue))
                volume = volValue*0.02;
            updateVolume(volume, channel); 
        }

        if (msg.content == "!bb volume")
            updateVolume(volume, channel);

        if (msg.content == "!bb nowPlaying" && nowPlaying !== undefined)
            msg.author.sendMessage("**Now playing: **" + ytLink );



        //#Jesus specific commands
        if (msg.author === jesus) {
            if (msg.content === "!bb close") {
                var messages = channel.messages.array();
                messages[messages.length - 1].delete();
                client.destroy();
            }
        }                                                                  

       
        

        if (msg.content === "!bb heh" && client.voiceConnections.array().length !== 0) {
            voiceConnection.playFile('heh.wav').setVolume(volume);
        }

        if (msg.content === "!bb victory" && client.voiceConnections.array().length !== 0) {
            voiceConnection.playFile('victory.wav').setVolume(volume);;
        }


        if (msg.content === "!bb cuckerino" && client.voiceConnections.array().length !== 0) {
            voiceConnection.playFile('cuckerino.mp3').setVolume(volume);;
        }

        if (msg.content === "!bb badumtss" && client.voiceConnections.array().length !== 0) {
            voiceConnection.playFile('badumtss.mp3').setVolume(volume);;
        }

        if (msg.content === "!bb esbetaculo" && client.voiceConnections.array().length !== 0) {
            voiceConnection.playFile('esbetaculo.wav').setVolume(volume);;
        }


        if (msg.content === "!bb register"){
            fs.writeFile("database.txt", msg.author.user.id + ":" + password, function (){});
        }

        if (msg.content.substring(0,8) === "!bb roll"){
            var max = msg.content.split(" ")[2];
            if(typeof max === "undefined")
                max = 100;
            else
                max = parseInt(max);
            var result = Math.floor(Math.random()*max)+1;
            channel.sendMessage("**" + msg.author.username + "** rolled " + result + "/" + max + "!");

        }

        


        var messages = channel.messages.array();
        messages[messages.length - 1].delete();
    }
});


function updateVolume(volume, channel){
    nowPlaying.setVolume(volume);
    channel.sendMessage("**Current volume at: **" + Math.floor(volume*50) + "%").then(message => lastVolMsg = message.id);
    channel.fetchMessage(lastVolMsg).delete();
}

function memberOfArray(member, array){
    result = false;
    for(x of array)
        if(x === member)
            result = true;
    return result;
}