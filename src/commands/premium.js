const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const PremiumCode = require("../schema/premium-code");
const crypto = require('crypto');

module.exports = {
    category: 'Developer',
    data: new SlashCommandBuilder()
        .setName('create-premium-code')
        .setDescription('Creates a premium code'),
    /**
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const code = crypto.randomBytes(20).toString('hex');
        const premiumCode = new PremiumCode({
            code: code
        });
        await premiumCode.save();
        await interaction.reply(`Created premium code: ${code}`);
    }
};