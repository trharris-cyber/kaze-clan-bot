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

function channelLink(channelId) {
  return `https://discord.com/channels/${process.env.GUILD_ID}/${channelId}`;
}

function kazeEmbed(title, description) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(RED)
    .setFooter({ text: "Kaze Clan • Train hard, fight smart, win clean" });
}

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

  new SlashCommandBuilder()
    .setName("support")
    .setDescription("Get help navigating the Kaze Clan server.")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("eventinfo")
    .setDescription("View upcoming events and the weekly schedule.")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("quicklinks")
    .setDescription("Open the Kaze Clan interactive navigation hub.")
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );

  console.log("Slash commands deployed.");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("clientReady", () => {
  console.log(`The Kaze Clan bot has awakened as ${client.user.tag}`);
});

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
          ["Here you go, warrior. Use this well:", "", selected.url].join("\n")
        ),
      ],
    });
  }

  if (interaction.isChatInputCommand() && interaction.commandName === "gearcheck") {
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
      embeds: [
        kazeEmbed(
          "🛡️ Kaze Clan Gear Readiness Check",
          [
            "Before Guild War, confirm your setup:",
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
        ),
      ],
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
            "**Gear Guide:**",
            guides.gear.url,
            "",
            "**Lvl 91 Sword Trial Guides:**",
            ...guides.swordtrial.urls,
            "",
            "**Guild Manager:**",
            guides.guildmanager.url,
          ].join("\n")
        ),
      ],
    });
  }

  if (interaction.isChatInputCommand() && interaction.commandName === "support") {
    const menu = new StringSelectMenuBuilder()
      .setCustomId("support_menu")
      .setPlaceholder("What do you need help with?")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("I’m new")
          .setDescription("Help getting started")
          .setValue("new"),
        new StringSelectMenuOptionBuilder()
          .setLabel("I need gear help")
          .setDescription("Gear, tuning, and Sword Trial help")
          .setValue("gear"),
        new StringSelectMenuOptionBuilder()
          .setLabel("I need war help")
          .setDescription("Guild War preparation")
          .setValue("war"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Where are events?")
          .setDescription("Calendar and event channels")
          .setValue("events"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Where do I post clips/photos?")
          .setDescription("Media and sharing channels")
          .setValue("media")
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [
        kazeEmbed(
          "🧭 Kaze Clan Support",
          "Tell me what you need, warrior. I’ll guide you."
        ),
      ],
      components: [row],
      ephemeral: true,
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === "support_menu") {
    const choice = interaction.values[0];
    let embed;

    if (choice === "new") {
      embed = kazeEmbed(
        "🌱 Welcome to Kaze Clan",
        [
          "Start here:",
          "",
          "📍 #welcome-to-kaze",
          "📍 #introduction",
          "📍 #ranking-system",
          "",
          "Introduce yourself, learn the system, and find your role.",
        ].join("\n")
      );
    }

    if (choice === "gear") {
      embed = kazeEmbed(
        "⚙️ Gear Help",
        [
          "Sharpen your build here:",
          "",
          "📘 Gear Guide:",
          guides.gear.url,
          "",
          "⚔️ Sword Trial Guides:",
          ...guides.swordtrial.urls,
          "",
          "📍 #how-to-tune-gear",
        ].join("\n")
      );
    }

    if (choice === "war") {
      embed = kazeEmbed(
        "⚔️ War Preparation",
        [
          "Prepare for battle:",
          "",
          "📘 GvG Guide:",
          guides.gvg.url,
          "",
          "📍 #kaze-war-summoning",
          "📍 #kaze-assembly-hall",
          "",
          "Use `/gearcheck` before entering war.",
        ].join("\n")
      );
    }

    if (choice === "events") {
      embed = new EmbedBuilder()
        .setTitle("📅 Events & Schedule")
        .setDescription(
          [
            "Stay updated:",
            "",
            "📍 #up-coming-events",
            "📍 #public-event-information",
            "📍 #watch-night-planning",
            "",
            "See the weekly calendar below.",
          ].join("\n")
        )
        .setImage(guides.calendar.url)
        .setColor(RED)
        .setFooter({ text: "Kaze Clan • Move with the squad, not alone" });
    }

    if (choice === "media") {
      embed = kazeEmbed(
        "🎥 Media & Sharing",
        [
          "Post your content here:",
          "",
          "📍 #in-game-clips",
          "📍 #in-game-photo’s",
          "📍 #irl-photo’s",
          "📍 #guildie-creatives",
          "",
          "Show off your victories and creations.",
        ].join("\n")
      );
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (interaction.isChatInputCommand() && interaction.commandName === "eventinfo") {
    const embed = new EmbedBuilder()
      .setTitle("📅 Kaze Clan Event Intel")
      .setDescription(
        [
          "The winds are shifting, warrior. Here’s where to stay informed:",
          "",
          "📍 #up-coming-events",
          "📍 #public-event-information",
          "📍 #watch-night-planning",
          "",
          "**Use these channels to stay aligned with the clan’s movements.**",
          "",
          "Below is the current weekly schedule:",
        ].join("\n")
      )
      .setImage(guides.calendar.url)
      .setColor(RED)
      .setFooter({ text: "Kaze Clan • Move with the squad, not alone" });

    await interaction.reply({
      embeds: [embed],
      ephemeral: false,
    });
  }

  if (interaction.isChatInputCommand() && interaction.commandName === "quicklinks") {
    const embed = new EmbedBuilder()
      .setTitle("🧭 Kaze Clan Quicklinks")
      .setDescription(
        [
          "Choose your path, warrior.",
          "",
          "Use the buttons below to jump directly to key clan areas.",
          "",
          "⚠️ Replace the placeholder channel IDs in the code before using this command.",
        ].join("\n")
      )
      .setColor(RED)
      .setFooter({ text: "Kaze Clan • Move with purpose" });

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Welcome")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink("1494240512218239036")),

      new ButtonBuilder()
        .setLabel("Ranking System")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink("1382303536502804531")),

      new ButtonBuilder()
        .setLabel("Guides")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink("1379824043292885072"))
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Upcoming Events")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink("1485170571959337094")),

      new ButtonBuilder()
        .setLabel("Public Events")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink("1494232037412962344")),

      new ButtonBuilder()
        .setLabel("Watch Night")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink("1487902921755463831"))
    );

    const row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("War Summoning")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink("1487605721729335296")),

      new ButtonBuilder()
        .setLabel("Assembly Hall")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink("1486915865017581699")),

      new ButtonBuilder()
        .setLabel("Redemption Codes")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink("1479302222486441995"))
    );

    const row4 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Guild Manager")
        .setStyle(ButtonStyle.Link)
        .setURL(guides.guildmanager.url)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row1, row2, row3, row4],
      ephemeral: true,
    });
  }
});

deployCommands()
  .then(() => client.login(process.env.DISCORD_TOKEN))
  .catch(console.error);
