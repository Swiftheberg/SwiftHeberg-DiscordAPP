const { model, Schema } = require("mongoose");

let moderationSchema = new Schema(
  {
    GuildId: String,
    LogChannelId: String,
  },
  { strict: false }
);

module.exports = model("moderation", moderationSchema);
