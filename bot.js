import { Client, GatewayIntentBits, NewsChannel } from "discord.js";
import fetch from 'node-fetch';
import "dotenv/config";

console.log("Starting...");

let connectedUsers = [];

const token = process.env.discord_token;
const apikey = process.env.call_me_bot_api_key;
const phoneNumber = process.env.cell_number;

const accessToken = process.env.facebook_access_token; // Get from Meta Developer Console
const phoneNumberId = process.env.facebook_phone_number_id; // Assigned in WhatsApp Business API setup
const recipientPhone = process.env.cell_number;


const client = new Client({
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.Guilds,
  ],
});

client.login(token);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`---------------------------------------`);
});

// TODO: Needs better name 
let ShouldRunLogicOnOldState = true;

client.on("voiceStateUpdate", (oldState, newState) => {
  try {
    
    connectedUsers = [];
    
    if (newState.channel && newState.channel.members) {

      connectedUsers.push(newState.guild.name);
      connectedUsers.push(newState.channel.name);
      
      newState.channel.members.forEach((member) => {
        connectedUsers.push(FormatName(member));
      });

      ShouldRunLogicOnOldState = connectedUsers.length <= 2;
    }
    else{
      // Nothing in new state so everybody has left voice chat. 
      ShouldRunLogicOnOldState = true;
    }

    if(ShouldRunLogicOnOldState){
      
      if (oldState.channel && oldState.channel.members) {
        // User left (or moved).
        connectedUsers.push(oldState.guild.name);
        connectedUsers.push(oldState.channel.name);


        oldState.channel.members.forEach((member) => {
          connectedUsers.push(FormatName(member));
        });
      }
    }

    if (connectedUsers) {
      
      sendWhatsAppMessage(GetAllUserNames(connectedUsers),  GetServerName(connectedUsers), GetVoiceChannelName(connectedUsers)).then(r => {});
    }
    
    
  } catch (err) {
    console.log(err);
  }
});

function GetAllUserNames(connectedUsers) {
  // first element is Server name. Second is voice channel name. Rest are users.
  // Param text cannot have new-line\/tab characters or more than 4 consecutive spaces
  // \r supported for new line (carriage return) on some devices. Works WhatsApp for windows  
  let names = "";
  for (let i = 2; i < connectedUsers.length; i++) {
    names += " \r - " + connectedUsers[i];
  }
  if (names.trim() === "") {
    return "None";
  }
  return names;
}

function GetServerName(connectedUsers) {
  // first element is Server name. Second is voice channel name. Rest are users.
  if(connectedUsers && connectedUsers.length > 0) {
    return connectedUsers[0];
  }
  return "Unknown";
}

function GetVoiceChannelName(connectedUsers) {
  // first element is Server name. Second is voice channel name. Rest are users.
  if(connectedUsers && connectedUsers.length > 0) {
    return connectedUsers[1];
  }
  return "Unknown";
}

function FormatName(member){
  
  let name = member.user.username;
  
  if(member.voice.selfMute){
    name += " (Muted)";
  }
  
  if(member.voice.selfDeaf){
    name += " (SelfDeaf)";
  }
  
  if(member.voice.streaming){
    name += " (Streaming)";
  }
  
  if(member.voice.selfVideo){
    name += " (Video)";
  }
  
  return name;
  
}

async function sendWhatsAppMessage(users, server, channelName) {

  const timeStamp = new Date().toTimeString();
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  const messageData = {
    messaging_product: 'whatsapp',
    to: recipientPhone,
    type: 'template',
    template: { name: "user_connected", 
      language: {
        code : "en_ZA"}, 
      components: [{
          type: "body",
          parameters: [
            {
              type: "text",
              parameter_name: "users",
              text: users
            },
            {
              type: "text",
              parameter_name: "channel_name",
              text: channelName
            }
          ]
      },
        {
          type: "header",
          parameters: [
            {
              text: server,
              type: "text",
              parameter_name: "server",
            }  
          ]
        }] }
  };

  console.log(`Message Data: ${JSON.stringify(messageData)}`);
  
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(messageData)
  });

  const result = await response.json();
  console.log(result);
}

