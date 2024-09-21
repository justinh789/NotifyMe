import { Client, GatewayIntentBits, NewsChannel } from "discord.js";
import "dotenv/config";

console.log("Starting...");

const token = process.env.discord_token;
const apikey = process.env.call_me_bot_api_key;
const phoneNumber = process.env.cell_number;
const accessToken = process.env.facebook_access_token;

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

/* Things to resolve: 

- if there is a state change for reason of a mic mute/unmute or camera turn on/off or sharing screen/application on/off then need to NOT send whats app

*/

client.on("voiceStateUpdate", (oldState, newState) => {
  try {
    if (newState.channel && newState.channel.members) {
      const connectedUsers = [newState.guild.name];
      newState.channel.members.forEach((member) => {
        connectedUsers.push(member.user.username);
      });

      if (connectedUsers) {
        QueueWhatsAppMessageViaGraphFb(GetAllUserNames(connectedUsers));
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
        QueueWhatsAppMessageViaGraphFb(GetAllUserNames(connectedUsers));

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

function QueueWhatsAppMessageViaGraphFb(msg) {
  try {
    let graphFromPhoneNumber = process.env.graph_from_phone_number;

    const timeStamp = new Date().toTimeString();
    console.log(
      `${timeStamp} | Queueing WhatsApp message to send (via GraphFb): ${msg}`
    );
    console.log("about to send fb msg" + msg);
    fetch(`https://graph.facebook.com/v19.0/${graphFromPhoneNumber}/messages`, {
      headers: [
        { Authorization: `Bearer ${accessToken}` },
        { "Content-Type": "application/json" },
      ],
      method: "POST",
      body: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "text",
        text: {
          preview_url: false,
          body: msg,
        },
      },
    });
  } catch (err) {
    console.log(err);
  }
}
import { Client, GatewayIntentBits, NewsChannel } from "discord.js";
import "dotenv/config";

console.log("Starting...");

const token = process.env.discord_token;
const apikey = process.env.call_me_bot_api_key;
const phoneNumber = process.env.cell_number;
const accessToken = process.env.facebook_access_token;

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
        QueueWhatsAppMessageViaGraphFb(GetAllUserNames(connectedUsers));
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
        QueueWhatsAppMessageViaGraphFb(GetAllUserNames(connectedUsers));

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

function QueueWhatsAppMessageViaGraphFb(msg) {
  try {
    let graphFromPhoneNumber = process.env.graph_from_phone_number;

    const timeStamp = new Date().toTimeString();
    console.log(
      `${timeStamp} | Queueing WhatsApp message to send (via GraphFb): ${msg}`
    );

    fetch(`https://graph.facebook.com/v19.0/${graphFromPhoneNumber}/messages`, {
      headers: [
        { Authorization: `Bearer ${accessToken}` },
        { "Content-Type": "application/json" },
      ],
      method: "POST",
      body: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "text",
        text: {
          preview_url: false,
          body: msg,
        },
      },
    });
  } catch (err) {
    console.log(err);
  }
}
