//// Plugin originally written for Equicord at 2026-02-16 by https://github.com/Bluscream, https://antigravity.google
// region Imports
import { Logger } from "@utils/Logger";
import definePlugin from "@utils/types";
import {
    ChannelRouter,
    ChannelStore,
    NavigationRouter,
    SelectedChannelStore,
    Toasts
} from "@webpack/common";

import { settings } from "./settings";
// endregion Imports

// region PluginInfo
export const pluginInfo = {
    id: "startupChannel",
    name: "StartupChannel",
    description: "Automatically opens and scrolls to a specific channel when Discord starts",
    color: "#5865F2",
    authors: [
        { name: "Bluscream", id: 467777925790564352n },
        { name: "Assistant", id: 0n }
    ],
};
// endregion PluginInfo

// region Variables
const logger = new Logger(pluginInfo.id, pluginInfo.color);
// endregion Variables

// region Utils
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
// endregion Utils

// region Definition
export default definePlugin({
    name: pluginInfo.name,
    description: pluginInfo.description,
    authors: pluginInfo.authors,
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
// endregion Definition
