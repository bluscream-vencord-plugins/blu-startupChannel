/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType } from "@utils/types";
import { ChannelRouter, ChannelStore, NavigationRouter, SelectedChannelStore, Toasts } from "@webpack/common";

const logger = new Logger("StartupChannel", "#5865F2");

export const settings = definePluginSettings({
    channelId: {
        type: OptionType.STRING,
        description: "Channel ID to open on startup (leave empty to disable)",
        placeholder: "123456789012345678",
        default: ""
    },
    scrollToBottom: {
        type: OptionType.BOOLEAN,
        description: "Automatically scroll to bottom of channel after opening",
        default: true
    },
    enabled: {
        type: OptionType.BOOLEAN,
        description: "Enable automatic channel opening on startup",
        default: true
    }
});

function scrollChannelToBottom() {
    // Wait a bit for the channel to load, then scroll to bottom
    setTimeout(() => {
        const scrollContainer = document.querySelector('[class*="scroller"][class*="chat"]') as HTMLElement;
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        } else {
            // Alternative selector
            const altContainer = document.querySelector('[class*="messagesWrapper"]') as HTMLElement;
            if (altContainer) {
                altContainer.scrollTop = altContainer.scrollHeight;
            }
        }
    }, 500);
}

async function openStartupChannel() {
    const channelId = settings.store.channelId?.trim();
    if (!channelId || !settings.store.enabled) {
        return;
    }

    try {
        // Check if channel exists
        const channel = ChannelStore.getChannel(channelId);
        if (!channel) {
            logger.warn(`Channel ${channelId} not found in store. Attempting navigation anyway...`);
            // Try navigation anyway - channel might load after connection
            ChannelRouter.transitionToChannel(channelId);
            return;
        }

        // Get guild ID from channel (null for DMs)
        const guildId = channel.guild_id || "@me";

        // Navigate to the channel
        if (guildId === "@me") {
            // DM channel - use channel router
            ChannelRouter.transitionToChannel(channelId);
        } else {
            // Guild channel - use navigation router with guild
            NavigationRouter.transitionToGuild(guildId, channelId);
        }

        logger.info(`Navigated to channel ${channelId} in ${guildId === "@me" ? "DM" : `guild ${guildId}`}`);

        // Scroll to bottom if enabled
        if (settings.store.scrollToBottom) {
            scrollChannelToBottom();
        }
    } catch (error: any) {
        logger.error("Failed to open startup channel:", error);
        Toasts.show({
            type: Toasts.Type.FAILURE,
            message: `Failed to open startup channel: ${error.message || error}`,
            id: Toasts.genId()
        });
    }
}

export default definePlugin({
    name: "StartupChannel",
    description: "Automatically opens and scrolls to a specific channel when Discord starts",
    authors: [
        { name: "Bluscream", id: 467777925790564352n },
        { name: "Cursor.AI", id: 0n }
    ],
    settings,

    flux: {
        CONNECTION_OPEN() {
            // Wait a bit for Discord to fully initialize
            setTimeout(() => {
                openStartupChannel();
            }, 1000);
        }
    },

    async start() {
        // Also try on plugin start if Discord is already loaded
        if (SelectedChannelStore.getChannelId()) {
            // Discord is already loaded, wait a moment then navigate
            setTimeout(() => {
                openStartupChannel();
            }, 500);
        }
    }
});
