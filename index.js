require('dotenv').config();
const dns = require('dns');
const originalDnsLookup = dns.lookup;
dns.lookup = function (hostname, options, callback) {
    let cb = callback;
    let opts = options;
    if (typeof options === 'function') {
        cb = options;
        opts = { family: 4 };
    } else if (typeof options === 'object' && options !== null) {
        opts = { ...options, family: 4 };
    } else {
        opts = { family: 4 };
    }
    return originalDnsLookup(hostname, opts, cb);
};

const { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const express = require('express');
const fs = require('fs');

const VERSION = process.env.VERSION || 'v1';
console.log(`Đang dùng version: ${VERSION}`);

const gifs = {};

const pngDir = `./png/${VERSION}`;
if (fs.existsSync(pngDir)) {
    for (const file of fs.readdirSync(pngDir)) {
        if (file.endsWith('.png')) {
            const key = file.replace(/^\d+-/, '').replace('.png', '').toLowerCase();
            gifs[key] = { path: `${pngDir}/${file}`, attachmentName: file };
        }
    }
}

const gifDir = `./gif/${VERSION}`;
if (fs.existsSync(gifDir)) {
    for (const file of fs.readdirSync(gifDir)) {
        if (file.endsWith('.gif')) {
            const key = file.replace(/^\d+-/, '').replace('.gif', '').toLowerCase();
            gifs[key] = { path: `${gifDir}/${file}`, attachmentName: file };
        }
    }
}

console.log(`Đã load ${Object.keys(gifs).length} emoji từ ${VERSION}`);

const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Bot is ALIVE!'));
app.listen(port, () => console.log(`Server is running on port ${port}`));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.on('debug', console.log);
client.on('warn', console.log);
client.on('error', console.error);

console.log("Token check:", process.env.DISCORD_TOKEN ? "CÓ TOKEN, độ dài: " + process.env.DISCORD_TOKEN.length : "KHÔNG CÓ TOKEN");

const commands = [
    new SlashCommandBuilder()
        .setName('capoo')
        .setDescription('Gửi một chiếc Capoo siêu dễ thương!')
        .addStringOption(option =>
            option.setName('loai')
                .setDescription('Gõ tên Capoo để tìm nhanh (nhập một phần tên)')
                .setRequired(true)
                .setAutocomplete(true)
        )
];

// Tránh lỗi khi token chưa có
if (process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN !== 'your_bot_token_here') {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    client.on('ready', async () => {
        console.log(`Đã đăng nhập thành công bot: ${client.user.tag}! Capoo đã sẵn sàng!`);

        try {
            console.log('Đang cập nhật danh sách lệnh (Slash Commands)...');
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands },
            );
            console.log('Cập nhật lệnh thành công! Các bạn đã có thể dùng /capoo');
        } catch (error) {
            console.error('Lỗi khi cập nhật lệnh:', error);
        }
    });
} else {
    console.log("Vui lòng điền biến môi trường DISCORD_TOKEN vào file .env!");
}


// Xử lý khi người dùng dùng Lệnh /capoo
client.on('interactionCreate', async interaction => {
    if (interaction.isAutocomplete()) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = Object.keys(gifs);
        const filtered = choices.filter(choice => choice.includes(focusedValue));
        try {
            await interaction.respond(
                filtered.slice(0, 25).map(choice => ({ name: choice, value: choice }))
            );
        } catch (e) {
            // 10062 = interaction expired, 40060 = already acknowledged (cả hai do rolling deploy overlap)
            if (e.code !== 10062 && e.code !== 40060) console.error(e);
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'capoo') {
        const loai = interaction.options.getString('loai');
        const matchedEmoji = gifs[loai];

        if (matchedEmoji) {
            await interaction.deferReply({ ephemeral: true });
            try {
                const webhooks = await interaction.channel.fetchWebhooks();
                let webhook = webhooks.find(wh => wh.token);

                if (!webhook) {
                    webhook = await interaction.channel.createWebhook({
                        name: 'Capoo Webhook',
                        avatar: client.user.displayAvatarURL(),
                    });
                }

                const file = new AttachmentBuilder(matchedEmoji.path, { name: matchedEmoji.attachmentName });

                await webhook.send({
                    content: " ",
                    files: [file],
                    username: interaction.member?.displayName || interaction.user.username,
                    avatarURL: interaction.user.displayAvatarURL({ dynamic: true })
                });

                // Báo cho bot biết là đã xử lý xong để nó khỏi báo lỗi, sau đó xóa tin nhắn báo cáo đi
                await interaction.editReply({ content: 'Đã gửi!' });
                await interaction.deleteReply();

            } catch (error) {
                console.error(error);
                // Nếu lỗi, để bot trả lời bình thường thay vì giả danh
                const file = new AttachmentBuilder(matchedEmoji.path, { name: matchedEmoji.attachmentName });
                await interaction.editReply({ content: 'Lỗi gửi qua webhook, gửi trực tiếp:', files: [file] });
            }
        } else {
            await interaction.reply({ content: 'Capoo này không tồn tại!', ephemeral: true });
        }
    }
});

// Tính năng 2: Tự động thay thế nếu gõ :capoo_love: HOẶC chọn từ emoji tĩnh của server <:capoo_love:123>
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Regex tìm kiếm các đoạn text như :capoo_love:, hoặc emoji thật của discord dạng <:capoo_love:123456789>
    const emojiRegex = /<(a?):([a-zA-Z0-9_\-]+):(\d+)>|:([a-zA-Z0-9_\-]+):/g;
    let match;
    let hasReplaced = false;
    let newContent = message.content;
    let filesToSend = [];

    while ((match = emojiRegex.exec(message.content)) !== null) {
        // match[2] là tên nếu dùng picker (<:tên:id>), match[4] là tên nếu gõ chay (:tên:)
        const emoteNameRaw = (match[2] || match[4]).toLowerCase();
        const emoteNameClean = emoteNameRaw.replace(/[-_]/g, '');

        let matchedEmoji = gifs[emoteNameRaw];
        if (!matchedEmoji) {
            // Tìm kiếm (Fuzzy find) và bỏ qua gạch ngang/gạch dưới để khỏi bị trượt do Discord chuyển '-' thành '_'
            const possibleKey = Object.keys(gifs).find(key => {
                const cleanKey = key.replace(/[-_]/g, '');
                return cleanKey === emoteNameClean || emoteNameClean.includes(cleanKey) || cleanKey.includes(emoteNameClean);
            });
            if (possibleKey) matchedEmoji = gifs[possibleKey];
        }

        if (matchedEmoji) {
            newContent = newContent.replace(match[0], '');
            filesToSend.push(new AttachmentBuilder(matchedEmoji.path, { name: matchedEmoji.attachmentName }));
            hasReplaced = true;
        }
    }

    if (hasReplaced) {
        try {
            const webhooks = await message.channel.fetchWebhooks();
            let webhook = webhooks.find(wh => wh.token);

            if (!webhook) {
                webhook = await message.channel.createWebhook({
                    name: 'Capoo Webhook',
                    avatar: client.user.displayAvatarURL(),
                });
            }

            const finalContent = newContent.trim() !== "" ? newContent.trim() : " ";
            await webhook.send({
                content: finalContent,
                files: filesToSend,
                username: message.member?.displayName || message.author.username,
                avatarURL: message.author.displayAvatarURL({ dynamic: true })
            });
            await message.delete();
        } catch (error) {
            const finalContent = newContent.trim() !== "" ? newContent.trim() : " ";
            await message.channel.send({ content: `**${message.member?.displayName || message.author.username}**:\n${finalContent}`, files: filesToSend });
            try { await message.delete(); } catch (e) { }
        }
    }
});

if (process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN !== 'your_bot_token_here') {
    client.login(process.env.DISCORD_TOKEN).then(() => {
        console.log("=> LOGIN API THÀNH CÔNG, ĐANG ĐỢI WEBSOCKET GATEWAY KẾT NỐI...");
    }).catch(error => {
        console.error("LỖI KHI ĐĂNG NHẬP BOT:", error);
    });
}
