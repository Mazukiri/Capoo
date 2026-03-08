require('dotenv').config();
const { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');
const gifs = require('./gifs.json');

const app = express();
const port = process.env.PORT || 3000;

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

// Tạo danh sách các emoji từ file gifs.json để làm gợi ý cho Menu (Discord giới hạn tối đa 25 gợi ý do giới hạn của 1 command option)
const gifChoices = Object.keys(gifs).slice(0, 25).map(key => ({
    name: key,
    value: key
}));

const commands = [
    new SlashCommandBuilder()
        .setName('capoo')
        .setDescription('Gửi một chiếc Capoo siêu dễ thương!')
        .addStringOption(option => 
            option.setName('loai')
                .setDescription('Chọn loại Capoo bạn muốn gửi')
                .setRequired(true)
                .addChoices(...gifChoices)
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
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'capoo') {
        const loai = interaction.options.getString('loai');
        const gifUrl = gifs[loai];

        if (gifUrl) {
            // Thay vì bot gửi, chúng ta có thể dùng Webhook để giả danh người dùng giống y chang emoji
            try {
                const webhooks = await interaction.channel.fetchWebhooks();
                let webhook = webhooks.find(wh => wh.token);

                if (!webhook) {
                    webhook = await interaction.channel.createWebhook({
                        name: 'Capoo Webhook',
                        avatar: client.user.displayAvatarURL(),
                    });
                }

                await webhook.send({
                    content: gifUrl,
                    username: interaction.member?.displayName || interaction.user.username,
                    avatarURL: interaction.user.displayAvatarURL({ dynamic: true })
                });

                // Báo cho bot biết là đã xử lý xong để nó khỏi báo lỗi, sau đó xóa tin nhắn báo cáo đi
                await interaction.reply({ content: 'Đã gửi!', ephemeral: true });
                await interaction.deleteReply();
                
            } catch (error) {
                console.error(error);
                // Nếu lỗi, để bot trả lời bình thường thay vì giả danh
                await interaction.reply({ content: gifUrl });
            }
        } else {
            await interaction.reply({ content: 'Capoo này không tồn tại!', ephemeral: true });
        }
    }
});

// Tính năng 2: Vẫn giữ hỗ trợ tự động thay thế nếu gõ :capoo_love:
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const emojiRegex = /:([a-zA-Z0-9_]+):/g;
    let match;
    let hasReplaced = false;
    let newContent = message.content;

    while ((match = emojiRegex.exec(message.content)) !== null) {
        const emoteName = match[1].toLowerCase();
        if (gifs[emoteName]) {
            newContent = newContent.replace(match[0], gifs[emoteName]);
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

            await webhook.send({
                content: newContent !== "" ? newContent : " ",
                username: message.member?.displayName || message.author.username,
                avatarURL: message.author.displayAvatarURL({ dynamic: true })
            });
            await message.delete();
        } catch (error) {
            await message.channel.send(`**${message.member?.displayName || message.author.username}**:\n${newContent}`);
            try { await message.delete(); } catch(e) {}
        }
    }
});

if (process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN !== 'your_bot_token_here') {
    client.login(process.env.DISCORD_TOKEN);
}
