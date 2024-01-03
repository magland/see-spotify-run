export type SpotifyStreamingDataRecord = {
    endTime: string; // "2022-12-05 16:52"
    artistName: string; // "Rainbow Kitten Surprise"
    trackName: string; // "It's Called: Freefall"
    msPlayed: number; // 152293
}

type SpotifyStreamingData = SpotifyStreamingDataRecord[]

export type ExtendedSpotifyStreamingDataRecord = {
    ts: string; // "2022-06-17T19:53:06Z"
    username: string; // "hhdd...."
    platform: string; // "Android OS 12 API 32 (Google, Pixel 5)"
    ms_played: number; // 227451
    conn_country: string; // "US"
    ip_addr_decrypted: string; // "...""
    user_agent_decrypted: string; // "unknown"
    master_metadata_track_name: string; // "Heroes - 2017 Remaster"
    master_metadata_album_artist_name: string; // "David Bowie"
    master_metadata_album_album_name: string; // "\"Heroes\""
    spotify_track_uri: string; // "spotify:track:7Jh1bpe76CNTCgdgAdBw4Z"
    episode_name: string | null; // null
    episode_show_name: string | null; // null
    spotify_episode_uri: string | null; // null
    reason_start: string; // "trackdone"
    reason_end: string; // "logout"
    shuffle: boolean; // false
    skipped: string; // null
    offline: boolean; // false
    offline_timestamp: number; // 1655468892023
    incognito_mode: boolean; // false
}

export default SpotifyStreamingData