const TelegramBot = require("node-telegram-bot-api");

console.log("Bot Started");

const bot = new TelegramBot(process.env.BOT_TOKEN);

bot.sendMessage(
  process.env.CHAT_ID,
  "✅ Owner Alert Bot Started Successfully"
);

setInterval(() => {
  console.log("Running...");
}, 10000);
