import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import Command from "../classes/Command"
import { inspect } from "util"

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Eval a javascript command")
        .addStringOption(e => e
            .setRequired(true)
            .setName("code")
            .setDescription("Code to execute")) as SlashCommandBuilder,
    ownerOnly: true,
    async execute(interaction, client) {
        let code = interaction.options.getString("code")
        code = code.replace(/[""]/g, '"').replace(/['']/g, "'");
        let evaled;
        await interaction.deferReply()
        try {
            const start = process.hrtime();
            evaled = eval(code);

            if (evaled instanceof Promise) {
                evaled = await evaled;
            }

            const outputResponse = `\`\`\`${inspect(evaled, { depth: 0 })}\n\`\`\``;

            await interaction.editReply(outputResponse)
        } catch (err: any) {
            await interaction.editReply(`**Error:**\n\`\`\`${err.message}\`\`\``)
        }

    }
})