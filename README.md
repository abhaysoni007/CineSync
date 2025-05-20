# CineSync

CineSync is a real-time synchronized movie watching application that allows users to watch movies together with friends from different locations.

## Features

- User authentication
- Create and join movie watching rooms
- Real-time chat with other participants
- Synchronized video playback (play, pause, seek)
- Room hosting with admin controls
- Public and private rooms

## Supabase Integration

CineSync now integrates with Supabase for real-time database functionality. This provides:

- Persistent room storage
- Cross-device synchronization
- Real-time chat and video syncing
- Secure data handling

### Setting Up Supabase

For detailed setup instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

Quick setup:

1. Make sure Supabase client is installed: `npm install @supabase/supabase-js`
2. Run the SQL scripts in Supabase SQL Editor to create the required tables
3. Enable real-time functionality for the tables in Supabase dashboard
4. Restart the application

### Environment Configuration

The application is pre-configured with the Supabase URL and anon key in `src/utils/supabase.js`.

## Development

To run the application locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Troubleshooting

If you encounter issues with room joining or real-time functionality:

1. Verify Supabase tables are properly set up
2. Check browser console for connection errors
3. Ensure real-time is enabled in Supabase dashboard
4. Try clearing browser localStorage and refreshing

## License

MIT "# CineSync" 
"# CineSync" 
