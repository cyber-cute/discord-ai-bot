const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");

module.exports = {
    category: 'General',
    data: new SlashCommandBuilder()
    .setName('copy-face')
    .setDescription("Upload a face and make a another photo with ur face")
    .addStringOption(option => option
        .setName('prompt')
        .setDescription('The prompt')
        .setRequired(true))
    .addAttachmentOption(option => option
        .setName('image')
        .setDescription('The image you want ')
        .setRequired(true)),

    /**
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        try {
            const user = await userSchema.findOne({ discordId: interaction.user.id });

            const image = interaction.options.getAttachment('image');
            const prompt = interaction.options.getString('prompt');

            interaction.deferReply({ ephemeral: true });

            let imageAi = await getChangeFace(image.proxyURL, prompt);

            if (!imageAi) {
                return interaction.editReply("Something went wrong while generating your stuff. Please try again later");
            }

            const embed = new EmbedBuilder()
                .setTitle("Copy Your Face")
                .setDescription("Here is your generated image")
                .setImage(imageAi)
                .setColor("#e676ff");

            await interaction.editReply({ embeds: [embed] });

            user.dailyImageLimit--;
            await user.save();
        } catch (error) {
            await interaction.editReply("An error occurred while generating your stuff. Please try again later.");
        }
    }
};

async function getChangeFace(imageUrl, prompt) {
    let startResponse = await axios.post("https://api.replicate.com/v1/predictions", {
      version:
        "ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4",
      input: { input_image: imageUrl, prompt: prompt },
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_TOKEN,
      },
    });
  
    let endpointUrl = startResponse.data.urls.get;

    let restoredImage;
    while (!restoredImage) {
      let finalResponse = await axios.get(endpointUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + process.env.REPLICATE_TOKEN,
        },
      });
      let result = finalResponse.data;
      console.log(result)
      if (result.status === "succeeded") {
        restoredImage = result.output;
      } else if (result.status === "failed") {
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
    console.log(restoredImage)
    return restoredImage;
}