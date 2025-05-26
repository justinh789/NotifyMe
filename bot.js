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
const recipientPhone = process.env.cell_number; // Format: 'whatsapp:+1234567890'


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

client.on("voiceStateUpdate", (oldState, newState) => {
  try {
    
    console.log(`OldState: ${JSON.stringify(oldState)}`);
    console.log(`NewState: ${JSON.stringify(newState)}`);
    
    console.log(newState.guild.name);
    console.log(oldState.guild.name);
    
    if (newState.channel && newState.channel.members) {
      const connectedUsers = [newState.guild.name];
      
      newState.channel.members.forEach((member) => {
        connectedUsers.push(member.user.username);
      });

      if (connectedUsers) {
        sendWhatsAppMessage(`${GetAllUserNames(connectedUsers)}`,  connectedUsers.at(0), connectedUsers.at(0)).then(r => {});
      }
    }

    if (oldState.channel && oldState.channel.members) {
      // User left (or moved). Not currently keeping track of separate voice channel names.
      const connectedUsers = [oldState.guild.name];
      oldState.channel.members.forEach((member) => {
        connectedUsers.push(member.user.username);
      });
      if (connectedUsers) {
        sendWhatsAppMessage(`${GetAllUserNames(connectedUsers)}`,  connectedUsers.at(0), connectedUsers.at(0)).then(r => {});
      }
    }
  } catch (err) {
    console.log(err);
  }
});

function GetAllUserNames(connectedUsers) {
  // first element is Server name. Rest are users.
  let names = "";
  for (let i = 1; i < connectedUsers.length; i++) {
    names += connectedUsers[i] + " ";
  }
  if (names.trim() === "") {
    return "None";
  }
  return names;
}


async function sendWhatsAppMessage(users, channelName, server) {
  console.log(`Users: ${users}`);
  console.log(`Channel Name: ${channelName}`);
  console.log(`Server:  ${server}`);

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

