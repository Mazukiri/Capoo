# Bugcat Capoo Discord Bot 🐾

A powerful and lightweight Discord bot that allows users **without Discord Nitro** to send animated emojis (GIFs) seamlessly. By utilizing webhooks, the bot intercepts static emoji triggers and replaces them with high-quality animated GIFs, creating a native Nitro-like experience.

This project is specifically tailored for **Bugcat Capoo** lovers!

## ✨ Features

- **Auto-Animated Emoji Upgrade:** Send a static emoji (e.g., `<:capoo_love:1234>`) and the bot will instantly replace your message with a webhook containing the animated GIF version.
- **Fuzzy Matching Name Recognition:** Don't worry about exact filenames. If your uploaded emoji is named `:1568bugcat94:`, the bot is smart enough to match it with `bugcat94`.
- **Slash Commands Available:** Use `/capoo` to browse a limited list of Capoo emojis directly from the Discord command menu.
- **Ultra-Fast Connectivity:** Hardcoded with custom Node.js DNS hooks and backwards-compatible dependencies to bypass restrictive IPv6 environments (like Render's Free Tier) and maintain a stable 24/7 WebSocket connection.

---

## 🚀 Setup & Installation (Without Nitro Trick)

To get the full "Nitro" experience without actually having Nitro, follow this exact workflow:

### 1. Prepare The Emojis
1. Clone this repository.
2. Inside the `/png` folder (or your own custom folder), gather static versions of the emojis you want to use (`.png` format).
3. Open your Discord Server Settings ➔ **Emoji** ➔ Upload the static `.png` files.
   > **Note:** Because they are static images, Discord will allow non-Nitro users to use them freely in the server.

### 2. Configure the Bot (`gifs.json`)
Open `gifs.json` and map the names of your uploaded emojis to their actual animated GIF URLs.
```json
{
  "capoo_love": "https://media.tenor.com/.../capoo-love.gif",
  "bugcat94": "https://cdn3.emoji.gg/.../bugcat94.gif"
}
```

### 3. Create the Discord Application
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a new App and grab the **Bot Token**.
3. Go to **OAuth2 ➔ URL Generator**.
4. Select the `bot` and `applications.commands` scopes.
5. Give it `Administrator` permissions (required for managing Messages and Webhooks).
6. Invite the bot to your server.

---

## ☁️ Deployment (24/7 Hosting on Koyeb)

This bot is heavily optimized to run on **Koyeb's Free Tier**, as Render's current free tier aggressively blocks IPv6 WebSocket connections.

1. Create an account on [Koyeb.com](https://app.koyeb.com/).
2. Click **Create Web Service** and authorize Koyeb to access this GitHub repository.
3. Configure the deployment:
   - **Builder:** `Buildpack`
   - **Instance Type:** `Eco / Free`
   - **Environment Variables:**
     - `DISCORD_TOKEN` = `Your_Bot_Token_Here`
     - `PORT` = `10000`
4. Expand the **Advanced / Network** settings:
   - Change the exposed port from `8000` to `10000`.
   - Change the **Health Check** port from `8000` to `10000`.
5. Click **Deploy**.

Within seconds, the bot will bypass all DNS restrictions, connect safely via IPv4, and announce its readiness in the Koyeb logs:
`=> Đã đăng nhập thành công bot: Capoo#xxxx! Capoo đã sẵn sàng!`

---

## 🛠️ Built With

- **Node.js 20 LTS**
- **Discord.js v14.11.0** (Downgraded deliberately to avoid undici IPv6 issues)
- **Express.js** (Used as a dummy webserver to satisfy cloud provider health checks)

## 📝 License

This project is created for educational and entertainment purposes. Bugcat Capoo character designs and artwork belong to their respective original creators (Yara).
