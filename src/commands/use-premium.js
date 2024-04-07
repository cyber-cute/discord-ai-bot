const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const { userSchema } = require("../schema/user");
const PremiumCode = require("../schema/premium-code");

module.exports = {
    category: 'General',
    data: new SlashCommandBuilder()
        .setName('use-premium-code')
        .setDescription('Use a premium code to become a premium user')
        .addStringOption(option => option
            .setName('code')
            .setDescription('The premium code to use')
            .setRequired(true)
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const code = interaction.options.getString('code');
        const premiumCode = await PremiumCode.findOne({ code: code });

        if (premiumCode && !premiumCode.used) {
            const user = interaction.user;
            await userSchema.findOneAndUpdate({ discordId: user.id }, { premium: true, dailyImageLimit: 10 });
            await PremiumCode.findOneAndUpdate({ code: code }, { used: true, userId: user.id });
            await interaction.reply('You are now a premium user!');
        } else {
            await interaction.reply('Invalid or already used premium code.');
        }
    }
};