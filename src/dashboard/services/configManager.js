module.exports = function createConfigManager({ configPath, fileService, CONSTANTS }) {
    return {
    get() {
        return fileService.readJson(configPath);
    },

    save(config) {
        return fileService.writeJson(configPath, config);
    },

    ensureShape(config) {
        config.port = config.port || CONSTANTS.DEFAULT_PORT;
        config.botStatus = config.botStatus || { running: false, paused: false };
        config.channels = Array.isArray(config.channels) ? config.channels : [];
        config.macrodroidId = config.macrodroidId || "";
        config.autosolver = config.autosolver || false;
        config.maxLogLines = config.maxLogLines || CONSTANTS.MAX_LOG_LINES;
        
        config.settings = config.settings || {};
        config.delays = config.delays || {};
        config.safety = config.safety || { cctv: false };
        config.tiketandhb = config.tiketandhb || { channelId: "" };
        config.huntbot = config.huntbot || { enabled: true, autoMode: true, autoSellAll: false, defaultUpgrade: 'duration', defaultDuration: '1D', notifyProgress: true };
        config.huntbot.autoSellAll = config.huntbot.autoSellAll === true;

        config.settings.twoCaptchaKey = config.settings.twoCaptchaKey || "";
        config.settings.control = config.settings.control || { start: 'wcash', pause: 'wbuy 1', allowIds: [] };
        config.settings.channelRotation = config.settings.channelRotation || { enabled: false, minMs: 180000, maxMs: 360000 };
        config.settings.boss = config.settings.boss || { enabled: true, allowedGuilds: [] };
        config.settings.messageFilter = config.settings.messageFilter || { enabled: true, channelIds: [], guildIds: [], debug: false, debugOnlyOwO: false };
        config.settings.telegram = config.settings.telegram || { token: "", chatId: "" };
        config.settings.voice = config.settings.voice || { enabled: false, channelId: "" };

        // Ensure captcha config shape
        config.captcha = config.captcha || {};
        config.captcha.enabled = config.captcha.enabled !== false;
        config.captcha.primarySolver = config.captcha.primarySolver || 'NopechaSolver';
        config.captcha.fallbackSolvers = Array.isArray(config.captcha.fallbackSolvers) ? config.captcha.fallbackSolvers : [];
        config.captcha.maxTotalTimeMs = config.captcha.maxTotalTimeMs || 600000;
        config.captcha.retryPerSolver = config.captcha.retryPerSolver || 2;
        config.captcha.apiKeys = config.captcha.apiKeys || { NopechaSolver: '', TwoCaptchaSolver: '' };

        Object.keys(CONSTANTS.DEFAULT_DELAYS).forEach(key => {
            config.delays[key] = {
                ...CONSTANTS.DEFAULT_DELAYS[key],
                ...(config.delays[key] || {})
            };
        });

        return config;
    },

    applySave(config, body) {
        config.token = body.token || config.token; 
        config.port = this.toInt(body.port, config.port);
        config.macrodroidId = body.macrodroidId || '';
        config.autosolver = this.toBool(body.autosolver);

        const channels = [body.chan1, body.chan2, body.chan3]
            .filter(ch => ch && String(ch).trim() !== '')
            .map(ch => String(ch).trim());
        config.channels = channels;

        config.settings.battle = this.toBool(body.battle);
        config.settings.hunt = this.toBool(body.hunt);
        config.settings.pray = this.toBool(body.pray);
        config.settings.custom = this.toBool(body.custom);
        config.settings.twoCaptchaKey = body.twoCaptchaKey || '';

        config.settings.text1 = body.text1 || '';
        config.settings.text2 = body.text2 || '';

        config.delays.hunt.min = this.toInt(body.huntMin, config.delays.hunt.min);
        config.delays.hunt.max = this.toInt(body.huntMax, config.delays.hunt.max);
        config.delays.battle.min = this.toInt(body.battleMin, config.delays.battle.min);
        config.delays.battle.max = this.toInt(body.battleMax, config.delays.battle.max);
        config.delays.pray.min = this.toInt(body.prayMin, config.delays.pray.min);
        config.delays.pray.max = this.toInt(body.prayMax, config.delays.pray.max);
        config.delays.custom1.min = this.toInt(body.c1Min, config.delays.custom1.min);
        config.delays.custom1.max = this.toInt(body.c1Max, config.delays.custom1.max);
        config.delays.custom2.min = this.toInt(body.c2Min, config.delays.custom2.min);
        config.delays.custom2.max = this.toInt(body.c2Max, config.delays.custom2.max);

        config.settings.telegram.token = body.tgToken || '';
        config.settings.telegram.chatId = body.tgChat || '';

        config.maxLogLines = this.toInt(body.maxLogLines, 15);
        config.settings.autoResume = this.toBool(body.autoResume);
        
        config.settings.control.start = body.ctrlStart || 'wcash';
        config.settings.control.pause = body.ctrlPause || 'wbuy 1';
        config.settings.control.allowIds = this.toArray(body.ctrlAllowIds);

        config.settings.channelRotation.enabled = this.toBool(body.crEnabled);
        config.settings.channelRotation.minMs = this.toInt(body.crMin, 180000);
        config.settings.channelRotation.maxMs = this.toInt(body.crMax, 360000);

        config.settings.boss.enabled = this.toBool(body.bossEnabled);
        config.settings.boss.allowedGuilds = this.toArray(body.bossGuilds);

        config.settings.messageFilter.enabled = this.toBool(body.mfEnabled);
        config.settings.messageFilter.channelIds = this.toArray(body.mfChannelIds);
        config.settings.messageFilter.guildIds = this.toArray(body.mfGuildIds);
        config.settings.messageFilter.debug = this.toBool(body.mfDebug);
        config.settings.messageFilter.debugOnlyOwO = this.toBool(body.mfDebugOnlyOwO);

        config.settings.voice.enabled = this.toBool(body.voiceEnabled);
        config.settings.voice.channelId = body.voiceChannelId || '';

        config.huntbot.enabled = this.toBool(body.hbEnabled);
        config.huntbot.autoMode = this.toBool(body.hbAutoMode);
        config.huntbot.autoSellAll = this.toBool(body.hbAutoSellAll);
        config.huntbot.notifyProgress = this.toBool(body.hbNotify);
        config.huntbot.defaultUpgrade = body.hbUpgrade || 'duration';
        config.huntbot.defaultDuration = body.hbDuration || '1D';
        config.tiketandhb.channelId = body.tiketandhbChannel || '';
        
        config.safety.cctv = this.toBool(body.cctvEnabled);

        // === CAPTCHA SETTINGS (Full Fallback Support) ===
        config.captcha = config.captcha || {};
        config.captcha.enabled = this.toBool(body.captchaEnabled);
        config.captcha.primarySolver = body.captchaPrimary || 'NopechaSolver';
        
        // Fallback solvers (dari checkbox)
        const fallbackList = [];
        if (body.fallbackNopecha) fallbackList.push('NopechaSolver');
        if (body.fallbackTwoCaptcha) fallbackList.push('TwoCaptchaSolver');
        config.captcha.fallbackSolvers = fallbackList;

        config.captcha.apiKeys = config.captcha.apiKeys || {};
        config.captcha.apiKeys.NopechaSolver = body.nopechaApiKey || '';
        config.captcha.apiKeys.TwoCaptchaSolver = body.twoCaptchaApiKey || '';

        return config;
    },

    applyAction(config, action) {
        switch (action) {
            case 'start':
                config.botStatus.running = true;
                config.botStatus.paused = false;
                break;
            case 'pause':
                config.botStatus.paused = true;
                config.botStatus.running = false;
                break;
        }
        return config;
    },

    toInt(value, fallback = 0) {
        const num = parseInt(value, 10);
        return Number.isFinite(num) ? num : fallback;
    },

    toBool(value) {
        return !!value;
    },

    toArray(value) {
        if (!value) return [];
        return value.split(',').map(s => s.trim()).filter(Boolean);
    },

    computeStatus(config) {
        const isPaused = !!config.botStatus?.paused;
        const isRunning = !!config.botStatus?.running;

        let statusText = '⏹ OFFLINE';
        let statusClass = 'offline';

        if (isRunning) {
            statusText = isPaused ? '⏸ PAUSED' : '▶ RUNNING';
            statusClass = isPaused ? 'paused' : 'running';
        }

        return { statusText, statusClass };
    }
    };
};
