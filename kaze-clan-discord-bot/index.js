require("dotenv").config();

const cron = require("node-cron");

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
  PermissionFlagsBits,
} = require("discord.js");

const RED = 0xff0000;

const CHANNELS = {
  welcome: "1494248990919884800",
  introduction: "1379823827806060704",
  ranking: "1382303536502804531",
  upcoming: "1485170571959337094",
  publicEvents: "1494232037412962344",
  watchNight: "1487902921755463831",
  warSummoning: "1487605721729335296",
  assembly: "1486915865017581699",
  redemption: "1479302222486441995",
  clips: "1450126556646346876",
  ingamePhotos: "1450123041940963449",
  irlPhotos: "1456219367816827026",
  creatives: "1469590200496689278",
  gearTune: "1497113698693681304",
  guides: "1379824043292885072",
};

const BOT_REMINDER_CHANNEL_ID = process.env.BOT_REMINDER_CHANNEL_ID;

const BOT_REMINDERS = [
  "Use `/guides` to open the Kaze Clan Scroll Archive.",
  "Use `/quicklinks` to jump directly to important clan channels.",
  "Use `/support` if you are new, lost, or unsure where to go.",
  "Use `/support` → **I'm new** for onboarding help.",
  "Use `/support` → **I need gear help** for build and tuning resources.",
  "Use `/support` → **I need war help** for Guild War resources.",
  "Use `/eventinfo` to see the weekly calendar and event channels.",
  "Use `/gearcheck` to confirm your setup before content.",
  "Use `/guides` → **Lvl 91 Sword Trial Guides** for trial resources.",
  "Use `/guides` → **Lvl 91 Heroes Realm Guide** for Heroes Realm help.",
];

let lastReminderIndex = -1;

function getRotatingReminder() {
  let index;

  do {
    index = Math.floor(Math.random() * BOT_REMINDERS.length);
  } while (index === lastReminderIndex && BOT_REMINDERS.length > 1);

  lastReminderIndex = index;
  return BOT_REMINDERS[index];
}

function ch(id) {
  return `<#${id}>`;
}

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
    urls: ["https://www.youtube.com/watch?v=hab1etvhQ2g"],
  },
  heroesrealm: {
    name: "Lvl 91 Heroes Realm Guide",
    url: "https://www.youtube.com/watch?v=a3KyZGwiIvw",
  },
  guildmanager: {
    name: "Kaze Clan Guild Manager",
    url: "https://gmapp.me/kaze-clan",
  },
  calendar: {
    name: "Kaze Clan Weekly Calendar",
    url: "https://cdn.discordapp.com/attachments/1379823827806060704/1500563618297806999/Elegance_Weekly_Calendar.png?ex=69f8e445&is=69f792c5&hm=819ddc9838ab3f4e471dca2b24ceecf02c748eab074654f7b4484f3aaa0ad799&",
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

  new SlashCommandBuilder()
    .setName("kazetip")
    .setDescription("Officer only: manually post a Kaze Sensei bot tip.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {
  console.log("Clearing old slash commands...");

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: [] }
  );

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: [],
  });

  console.log("Registering global slash commands...");

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: commands,
  });

  console.log(`✅ Successfully registered ${commands.length} global commands.`);
  console.log(commands.map((command) => command.name));
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

async function postBotReminder() {
  try {
    if (!BOT_REMINDER_CHANNEL_ID) {
      console.log("BOT_REMINDER_CHANNEL_ID is not set.");
      return;
    }

    const channel = await client.channels.fetch(BOT_REMINDER_CHANNEL_ID);

    if (!channel) {
      console.log("Bot reminder channel not found.");
      return;
    }

    await channel.send({
      embeds: [
        kazeEmbed(
          "💡 Kaze Sensei Tip",
          [getRotatingReminder(), "", "A prepared clan moves as one blade."].join(
            "\n"
          )
        ),
      ],
    });

    console.log("Kaze Sensei tip posted.");
  } catch (error) {
    console.error("Failed to post Kaze Sensei tip:", error);
  }
}

client.once("clientReady", () => {
  console.log(`The Kaze Clan bot has awakened as ${client.user.tag}`);

  cron.schedule("0 9 * * *", postBotReminder);

  console.log("Kaze Sensei daily tip scheduler loaded.");
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === "kazetip") {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        embeds: [
          kazeEmbed(
            "⛔ Officer Command",
            "Only officers with the **Manage Channels** permission can use this command."
          ),
        ],
        ephemeral: true,
      });
    }

    await postBotReminder();

    return interaction.reply({
      embeds: [
        kazeEmbed(
          "✅ Kaze Sensei Tip Posted",
          "A new Kaze Sensei tip has been posted for the clan."
        ),
      ],
      ephemeral: true,
    });
  }

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
          .setLabel("Lvl 91 Heroes Realm Guide")
          .setDescription("Learn the Heroes Realm mechanics and strategies.")
          .setValue("heroesrealm"),
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

    return interaction.reply({
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
        .setDescription(
          "Here is the weekly formation schedule. Be on time, stay ready, and move as one."
        )
        .setImage(selected.url)
        .setColor(RED)
        .setFooter({ text: "Kaze Clan • Discipline over ego" });

      return interaction.reply({ embeds: [embed] });
    }

    if (selected.urls) {
      return interaction.reply({
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
    }

    return interaction.reply({
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

    const row = new ActionRowBuilder().addComponents(
      readyButton,
      notReadyButton
    );

    return interaction.reply({
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
    return interaction.reply({
      embeds: [
        kazeEmbed(
          "✅ Warrior Confirmed",
          `${interaction.user} is battle-ready. Stay sharp, stay grouped, and protect the clan.`
        ),
      ],
    });
  }

  if (interaction.isButton() && interaction.customId === "gear_not_ready") {
    return interaction.reply({
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
            "**Heroes Realm Guide:**",
            guides.heroesrealm.url,
            "",
            "**Guild Manager:**",
            guides.guildmanager.url,
            "",
            "**Gear Tuning Channel:**",
            ch(CHANNELS.gearTune),
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
          .setDescription("Gear, tuning, and PvE guide help")
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

    return interaction.reply({
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
          `📍 ${ch(CHANNELS.welcome)}`,
          `📍 ${ch(CHANNELS.introduction)}`,
          `📍 ${ch(CHANNELS.ranking)}`,
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
          "🏛️ Heroes Realm Guide:",
          guides.heroesrealm.url,
          "",
          `📍 ${ch(CHANNELS.gearTune)}`,
          `📍 ${ch(CHANNELS.guides)}`,
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
          `📍 ${ch(CHANNELS.warSummoning)}`,
          `📍 ${ch(CHANNELS.assembly)}`,
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
            `📍 ${ch(CHANNELS.upcoming)}`,
            `📍 ${ch(CHANNELS.publicEvents)}`,
            `📍 ${ch(CHANNELS.watchNight)}`,
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
          `📍 ${ch(CHANNELS.clips)}`,
          `📍 ${ch(CHANNELS.ingamePhotos)}`,
          `📍 ${ch(CHANNELS.irlPhotos)}`,
          `📍 ${ch(CHANNELS.creatives)}`,
          "",
          "Show off your victories and creations.",
        ].join("\n")
      );
    }

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (interaction.isChatInputCommand() && interaction.commandName === "eventinfo") {
    const embed = new EmbedBuilder()
      .setTitle("📅 Kaze Clan Event Intel")
      .setDescription(
        [
          "The winds are shifting, warrior. Here’s where to stay informed:",
          "",
          `📍 ${ch(CHANNELS.upcoming)}`,
          `📍 ${ch(CHANNELS.publicEvents)}`,
          `📍 ${ch(CHANNELS.watchNight)}`,
          "",
          "**Use these channels to stay aligned with the clan’s movements.**",
          "",
          "Below is the current weekly schedule:",
        ].join("\n")
      )
      .setImage(guides.calendar.url)
      .setColor(RED)
      .setFooter({ text: "Kaze Clan • Move with the squad, not alone" });

    return interaction.reply({
      embeds: [embed],
      ephemeral: false,
    });
  }

  if (interaction.isChatInputCommand() && interaction.commandName === "quicklinks") {
    const embed = new EmbedBuilder()
      .setTitle("🧭 Kaze Clan Quicklinks")
      .setDescription(
        [
          "Step through the gates of Kaze. Choose your path.",
          "",
          `📌 Welcome: ${ch(CHANNELS.welcome)}`,
          `🌱 Introduction: ${ch(CHANNELS.introduction)}`,
          `🏯 Ranking System: ${ch(CHANNELS.ranking)}`,
          "",
          `📅 Events: ${ch(CHANNELS.upcoming)}`,
          `📣 Public Events: ${ch(CHANNELS.publicEvents)}`,
          `🌙 Watch Night: ${ch(CHANNELS.watchNight)}`,
          "",
          `⚔️ War Summoning: ${ch(CHANNELS.warSummoning)}`,
          `🏛️ Assembly Hall: ${ch(CHANNELS.assembly)}`,
          "",
          `📘 Guides: ${ch(CHANNELS.guides)}`,
          `⚙️ Gear Tuning: ${ch(CHANNELS.gearTune)}`,
          `🎁 Redemption Codes: ${ch(CHANNELS.redemption)}`,
          "",
          "Move with purpose.",
        ].join("\n")
      )
      .setColor(RED)
      .setFooter({ text: "Kaze Clan • Move with purpose" });

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Welcome")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink(CHANNELS.welcome)),
      new ButtonBuilder()
        .setLabel("Ranking")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink(CHANNELS.ranking)),
      new ButtonBuilder()
        .setLabel("Guides")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink(CHANNELS.guides))
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Events")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink(CHANNELS.upcoming)),
      new ButtonBuilder()
        .setLabel("Public Events")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink(CHANNELS.publicEvents)),
      new ButtonBuilder()
        .setLabel("Watch Night")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink(CHANNELS.watchNight))
    );

    const row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("War Summoning")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink(CHANNELS.warSummoning)),
      new ButtonBuilder()
        .setLabel("Assembly Hall")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink(CHANNELS.assembly)),
      new ButtonBuilder()
        .setLabel("Codes")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink(CHANNELS.redemption))
    );

    const row4 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Gear Tuning")
        .setStyle(ButtonStyle.Link)
        .setURL(channelLink(CHANNELS.gearTune)),
      new ButtonBuilder()
        .setLabel("Guild Manager")
        .setStyle(ButtonStyle.Link)
        .setURL(guides.guildmanager.url)
    );

    return interaction.reply({
      embeds: [embed],
      components: [row1, row2, row3, row4],
      ephemeral: true,
    });
  }
});

deployCommands()
  .then(() => client.login(process.env.DISCORD_TOKEN))
  .catch(console.error);
