module.exports = function createSettingsTabs({ escapeHtml }) {
    function renderMainSettings({ config, profileOptions, channels, custom1, custom2 }) {
        return `
                    <div id="tab-main" class="tab-content active">

                        <div class="card" style="border-color: var(--accent);">
                            <label style="color: var(--accent);">👥 PROFILE MANAGER (GANTI AKUN)</label>
                            
                            <div style="margin-bottom: 12px;">
                                <div class="row">
                                    <div class="col">
                                        <select name="selectedProfile" id="selectedProfile" class="input-select">
                                            <option value="">-- Pilih Profil Tersimpan --</option>
                                            ${profileOptions.map(profile => `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.isActive ? `✅ ${profile.displayName} (Aktif)` : profile.displayName)}</option>`).join('')}
                                        </select>
                                        <div id="selectedProfilePreview" class="profile-preview" aria-live="polite"></div>
                                    </div>
                                    <div class="col" style="flex: 0.4;">
                                        <button type="submit" name="action" value="loadProfile" class="btn" style="background: var(--yellow); color: black;">📂 LOAD</button>
                                    </div>
                                </div>
                                <div class="input-hint">Pilih akun lalu klik LOAD untuk memuat ulang pengaturan (config).</div>
                            </div>

                            <div class="divider"></div>

                            <div>
                                <label>ATAU MASUKKUN TOKEN AKUN BARU</label>
                                <div class="row">
                                    <div class="col">
                                        <input type="password" name="newToken" placeholder="Paste Token di sini...">
                                    </div>
                                    <div class="col" style="flex: 0.4;">
                                        <button type="submit" name="action" value="newProfile" class="btn" style="background: var(--green); color: white;">➕ BUAT</button>
                                    </div>
                                </div>
                                <div class="input-hint">Paste token akun baru dan klik BUAT. Pengaturan akan disamakan dengan akun saat ini.</div>
                            </div>
                        </div>
                        <div class="card">
                            <label>🔐 CURRENT DISCORD TOKEN</label>
                            <input type="password" name="token" value="${config.token || ''}" placeholder="Token aktif saat ini.">
                            <div class="input-hint">Token yang sedang digunakan oleh bot saat ini.</div>
                        </div>

                        <div class="card">
                            <label>📡 ACTIVE CHANNELS (max 3)</label>
                            <input type="text" name="chan1" value="${channels[0] || ''}" placeholder="Channel ID 1">
                            <input type="text" name="chan2" value="${channels[1] || ''}" placeholder="Channel ID 2">
                            <input type="text" name="chan3" value="${channels[2] || ''}" placeholder="Channel ID 3">
                        </div>

                        <div class="card">
                            <label>⚔️ MAIN COMMANDS</label>

                            <div class="toggle-row">
                                <span><span style="margin-right: 8px;">🏹</span> Hunt</span>
                                <input type="checkbox" name="hunt" ${config.settings.hunt ? 'checked' : ''}>
                            </div>
                            <div class="row">
                                <div class="col"><input type="number" name="huntMin" value="${config.delays.hunt.min}" placeholder="Min"></div>
                                <div class="col"><input type="number" name="huntMax" value="${config.delays.hunt.max}" placeholder="Max"></div>
                            </div>

                            <div class="divider"></div>

                            <div class="toggle-row">
                                <span><span style="margin-right: 8px;">⚔️</span> Battle</span>
                                <input type="checkbox" name="battle" ${config.settings.battle ? 'checked' : ''}>
                            </div>
                            <div class="row">
                                <div class="col"><input type="number" name="battleMin" value="${config.delays.battle.min}" placeholder="Min"></div>
                                <div class="col"><input type="number" name="battleMax" value="${config.delays.battle.max}" placeholder="Max"></div>
                            </div>

                            <div class="divider"></div>

                            <div class="toggle-row">
                                <span><span style="margin-right: 8px;">🙏</span> Pray</span>
                                <input type="checkbox" name="pray" ${config.settings.pray ? 'checked' : ''}>
                            </div>
                            <div class="row">
                                <div class="col"><input type="number" name="prayMin" value="${config.delays.pray.min}" placeholder="Min"></div>
                                <div class="col"><input type="number" name="prayMax" value="${config.delays.pray.max}" placeholder="Max"></div>
                            </div>
                        </div>

                        <div class="card">
                            <label>💬 CUSTOM COMMANDS</label>
                            <div style="margin-bottom: 12px;">
                                <input type="text" name="text1" value="${config.settings.text1 || ''}" placeholder="Command 1 (e.g., owo inv)">
                                <div class="row" style="margin-top: 8px;">
                                    <div class="col"><input type="number" name="c1Min" value="${custom1.min}" placeholder="Min"></div>
                                    <div class="col"><input type="number" name="c1Max" value="${custom1.max}" placeholder="Max"></div>
                                </div>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <input type="text" name="text2" value="${config.settings.text2 || ''}" placeholder="Command 2 (e.g., owo cash)">
                                <div class="row" style="margin-top: 8px;">
                                    <div class="col"><input type="number" name="c2Min" value="${custom2.min}" placeholder="Min"></div>
                                    <div class="col"><input type="number" name="c2Max" value="${custom2.max}" placeholder="Max"></div>
                                </div>
                            </div>
                            <div class="toggle-row">
                                <span>🔘 Enable Custom Commands</span>
                                <input type="checkbox" name="custom" ${config.settings.custom ? 'checked' : ''}>
                            </div>
                        </div>
                    </div>

        `;
    }

    function renderAdvancedSettings({ config, huntbot, control, rotation, boss, msgFilter, voice, captchaConfig, nopechaKey, twoCaptchaKey, fallbackSolvers }) {
        return `
                    <div id="tab-notifications" class="tab-content">
                        <div class="category-heading">
                            <div>
                                <span class="section-label">Advanced / Add-ons</span>
                                <h3>📱 Notifikasi</h3>
                            </div>
                            <p>Pengaturan kanal notifikasi eksternal agar status bot mudah dipantau.</p>
                        </div>

                        <div class="card">
                            <label>📱 TELEGRAM NOTIFICATIONS</label>
                            <input type="text" name="tgToken" value="${config.settings.telegram.token || ''}" placeholder="Bot Token">
                            <input type="text" name="tgChat" value="${config.settings.telegram.chatId || ''}" placeholder="Chat ID">
                            <div class="input-hint">Optional: Leave empty to disable</div>
                        </div>
                    </div>

                    <div id="tab-captcha" class="tab-content">
                        <div class="category-heading">
                            <div>
                                <span class="section-label">Advanced / Add-ons</span>
                                <h3>🛡️ Captcha</h3>
                            </div>
                            <p>Kelola auto solver, solver utama, fallback, dan API key captcha.</p>
                        </div>

                        <!-- === CAPTCHA SETTINGS (Full Fallback UI) === -->
                        <div class="card" style="border-color: #f59e0b;">
                            <label style="color: #f59e0b;">🛡️ CAPTCHA SETTINGS (CaptchaAsu)</label>
                            
                            <div class="toggle-row">
                                <span>Enable Auto Solver (CaptchaAsu)</span>
                                <input type="checkbox" name="autosolver" ${config.autosolver ? 'checked' : ''}>
                            </div>

                            <div class="divider"></div>

                            <label>Primary Solver</label>
                            <select name="captchaPrimary" class="input-select">
                                <option value="NopechaSolver" ${captchaConfig.primarySolver === 'NopechaSolver' ? 'selected' : ''}>NopechaSolver</option>
                                <option value="TwoCaptchaSolver" ${captchaConfig.primarySolver === 'TwoCaptchaSolver' ? 'selected' : ''}>TwoCaptchaSolver</option>
                            </select>

                            <div class="divider"></div>

                            <label>Fallback Solvers (akan dicoba jika Primary gagal)</label>
                            <div style="margin: 8px 0;">
                                <label style="display: inline-flex; align-items: center; gap: 8px; margin-right: 20px;">
                                    <input type="checkbox" name="fallbackNopecha" value="NopechaSolver" ${fallbackSolvers.includes('NopechaSolver') ? 'checked' : ''}>
                                    <span>NopechaSolver</span>
                                </label>
                                <label style="display: inline-flex; align-items: center; gap: 8px;">
                                    <input type="checkbox" name="fallbackTwoCaptcha" value="TwoCaptchaSolver" ${fallbackSolvers.includes('TwoCaptchaSolver') ? 'checked' : ''}>
                                    <span>TwoCaptchaSolver</span>
                                </label>
                            </div>
                            <div class="input-hint">Centang solver yang ingin digunakan sebagai cadangan (sequential).</div>

                            <div class="divider"></div>

                            <label>Nopecha API Key</label>
                            <input type="password" name="nopechaApiKey" value="${escapeHtml(nopechaKey)}" placeholder="Masukkan Nopecha API Key">

                            <label style="margin-top: 12px;">TwoCaptcha API Key</label>
                            <input type="password" name="twoCaptchaApiKey" value="${escapeHtml(twoCaptchaKey)}" placeholder="Masukkan TwoCaptcha API Key">

                            <div class="input-hint" style="margin-top: 8px; color: #f59e0b;">
                                Sistem akan mencoba Primary terlebih dahulu, lalu fallback secara berurutan jika gagal.
                            </div>
                        </div>
                    </div>

                    <div id="tab-integrations" class="tab-content">
                        <div class="category-heading">
                            <div>
                                <span class="section-label">Advanced / Add-ons</span>
                                <h3>🔌 Integrasi Sistem</h3>
                            </div>
                            <p>Konfigurasi port dashboard dan layanan eksternal pendukung.</p>
                        </div>

                        <div class="card">
                            <label>🔌 SYSTEM INTEGRATIONS</label>
                            <label>Dashboard Port</label>
                            <input type="number" name="port" value="${config.port}">
                            <label>MacroDroid ID</label>
                            <input type="text" name="macrodroidId" value="${config.macrodroidId || ''}">
                            <label>2Captcha API Key</label>
                            <input type="password" name="twoCaptchaKey" value="${config.settings.twoCaptchaKey || ''}">
                        </div>
                    </div>

                    <div id="tab-safety" class="tab-content">
                        <div class="category-heading">
                            <div>
                                <span class="section-label">Advanced / Add-ons</span>
                                <h3>🛡️ Safety & Filter</h3>
                            </div>
                            <p>Batasi channel/guild, aktifkan CCTV, dan atur mode debug filter pesan.</p>
                        </div>

                        <div class="card">
                            <label>🛡️ SAFETY & FILTER</label>
                            <div class="toggle-row">
                                <span>Enable CCTV Monitoring</span>
                                <input type="checkbox" name="cctvEnabled" ${config.safety?.cctv ? 'checked' : ''}>
                            </div>
                            
                            <div class="divider"></div>
                            
                            <label>📨 Message Filter</label>
                            <div class="toggle-row">
                                <span>Enable Filter</span>
                                <input type="checkbox" name="mfEnabled" ${msgFilter.enabled ? 'checked' : ''}>
                            </div>
                            <label>Channel IDs (Comma separated)</label>
                            <input type="text" name="mfChannelIds" value="${(msgFilter.channelIds || []).join(',')}" placeholder="Channel IDs">
                            <label>Guild IDs (Comma separated)</label>
                            <input type="text" name="mfGuildIds" value="${(msgFilter.guildIds || []).join(',')}" placeholder="Guild IDs">
                            <div class="toggle-row">
                                <span>Debug Mode</span>
                                <input type="checkbox" name="mfDebug" ${msgFilter.debug ? 'checked' : ''}>
                            </div>
                            <div class="toggle-row">
                                <span>Debug Only OwO</span>
                                <input type="checkbox" name="mfDebugOnlyOwO" ${msgFilter.debugOnlyOwO ? 'checked' : ''}>
                            </div>
                        </div>
                    </div>

                    <div id="tab-automation" class="tab-content">
                        <div class="category-heading">
                            <div>
                                <span class="section-label">Advanced / Add-ons</span>
                                <h3>🤖 Automasi</h3>
                            </div>
                            <p>Kumpulkan pengaturan HuntBot, voice channel, boss, dan rotasi channel.</p>
                        </div>
                                                                        
                        <div class="card">
                            <label>🤖 HUNTBOT AUTOMATION</label>
                            <div class="toggle-row">
                                <span>Enable HuntBot</span>
                                <input type="checkbox" name="hbEnabled" ${huntbot.enabled ? 'checked' : ''}>
                            </div>
                            <div class="toggle-row">
                                <span>Auto Mode (Claim & Upgrade)</span>
                                <input type="checkbox" name="hbAutoMode" ${huntbot.autoMode ? 'checked' : ''}>
                            </div>
                            <div class="toggle-row">
                                <span>💰 wsell all (Sell & Skip Upgrade)</span>
                                <input type="checkbox" name="hbAutoSellAll" ${huntbot.autoSellAll ? 'checked' : ''}>
                            </div>
                            <div class="input-hint">ON: setelah HuntBot dijemput, kirim <code>wsell all</code>, lewati <code>wsc all</code>/<code>wupg ...</code>, lalu langsung <code>whb 1D</code>. OFF: gunakan alur sacrifice + upgrade seperti biasa.</div>
                            <div class="toggle-row">
                                <span>Notify Progress</span>
                                <input type="checkbox" name="hbNotify" ${huntbot.notifyProgress ? 'checked' : ''}>
                            </div>
                            <div class="divider"></div>
                            <label>Default Upgrade Type</label>
                            <input type="text" name="hbUpgrade" value="${huntbot.defaultUpgrade || 'duration'}" placeholder="duration / efficiency">
                            <label>Default Hunt Duration</label>
                            <input type="text" name="hbDuration" value="${huntbot.defaultDuration || '1D'}" placeholder="1D">
                            
                            <div class="divider"></div>
                            <label>Tiket & Huntbot Channel ID</label>
                            <input type="text" name="tiketandhbChannel" value="${config.tiketandhb?.channelId || ''}" placeholder="Channel ID">
                        </div>


                        <div class="card">
                            <label>🔊 VOICE CHANNEL</label>
                            <div class="toggle-row">
                                <span>Auto Join Voice Channel</span>
                                <input type="checkbox" name="voiceEnabled" ${voice.enabled ? 'checked' : ''}>
                            </div>
                            <label>Voice Channel ID</label>
                            <input type="text" name="voiceChannelId" value="${voice.channelId || ''}" placeholder="Voice Channel ID">
                            <div class="input-hint">Jika aktif, bot otomatis join VC ini setelah login/restart. Command vjoin juga menyimpan VC terakhir ke field ini.</div>
                        </div>

                        <div class="card">
                            <label>🐉 BOSS AUTOMATION</label>
                            <div class="toggle-row">
                                <span>Enable Auto-Boss</span>
                                <input type="checkbox" name="bossEnabled" ${boss.enabled ? 'checked' : ''}>
                            </div>
                            <label>Allowed Guilds (Comma separated)</label>
                            <input type="text" name="bossGuilds" value="${(boss.allowedGuilds || []).join(',')}" placeholder="Guild ID">
                        </div>

                        <div class="card">
                            <label>🔄 CHANNEL ROTATION</label>
                            <div class="toggle-row">
                                <span>Enable Rotation</span>
                                <input type="checkbox" name="crEnabled" ${rotation.enabled ? 'checked' : ''}>
                            </div>
                            <div class="row">
                                <div class="col"><input type="number" name="crMin" value="${rotation.minMs}" placeholder="Min delay"></div>
                                <div class="col"><input type="number" name="crMax" value="${rotation.maxMs}" placeholder="Max delay"></div>
                            </div>
                        </div>

                    </div>

                    <div id="tab-control" class="tab-content">
                        <div class="category-heading">
                            <div>
                                <span class="section-label">Advanced / Add-ons</span>
                                <h3>🎮 Kontrol & Sistem</h3>
                            </div>
                            <p>Atur auto resume, kata kontrol, whitelist user, dan ukuran log dashboard.</p>
                        </div>

                        <div class="card">
                            <label>🎮 CONTROL & SYSTEM</label>
                            <div class="toggle-row">
                                <span>Auto Resume (After restart)</span>
                                <input type="checkbox" name="autoResume" ${config.settings.autoResume ? 'checked' : ''}>
                            </div>
                            <div class="divider"></div>
                            <div class="row">
                                <div class="col">
                                    <label>Start Word</label>
                                    <input type="text" name="ctrlStart" value="${control.start || 'wcash'}" placeholder="wcash">
                                </div>
                                <div class="col">
                                    <label>Pause Word</label>
                                    <input type="text" name="ctrlPause" value="${control.pause || 'wbuy 1'}" placeholder="wbuy 1">
                                </div>
                            </div>
                            <label>Allowed User IDs (Comma separated)</label>
                            <input type="text" name="ctrlAllowIds" value="${(control.allowIds || []).join(',')}" placeholder="Leave blank to allow all">
                            
                            <div class="divider"></div>
                            <label>Max Log Lines in Dashboard</label>
                            <input type="number" name="maxLogLines" value="${config.maxLogLines || 15}">
                        </div>

                    </div>
        `;
    }

    function renderSettingsTabs(context) {
        return `
                    <div class="settings-nav">
                        <button type="button" class="hamburger-btn" onclick="toggleSettingsMenu(event)" aria-expanded="false" aria-controls="settingsMenu">
                            <span aria-hidden="true">☰</span>
                            <span>Pengaturan</span>
                        </button>
                        <div class="settings-current" id="settingsCurrentLabel">Main Settings</div>
                        <div class="settings-menu" id="settingsMenu">
                            <div class="settings-menu-group">
                                <span>Dasar</span>
                                <button type="button" class="settings-menu-item active" data-menu-label="Main Settings" onclick="switchTab(event, 'tab-main')">🏠 Main Settings</button>
                            </div>
                            <div class="settings-menu-group">
                                <span>Advanced / Add-ons</span>
                                <button type="button" class="settings-menu-item" data-menu-label="Notifikasi" onclick="switchTab(event, 'tab-notifications')">📱 Notifikasi</button>
                                <button type="button" class="settings-menu-item" data-menu-label="Captcha" onclick="switchTab(event, 'tab-captcha')">🛡️ Captcha</button>
                                <button type="button" class="settings-menu-item" data-menu-label="Integrasi Sistem" onclick="switchTab(event, 'tab-integrations')">🔌 Integrasi Sistem</button>
                                <button type="button" class="settings-menu-item" data-menu-label="Safety & Filter" onclick="switchTab(event, 'tab-safety')">🛡️ Safety & Filter</button>
                                <button type="button" class="settings-menu-item" data-menu-label="Automasi" onclick="switchTab(event, 'tab-automation')">🤖 Automasi</button>
                                <button type="button" class="settings-menu-item" data-menu-label="Kontrol & Sistem" onclick="switchTab(event, 'tab-control')">🎮 Kontrol & Sistem</button>
                            </div>
                        </div>
                    </div>

${renderMainSettings(context)}
${renderAdvancedSettings(context)}
        `;
    }

    return { renderMainSettings, renderAdvancedSettings, renderSettingsTabs };
};
