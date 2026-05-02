require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

const RED = 0xff0000;

const guides = {
  gvg: {
    name: "Guide to Guild War (GvG)",
    url: "https://drive.google.com/file/d/1S1cS09_ogrRkO8P2fQKpoAif1kHPkknx/view",
  },
  gear: {
    name: "Guide to Gear Minmaxing",
    url: "https://drive.google.com/file/d/1nycoob_9tqa4geV1mcN7ktK-NQ0_7YoU/view",
  },
  swordtrial: {
    name: "Lvl 91 Sword Trial Guides",
    urls: [
      "https://youtu.be/2cMzl_y0XLI?si=7I9i35zMm8coiu99",
      "https://www.youtube.com/watch?v=hab1etvhQ2g",
    ],
  },
  guildmanager: {
    name: "Kaze Clan Guild Manager",
    url: "https://gmapp.me/kaze-clan",
  },
  calendar: {
    name: "Kaze Clan Weekly Calendar",
    url: "https://cdn.discordapp.com/attachments/1379823827806060704/1496676061000241172/Elegance_Weekly_Calendar.png?ex=69f69d33&is=69f54bb3&hm=6cc3b41bc99ff931f477de295dd74c358a9389b090280861cc92b92e2bd32dda&",
  },
};

const commands = [
  new SlashCommandBuilder()
    .setName("guides")
    .setDescription("Summon Kaze Clan guides and resources.")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("gearcheck")
    .setDescription("Check if you are ready to step onto the battlefield.")
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {
 await rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: commands }
);
  console.log("Slash commands deployed.");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", () => {
  console.log(`The Kaze Clan bot has awakened as ${client.user.tag}`);
});

function kazeEmbed(title, description) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(RED)
    .setFooter({ text: "Kaze Clan • Train hard, fight smart, win clean" });
}

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === "guides") {
    const menu = new StringSelectMenuBuilder()
      .setCustomId("guide_select")
      .setPlaceholder("Choose your scroll, warrior")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Guide to Guild War (GvG)")
          .setDescription("Battle doctrine for the clan")
          .setValue("gvg"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Guide to Gear Minmaxing")
          .setDescription("Sharpen your build before battle")
          .setValue("gear"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Lvl 91 Sword Trial Guides")
          .setDescription("Study the blade. Clear the trial.")
          .setValue("swordtrial"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Kaze Clan Guild Manager")
          .setDescription("Open the clan command board")
          .setValue("guildmanager"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Kaze Clan Weekly Calendar")
          .setDescription("See this week's clan schedule")
          .setValue("calendar")
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [
        kazeEmbed(
          "📜 Kaze Clan Scroll Archive",
          "Welcome, warrior. Choose the resource you need, and I’ll place it before the squad."
        ),
      ],
      components: [row],
      ephemeral: true,
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === "guide_select") {
    const key = interaction.values[0];
    const selected = guides[key];

    if (key === "calendar") {
      const embed = new EmbedBuilder()
        .setTitle("📅 Kaze Clan Weekly Calendar")
        .setDescription("Here is the weekly formation schedule. Be on time, stay ready, and move as one.")
        .setImage(selected.url)
        .setColor(RED)
        .setFooter({ text: "Kaze Clan • Discipline over ego" });

      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (selected.urls) {
      await interaction.reply({
        embeds: [
          kazeEmbed(
            `⚔️ ${selected.name}`,
            [
              "Study these before entering the trial. A prepared warrior wastes fewer revives.",
              "",
              selected.urls.join("\n"),
            ].join("\n")
          ),
        ],
      });
      return;
    }

    await interaction.reply({
      embeds: [
        kazeEmbed(
          `📘 ${selected.name}`,
          [
            "Here you go, warrior. Use this well:",
            "",
            selected.url,
          ].join("\n")
        ),
      ],
    });
  }

  if (interaction.isChatInputCommand() && interaction.commandName === "gearcheck") {
    const embed = kazeEmbed(
      "🛡️ Kaze Clan Gear Readiness Check",
      [
        "Before you step through the Senkaimon and into Guild War, confirm your setup:",
        "",
        "✅ Mystic Skills are Level 6",
        "✅ Inner Ways are fully leveled",
        "✅ Attunements are aligned to your build",
        "✅ Talent Tree is optimized",
        "✅ Gear has been reviewed and tuned",
        "✅ Buffs are ready",
        "",
        "**Remember:** raw power is useful, but discipline wins wars.",
      ].join("\n")
    );

    const readyButton = new ButtonBuilder()
      .setCustomId("gear_ready")
      .setLabel("I am battle-ready")
      .setStyle(ButtonStyle.Success);

    const notReadyButton = new ButtonBuilder()
      .setCustomId("gear_not_ready")
      .setLabel("I need guidance")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(readyButton, notReadyButton);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  }

  if (interaction.isButton() && interaction.customId === "gear_ready") {
    await interaction.reply({
      embeds: [
        kazeEmbed(
          "✅ Warrior Confirmed",
          `${interaction.user} is battle-ready. Stay sharp, stay grouped, and protect the clan.`
        ),
      ],
    });
  }

  if (interaction.isButton() && interaction.customId === "gear_not_ready") {
    await interaction.reply({
      embeds: [
        kazeEmbed(
          "🧭 Guidance Requested",
          [
            `${interaction.user} has requested gear guidance. No shame in preparation — every captain started as a student.`,
            "",
            "**Start with the Gear Guide:**",
            guides.gear.url,
            "",
            "**Then study the Lvl 91 Sword Trial guides:**",
            ...guides.swordtrial.urls,
            "",
            "**Update/check your profile here:**",
            guides.guildmanager.url,
          ].join("\n")
        ),
      ],
    });
  }
});

deployCommands()
  .then(() => client.login(process.env.DISCORD_TOKEN))
  .catch(console.error);
