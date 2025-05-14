require("colors");

const { EmbedBuilder } = require("discord.js");
const { developersId, testServerId } = require("../../config.json");
const mConfig = require("../../messageConfig.json");
const getButtons = require("../../utils/getButtons");

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;
  const buttons = getButtons();

  const buttonObject = buttons.find(
    (btn) => btn.customId === interaction.customId
  );
  if (!buttonObject) return;

  const createEmbed = (color, description) =>
    new EmbedBuilder().setColor(color).setDescription(description);

  if (buttonObject.devOnly && !developersId.includes(interaction.member.id)) {
    const rEmbed = createEmbed(mConfig.embedColorError, mConfig.commandDevOnly);
    return interaction.reply({ embeds: [rEmbed], ephemeral: true });
  }

  if (buttonObject.testMode && interaction.guild.id !== testServerId) {
    const rEmbed = createEmbed(
      mConfig.embedColorError,
      mConfig.commandTestMode
    );
    return interaction.reply({ embeds: [rEmbed], ephemeral: true });
  }

  for (const permission of buttonObject.userPermissions || []) {
    if (!interaction.member.permissions.has(permission)) {
      const rEmbed = createEmbed(
        mConfig.embedColorError,
        mConfig.userNoPermissions
      );
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }
  }

  if (interaction.message.interaction) {
    if (interaction.message.interaction.user.id !== interaction.user.id) {
      const rEmbed = createEmbed(
        mConfig.embedColorError,
        mConfig.cannotUseButton
      );
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }
  }

  const bot = interaction.guild.members.me;
  for (const permission of buttonObject.botPermissions || []) {
    if (!bot.permissions.has(permission)) {
      const rEmbed = createEmbed(
        mConfig.embedColorError,
        mConfig.botNoPermissions
      );
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }

    try {
      await buttonObject.run(client, interaction);
    } catch (error) {
      console.log(
        `[ERROR] An error occured inside the command validator:\n ${error}`.red
      );
    }
  }
};
