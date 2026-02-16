import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const settings = definePluginSettings({
    channelId: {
        type: OptionType.STRING,
        description: "The ID of the channel to open on startup",
        placeholder: "123456789012345678",
        default: "",
        restartNeeded: false,
    },
    scrollToBottom: {
        type: OptionType.BOOLEAN,
        description: "Whether to automatically scroll to the bottom of the channel after opening",
        default: true,
        restartNeeded: false,
    },
    enabled: {
        type: OptionType.BOOLEAN,
        description: "Whether to enable the automatic channel opening on startup",
        default: true,
        restartNeeded: false,
    }
});
