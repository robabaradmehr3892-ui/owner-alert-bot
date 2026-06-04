```javascript
const TelegramBot = require("node-telegram-bot-api");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const API_KEY = process.env.BSCSCAN_API_KEY;

const CONTRACT_ADDRESS =
  "0x6bD7671Ec2B11Dc32F204641d67084977E5C81f9".toLowerCase();

const METHOD_ID = "0x2bad96ba";

const bot = new TelegramBot(BOT_TOKEN);

let lastBlock = 0;
let checking = false;
const notifiedTxs = new Set();

async function checkOwners() {
  if (checking) return;

  checking = true;

  try {
    const url =
      `https://api.bscscan.com/api` +
      `?module=account` +
      `&action=txlist` +
      `&address=${CONTRACT_ADDRESS}` +
      `&startblock=${lastBlock}` +
      `&endblock=99999999` +
      `&sort=asc` +
      `&apikey=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.result || !Array.isArray(data.result)) {
      checking = false;
      return;
    }

    for (const tx of data.result) {
      const blockNumber = Number(tx.blockNumber);

      if (blockNumber > lastBlock) {
        lastBlock = blockNumber;
      }

      if (!tx.input) continue;
      if (!tx.input.startsWith(METHOD_ID)) continue;
      if (notifiedTxs.has(tx.hash)) continue;

      notifiedTxs.add(tx.hash);

      const ownerAddress = tx.from;

      let uplineAddress = "Unknown";

      if (tx.input.length >= 74) {
        uplineAddress = "0x" + tx.input.slice(34, 74);
      }

      const message =
`🚨 NEW OWNER DETECTED

👤 Owner:
${ownerAddress}

⬆️ Upline:
${uplineAddress}

📦 Block:
${tx.blockNumber}

🔗 TX:
https://bscscan.com/tx/${tx.hash}

⏰ Time:
${new Date().toLocaleString()}`;

      await bot.sendMessage(CHAT_ID, message);
    }
  } catch (error) {
    console.error(error);
  }

  checking = false;
}

console.log("Owner Alert Bot Started");

bot.sendMessage(
  CHAT_ID,
  "✅ Owner Alert Bot Started Successfully"
);

checkOwners();

setInterval(checkOwners, 2000);
```
