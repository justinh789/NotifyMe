import { Client, GatewayIntentBits, NewsChannel } from "discord.js";
import "dotenv/config";

console.log("Starting...");

const token = process.env.discord_token;
const apikey = process.env.call_me_bot_api_key;
const phoneNumber = process.env.cell_number;
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
});

client.on("voiceStateUpdate", (oldState, newState) => {
  try {
    if (newState.channel && newState.channel.members) {
      const connectedUsers = [newState.guild.name];
      newState.channel.members.forEach((member) => {
        connectedUsers.push(member.user.username);
      });

      if (connectedUsers) {
        QueueWhatsAppMessage(
          `User connected to ${connectedUsers.at(
            0
          )} | Connected : ${GetAllUserNames(connectedUsers)}`
        );
      }
    }

    if (oldState.channel && oldState.channel.members) {
      // User left (or moved). Not currently keeping track of separate voice channel names.
      const connectedUsers = [oldState.guild.name];
      oldState.channel.members.forEach((member) => {
        connectedUsers.push(member.user.username);
      });
      if (connectedUsers) {
        QueueWhatsAppMessage(
          `User disconnected to ${connectedUsers.at(
            0
          )} | Connected: ${GetAllUserNames(connectedUsers)}`
        );
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

function QueueWhatsAppMessage(msg) {
  try {
    const timeStamp = new Date().toTimeString();
    console.log(`${timeStamp} | Queueing WhatsApp message to send: ${msg}`);
    const encodedMessage = encodeURIComponent(msg);

    fetch(
      `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encodedMessage}&apikey=${apikey}`
    )
      .then((result) => {
        // console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (err) {
    console.log(err);
  }
}
