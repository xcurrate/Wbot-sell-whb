const CONSTANTS = require('../constants');
const log = require('../../logger');
const { sleep, randomInt, removeInvisibleChars } = require('../utils');
//const HUNTBOT_CHANNEL_ID = '1378917898063446156';

module.exports = (state, huntbotState, configManager, commandSender, telegramService, captchaSolver) => ({

    // ============== MAIN ENTRY POINT ==============
    processHuntBotMessage(msg) {
        const content = msg.content || "";
        const author = msg.author.id;
        
        // Only process OwO messages
        if (!CONSTANTS.OWO_IDS.includes(author)) return false;

        const myName = this.getMyName(msg);
        const myId = state.client.user.id;
        
        // CEK EMBED (untuk progress update)
        if (msg.embeds && msg.embeds.length > 0) {
            for (const embed of msg.embeds) {
                if (embed.author && embed.author.name && 
                    embed.author.name.toLowerCase().includes(myName.toLowerCase())) {
                    if (embed.author.name.toLowerCase().includes('huntbot')) {
                        return this.processEmbedMessage(msg, embed, myName);
                    }
                }
            }
        }

        const isMentioned = content.includes(`<@${myId}>`) || msg.mentions?.users?.has(myId);
        const containsMyName = content.toLowerCase().includes(myName.toLowerCase());
        
        // 🚀 FIX: Pengecualian khusus untuk pesan pulang (OwO tidak pakai nama di sini)
        const huntbotChannelId = state.config.tiketandhb.channelId;
        const isReturnMessage = msg.channel.id === huntbotChannelId && content.includes("BEEP BOOP. I AM BACK WITH");


        // CEK CONTENT 
        if (containsMyName || isMentioned || isReturnMessage) {
            
            if (isReturnMessage) {
                return this.processReturnMessage(msg, content);
            }
            
            if (content.includes("sold") && content.includes("for a total of")) {
                return this.processSellMessage(msg, content);
            }
            
            if (content.includes("sacrificed") && content.includes("for a total of")) {
                return this.processSacrificeMessage(msg, content);
            }
            
            if (content.includes("You successfully upgraded")) {
                return this.processUpgradeText(msg, content);
            }
            
            if (content.includes("Here is your password!")) {
                return this.processPasswordMessage(msg);
            }
            
            if (content.includes("YOU SPENT") && content.includes("I WILL BE BACK IN")) {
                return this.processHuntStartedMessage(msg, content);
            }
        }

        return false;
    },


    // ============== HELPER METHODS ==============
isPaused() {
    return !!state.config?.botStatus?.paused;
},

shouldAbort(actionName = "") {
    // 1. Cek langsung status CAPTCHA spesifik
    if (state.hasActiveCaptcha) { 
        log.warn(`🛑 HuntBot action '${actionName}' dibatalkan: CAPTCHA aktif!`);
        return true;
    }
    
    // 2. Cek toggle setting huntbot
    if (state.config?.settings?.huntbot?.enabled === false) {
        log.warn(`🛑 HuntBot action '${actionName}' dibatalkan: settings.huntbot OFF`);
        return true;
    }
    
    return false;
},



    getMyName(msg) {
        return msg.guild?.members?.me?.displayName || state.client.user.username;
    },

    // 7. HUNT BERJALAN (EMBED)
    processEmbedMessage(msg, embed, myName) {
        log.info(`📊 HuntBot embed detected`);
        
        if (embed.fields && embed.fields.length > 0) {
            for (const field of embed.fields) {
                if (field.value && field.value.includes('BEEP BOOP')) {
                    return this.processProgressEmbed(msg, embed, field.value);
                }
            }
        }
        
        return false;
    },

    // ============== PROCESS SACRIFICE ==============
    processSacrificeMessage(msg, content) {
        log.info(`🔪 HuntBot sacrificed items`);
        
        const cleanContent = removeInvisibleChars(content);
        log.info(`🔍 Clean Sacrifice: ${cleanContent}`);
        
        const essenceMatch = cleanContent.match(/total of.*?([\d,]+)/i);
        
        let essenceGained = 0;

        if (essenceMatch) {
            essenceGained = parseInt(essenceMatch[1].replace(/,/g, ''));
            log.info(`🔍 Essence gained: ${essenceGained}`);
        } else {
            log.warn(`❌ Could not extract essence from: ${cleanContent}`);
        }
        
        telegramService.send(
            `🔪 <b>Sacrifice Complete</b>\n` +
            `Essence gained: ${essenceGained.toLocaleString()}`
        );
        
// huntbot.js
if (huntbotState.autoMode) {
    // Ambil dari state.config (mengikuti pola loop.js yang sudah berhasil)
    const upgradeType = state.config?.huntbot?.defaultUpgrade || "duration";

    console.log(`[DEBUG] Membaca dari state.config: ${upgradeType}`);

    setTimeout(() => this.upgrade(upgradeType, "all"), 1000);
}

        
        return true;
    },

    // ============== PROCESS UPGRADE ==============
    processUpgradeText(msg, content) {
        log.info(`⬆️ Processing upgrade text response`);
        
        const cleanContent = removeInvisibleChars(content);
        log.info(`🔍 Clean Upgrade: ${cleanContent}`);
        
        let duration = null;
        let level = null;
        let progress = null;
        let essence = null;
        
        const essenceMatch = cleanContent.match(/total of.*?>\s*([\d,]+)/i);
        if (essenceMatch) {
            essence = parseInt(essenceMatch[1].replace(/,/g, ''));
            log.info(`🔍 Essence used: ${essence}`);
        }
        
        const durationMatch = cleanContent.match(/duration:\s*([\d.]+H)\s*-\s*Lvl\s*(\d+)\s*\[(\d+)\/(\d+)\]/i);
        if (durationMatch) {
            duration = durationMatch[1];
            level = parseInt(durationMatch[2]);
            progress = `${durationMatch[3]}/${durationMatch[4]}`;
            log.info(`🔍 Duration: ${duration}, Level: ${level}, Progress: ${progress}`);
        } else {
            log.warn(`❌ Could not extract duration/level from upgrade`);
        }
        
        huntbotState.lastUpgradeLevel = { duration, level, progress, essence, raw: content };
        
        telegramService.send(
            `⬆️ <b>Upgrade Complete</b>\n` +
            `Duration: ${duration || 'N/A'}\n` +
            `Level: ${level || 'N/A'}\n` +
            `Essence: ${essence ? essence.toLocaleString() : 'N/A'}`
        );
        
        if (huntbotState.autoMode) {
            setTimeout(() => this.startHunt("1D"), 1000);
        }
        
        return true;
    },

    // ============== PROCESS PROGRESS (EMBED) ==============
    processProgressEmbed(msg, embed, progressText) {
        log.info(`📊 HuntBot progress update (EMBED)`);
        
        const cleanText = removeInvisibleChars(progressText);
        log.info(`🔍 Clean Progress: ${cleanText}`);
        
        let returnTime = null;
        
        const backInMatch = cleanText.match(/BACK IN ([\d\sHM]+)/i);
        if (backInMatch) {
            returnTime = backInMatch[1].trim();
        }
        
        const percentMatch = cleanText.match(/(\d+\.?\d*)%\s*DONE/i);
        const percentage = percentMatch ? parseFloat(percentMatch[1]) : null;
        
        const animalsMatch = cleanText.match(/(\d+)\s*ANIMALS\s*CAPTURED/i);
        const animals = animalsMatch ? parseInt(animalsMatch[1]) : null;
        
        log.info(`📊 Extracted - Time: ${returnTime}, Percentage: ${percentage}%, Animals: ${animals}`);
        
        huntbotState.lastProgress = { percentage, animals, returnTime, raw: progressText };
        
        if (percentage !== null && percentage >= 90) {
            telegramService.send(
                `⚠️ <b>HuntBot Almost Done!</b>\n` +
                `${percentage}% complete\n` +
                `Animals: ${animals || 'unknown'}`
            );
        }
        
        if (returnTime) {
            huntbotState.activeHunt = huntbotState.activeHunt || {};
            huntbotState.activeHunt.returnTime = returnTime;
            
            const hours = parseInt(returnTime.match(/(\d+)\s*H/i)?.[1] || "0");
            const minutes = parseInt(returnTime.match(/(\d+)\s*M/i)?.[1] || "0");
            
            if (hours > 0 || minutes > 0) {
                const totalMs = (hours * 60 + minutes) * 60 * 1000;
                huntbotState.activeHunt.endTime = Date.now() + totalMs;
                
                const endTimeStr = new Date(huntbotState.activeHunt.endTime).toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                log.info(`📊 End time updated: ${endTimeStr} WIB`);
                
                // FIX UTAMA: Pastikan monitoring menyala setelah membaca embed
                this.startMonitoring();
            }
        }
        
        return true;
    },

    // ============== PROCESS RETURN ==============
    processReturnMessage(msg, content) {
        log.info(`🤖 HuntBot returned with animals!`);
        
        const cleanContent = removeInvisibleChars(content);
        
        const animalMatch = cleanContent.match(/WITH ([\d,]+) ANIMALS/i);
        const essenceMatch = cleanContent.match(/([\d,]+) ESSENCE/i);
        const expMatch = cleanContent.match(/([\d,]+) EXPERIENCE/i);
        
        const animals = animalMatch ? parseInt(animalMatch[1].replace(/,/g, '')) : 0;
        const essence = essenceMatch ? parseInt(essenceMatch[1].replace(/,/g, '')) : 0;
        const exp = expMatch ? parseInt(expMatch[1].replace(/,/g, '')) : 0;
        
        huntbotState.lastResponse = { animals, essence, exp };
        
        telegramService.send(
            `🤖 <b>HuntBot Returned!</b>\n` +
            `Animals: ${animals.toLocaleString()}\n` +
            `Essence: ${essence.toLocaleString()}\n` +
            `Experience: ${exp.toLocaleString()}`
        );
        
        if (huntbotState.autoMode) {
            if (state.config?.huntbot?.autoSellAll) {
                huntbotState.pendingAutoSell = true;
                setTimeout(() => this.sellAll(), 1000);
            } else {
                setTimeout(() => this.sacrificeAll(), 1000);
            }
        }
        
        return true;
    },

    // ============== PROCESS SELL ==============
    processSellMessage(msg, content) {
        log.info(`💰 HuntBot sold items`);
        const cleanContent = removeInvisibleChars(content);
        const cowoncyMatch = cleanContent.match(/total of .*?([\d,]+)/i);
        const cowoncy = cowoncyMatch ? parseInt(cowoncyMatch[1].replace(/,/g, '')) : 0;
        
        telegramService.send(`💰 <b>Sale Complete</b>\nCowoncy gained: ${cowoncy.toLocaleString()}`);
        return true;
    },

    // ============== PROCESS PASSWORD (CAPTCHA) ==============
    async processPasswordMessage(msg) {
        log.info(`🔐 HuntBot password received`);
        
        const attachment = msg.attachments?.first();
        if (!attachment || !attachment.url) {
            log.error("No image attachment found for captcha");
            return false;
        }
        
        try {
            const password = await captchaSolver.solve(attachment.url);
            
            if (password) {
                log.success(`✅ Captcha solved: ${password}`);
                huntbotState.pendingCaptcha = { password, messageId: msg.id };
                
                log.info(`🤖 Mengirim password secara otomatis...`);
                setTimeout(() => {
                    this.startHunt(CONSTANTS.HUNTBOT.DEFAULT_DURATION, password);
                }, 1000);
                
                telegramService.send(`🔐 <b>Captcha Solved & Sent</b>\nPassword: ${password}`);
            }
            return true;
        } catch (error) {
            log.error(`Failed to solve captcha: ${error.message}`);
            return false;
        }
    },

    // ============== PROCESS HUNT STARTED ==============
    processHuntStartedMessage(msg, content) {
        log.info(`🚀 HuntBot started successfully`);
        
        const cleanContent = removeInvisibleChars(content);
        const spentMatch = cleanContent.match(/YOU SPENT ([\d,]+) COWONCY/i);
        const returnTimeMatch = cleanContent.match(/I WILL BE BACK IN ([\d\sHM]+)/i);
        
        const spent = spentMatch ? parseInt(spentMatch[1].replace(/,/g, '')) : 0;
        const returnTime = returnTimeMatch ? returnTimeMatch[1].trim() : "unknown";
        
        log.info(`🔍 Hunt will return in: ${returnTime}`);
        
        huntbotState.activeHunt = {
            startTime: Date.now(),
            returnTime,
            spent,
            messageId: msg.id
        };
        
        if (returnTime !== "unknown") {
            const hours = parseInt(returnTime.match(/(\d+)\s*H/i)?.[1] || "0");
            const minutes = parseInt(returnTime.match(/(\d+)\s*M/i)?.[1] || "0");
            const totalMs = (hours * 60 + minutes) * 60 * 1000;
            huntbotState.activeHunt.endTime = Date.now() + totalMs;
        }
        
        telegramService.send(
            `🚀 <b>HuntBot Started!</b>\n` +
            `Spent: ${spent.toLocaleString()} cowoncy\n` +
            `Returns in: ${returnTime}`
        );
        
        this.startMonitoring();
        
        return true;
    },

    // ============== INITIALIZATION ==============
    init(options = {}) {
        log.info("⚙️ Initializing HuntBot Manager...");
        const config = configManager.read() || {};
        
        // Memastikan loop menyala apapun kondisinya
        this.startMonitoring();
        
        // Mengecek apakah config.huntbot ada DAN autoMode-nya true (Struktur DeepSeek)
        const isAutoModeOn = (config.huntbot && config.huntbot.autoMode === true) || 
                             config.autoHuntbot === true || 
                             huntbotState.autoMode === true;
        
        if (isAutoModeOn) {
            log.info("🤖 HuntBot Auto-start detected in config.");
            huntbotState.autoMode = false; // Reset sementara agar startAutoMode bisa me-restart statusnya
            this.startAutoMode({ skipInitialCheck: options.skipInitialCheck });
        } else {
            log.warn("⚠️ Auto Mode terdeteksi OFF di config.json");
        }
    },

    // ============== CUSTOM SENDER ==============
// HUNTBOT.JS

async sendHuntBotCommand(cmd) {
    // 1. PERBAIKAN: Menggunakan state secara konsisten dan mengecek hasActiveCaptcha sebagai boolean.
    // Ditambahkan log agar kamu tahu persis kapan command ditahan.
    if (state.hasActiveCaptcha) {
        log.warn(`⚠️ Command HuntBot [${cmd}] ditahan: CAPTCHA sedang aktif.`);
        return;
    }

    try {
        const huntbotChannelId = state.config.tiketandhb.channelId;
        const channel = state.client.channels.cache.get(huntbotChannelId);

        if (!channel) {
            log.error(`❌ Channel HuntBot (${huntbotChannelId}) belum ter-cache atau ID salah!`);

            return;
        }

        await channel.sendTyping();
        await sleep(randomInt(500, 1000)); 
        
        // 2. Re-check setelah sleep, biar pause yang dinyalakan saat nunggu tetap kepake
        // Asumsi: shouldAbort adalah metode valid dari class/objek ini yang mengecek status pause bot.
        if (this.shouldAbort(`sendHuntBotCommand(${cmd}) post-sleep`)) return;

        await channel.send(cmd);
        log.info(`💬 [HuntBot Channel] Terkirim: ${cmd}`);

    } catch (error) {
        log.error(`❌ Gagal mengirim command HuntBot: ${error.message}`);
    }
},


    // ============== COMMAND METHODS ==============
async checkStatus() {
    if (state.hasActiveCaptcha) return;
    await this.sendHuntBotCommand(CONSTANTS.HUNTBOT.COMMANDS.CHECK);
},


    async sellAll() {
        await this.sendHuntBotCommand(CONSTANTS.HUNTBOT.COMMANDS.SELL);
    },

    async sacrificeAll() {
        await this.sendHuntBotCommand(CONSTANTS.HUNTBOT.COMMANDS.SACRIFICE);
    },

    async upgrade(type = CONSTANTS.HUNTBOT.DEFAULT_UPGRADE, amount = "all") {
        const cmd = `${CONSTANTS.HUNTBOT.COMMANDS.UPGRADE} ${type} ${amount}`;
        await this.sendHuntBotCommand(cmd);
    },

    async startHunt(duration = CONSTANTS.HUNTBOT.DEFAULT_DURATION, password = "") {
        if (password) {
            huntbotState.activeHunt = null;
            huntbotState.notifiedSoon = false;
        }

        const cmd = password 
            ? `${CONSTANTS.HUNTBOT.COMMANDS.CHECK} ${duration} ${password}`
            : `${CONSTANTS.HUNTBOT.COMMANDS.CHECK} ${duration}`;
        
        await this.sendHuntBotCommand(cmd);
    },

    // ============== AUTO MODE & MONITORING ==============
    startAutoMode(options = {}) {
        if (huntbotState.autoMode) return;
        huntbotState.autoMode = true;
        log.success("🤖 HuntBot Auto Mode ACTIVE");
        telegramService.send("🤖 <b>HuntBot Auto Mode</b>\nStarting auto loop...");
        
        this.startMonitoring();
        if (!options.skipInitialCheck) {
            this.checkStatus();
        } else {
            log.info("🤖 Initial HuntBot check dilewati karena startup ready sequence yang mengirim whb.");
        }
    },

    stopAutoMode() {
        huntbotState.autoMode = false;
        
        // PENGAMAN: Pastikan objek loops ada
        huntbotState.loops = huntbotState.loops || {};

        if (huntbotState.loops.monitor) {
            clearInterval(huntbotState.loops.monitor);
            huntbotState.loops.monitor = null;
        }
        log.info("🤖 HuntBot Auto Mode STOPPED");
        telegramService.send("🤖 <b>HuntBot Auto Mode</b>\nLoop stopped.");
    },

startMonitoring() {
    huntbotState.loops = huntbotState.loops || {};

    if (huntbotState.loops.monitor) {
        clearInterval(huntbotState.loops.monitor);
    }
    log.info("⏱️ Mesin monitoring waktu HuntBot diaktifkan.");

    huntbotState.loops.monitor = setInterval(() => {


        this.checkActiveHunt();
    }, 60000);
},

checkActiveHunt() {
    if (state.hasActiveCaptcha) return;
    if (!huntbotState.activeHunt?.endTime) return;
        
        const now = Date.now();
        const timeLeft = huntbotState.activeHunt.endTime - now;
        
        // Notif 5 menit sebelum selesai (H-5)
        if (timeLeft > 0 && timeLeft <= 5 * 60 * 1000 && !huntbotState.notifiedSoon) {
            huntbotState.notifiedSoon = true;
            log.info("⏰ Waktu sisa < 5 menit. Mengirim notifikasi Telegram...");
            telegramService.send(`⏰ <b>HuntBot Returning Soon!</b>\nLess than 5 minutes remaining!`);
        }
        
        // Auto check saat waktu habis (Bot menjemput secara otomatis)
        if (timeLeft <= 0) {
            log.info("⏰ Waktu HuntBot telah habis!");
            
            // Reset status agar tidak dikirim berulang kali
            huntbotState.notifiedSoon = false;
            huntbotState.activeHunt = null; 
            
            if (huntbotState.autoMode) {
                log.info("🚀 Auto-Mode ON: Menjemput HuntBot dengan command whb...");
                this.checkStatus();
            } else {
                log.warn("⚠️ Auto-Mode OFF: Huntbot Selesai, menunggu aksi manual.");
                telegramService.send(`⏰ <b>HuntBot Selesai!</b>\nSilakan kirim 'whb' secara manual untuk menjemput.`);
            }
        }
    },

    getStatus() {
        return {
            autoMode: huntbotState.autoMode,
            activeHunt: huntbotState.activeHunt,
            lastUpgrade: huntbotState.lastUpgradeLevel,
            lastProgress: huntbotState.lastProgress,
            hasPendingCaptcha: !!huntbotState.pendingCaptcha
        };
    }
});
