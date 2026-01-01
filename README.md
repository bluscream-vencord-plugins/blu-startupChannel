# StartupChannel

Automatically opens and scrolls to a specific channel when Discord starts.

## Features

- Automatically navigate to a configured channel on Discord startup
- Optional automatic scroll to bottom of the channel
- Works with both guild channels and DMs
- Configurable channel ID setting

## Installation

1. Copy the `blu-startupChannel` folder to your Vencord `src/userplugins` directory
2. Rebuild Vencord: `pnpm run build`
3. Restart Discord
4. Enable the plugin in Vencord settings
5. Configure the channel ID you want to open

## Configuration

- **Channel ID**: The ID of the channel to open on startup (leave empty to disable)
- **Scroll To Bottom**: Automatically scroll to the bottom of the channel after opening (default: true)
- **Enabled**: Toggle to enable/disable automatic channel opening on startup (default: true)

## Usage

1. Enable the plugin in settings
2. Enter the channel ID you want to open on startup
   - To find a channel ID, enable Developer Mode in Discord settings
   - Right-click on the channel and select "Copy ID"
   - Paste the ID into the plugin settings
3. Restart Discord to see it automatically open the configured channel

## Notes

- Channel IDs are globally unique, so you don't need to specify a server/guild ID
- The plugin works with both guild channels and direct messages
- The channel will be opened when Discord fully loads (after CONNECTION_OPEN event)

## License

GPL-3.0-or-later
