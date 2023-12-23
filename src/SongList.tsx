import { FunctionComponent, useMemo } from "react";
import SpecialTable from "./SpecialTable";
import SpotifyStreamingData from "./SpotifyStreamingData";

type SongListProps = {
    width: number;
    height: number;
    spotifyStreamingData: SpotifyStreamingData;
    selectedArtists: string[];
    selectedSongs: string[];
    onSelectedSongsChanged: (selectedSongs: string[]) => void;
};

const SongList: FunctionComponent<SongListProps> = ({spotifyStreamingData, width, height, selectedArtists, selectedSongs, onSelectedSongsChanged}) => {
    const uniqueSongs = useMemo(() => {
        const theSet = new Set<string>();
        for (const item of spotifyStreamingData) {
            if (selectedArtists.length === 0 || selectedArtists.includes(item.artistName)) {
                theSet.add(item.artistName + '|' + item.trackName);
            }
        }
        return Array.from(theSet).sort();
    }, [spotifyStreamingData, selectedArtists]);
    const songCounts = useMemo(() => {
        const theMap = new Map<string, number>();
        for (const item of spotifyStreamingData) {
            if (selectedArtists.length === 0 || selectedArtists.includes(item.artistName)) {
                theMap.set(item.artistName + '|' + item.trackName, (theMap.get(item.artistName + '|' + item.trackName) ?? 0) + 1);
            }
        }
        return theMap;
    }, [spotifyStreamingData, selectedArtists]);
    const uniqueSongsSorted = useMemo(() => {
        return uniqueSongs.sort((a, b) => {
            const aCount = songCounts.get(a) ?? 0;
            const bCount = songCounts.get(b) ?? 0;
            if (aCount > bCount) {
                return -1;
            }
            if (aCount < bCount) {
                return 1;
            }
            return 0;
        });
    }, [uniqueSongs, songCounts]);
    const items = useMemo(() => {
        return uniqueSongsSorted.map((songName) => ({
            id: songName,
            label: `${songName.split('|')[1]} (${songCounts.get(songName)})`
        }));
    }, [uniqueSongsSorted, songCounts]);
    return (
        <div style={{position: 'absolute', top: 0, left: 0, width, height, overflowY: 'auto'}}>
            <SpecialTable
                title="Song"
                items={items}
                selectedIds={selectedSongs}
                onSelectedIdsChange={onSelectedSongsChanged}
                selectable={true}
            />
        </div>
    )
}

export default SongList;
