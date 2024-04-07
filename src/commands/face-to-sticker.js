const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const { userSchema } = require("../schema/user");
module.exports = {
    category: 'General',
    data: new SlashCommandBuilder()
    .setName('face-to-sticker')
    .setDescription("Upload a face image and get a sticker of it")
    .addStringOption(option => option
        .setName('prompt')
        .setDescription('The prompt to generate the sticker')
        .setRequired(true))
    .addAttachmentOption(option => option
        .setName('image')
        .setDescription('The image you want to convert to a sticker')
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

            let imageAi = await getFaceToSticker(image.proxyURL, prompt);

            if (!restoredImage) {
                return interaction.editReply("Something went wrong while generating your sticker. Please try again later.");
            }

            const embed = new EmbedBuilder()
                .setTitle("Face to Sticker")
                .setDescription("Here is your generated sticker!")
                .setImage(imageAi)
                .setColor("#e676ff");

            await interaction.editReply({ embeds: [embed] });

            user.dailyImageLimit--;
            await user.save();
        } catch (error) {
            await interaction.editReply("An error occurred while generating your sticker. Please try again later.");
        }
    }
};

async function getFaceToSticker(imageUrl, prompt) {
    let startResponse = await axios.post("https://api.replicate.com/v1/predictions", {
      version:
        "764d4827ea159608a07cdde8ddf1c6000019627515eb02b6b449695fd547e5ef",
      input: { image: imageUrl, prompt: prompt },
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
        restoredImage = result.output[0];
      } else if (result.status === "failed") {
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
    console.log(restoredImage)
    return restoredImage;
}