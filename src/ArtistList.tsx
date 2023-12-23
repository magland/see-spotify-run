import { FunctionComponent, useMemo } from "react";
import SpecialTable from "./SpecialTable";
import SpotifyStreamingData from "./SpotifyStreamingData";

type ArtistListProps = {
    width: number;
    height: number;
    spotifyStreamingData: SpotifyStreamingData;
    selectedArtists: string[];
    onSelectedArtistsChanged: (selectedArtists: string[]) => void;
};

const ArtistList: FunctionComponent<ArtistListProps> = ({spotifyStreamingData, width, height, selectedArtists, onSelectedArtistsChanged}) => {
    const uniqueArtists = useMemo(() => {
        const theSet = new Set<string>();
        for (const item of spotifyStreamingData) {
            theSet.add(item.artistName);
        }
        return Array.from(theSet).sort();
    }, [spotifyStreamingData]);
    const artistCounts = useMemo(() => {
        const theMap = new Map<string, number>();
        for (const item of spotifyStreamingData) {
            theMap.set(item.artistName, (theMap.get(item.artistName) ?? 0) + 1);
        }
        return theMap;
    }, [spotifyStreamingData]);
    const uniqueArtistsSorted = useMemo(() => {
        return uniqueArtists.sort((a, b) => {
            const aCount = artistCounts.get(a) ?? 0;
            const bCount = artistCounts.get(b) ?? 0;
            if (aCount > bCount) {
                return -1;
            }
            if (aCount < bCount) {
                return 1;
            }
            return 0;
        });
    }, [uniqueArtists, artistCounts]);
    const items = useMemo(() => {
        return uniqueArtistsSorted.map((artistName) => ({
            id: artistName,
            label: `${artistName} (${artistCounts.get(artistName)})`,
        }))
    }, [uniqueArtistsSorted, artistCounts]);
    return (
        <div style={{position: 'absolute', top: 0, left: 0, width, height, overflowY: 'auto'}}>
            <SpecialTable
                title="Artist"
                items={items}
                selectedIds={selectedArtists}
                onSelectedIdsChange={onSelectedArtistsChanged}
                selectable={true}
            />
        </div>
    )
}

export default ArtistList;
