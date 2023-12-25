import { FunctionComponent, useMemo } from "react";
import SpecialTable from "./SpecialTable";
import SpotifyStreamingData from "./SpotifyStreamingData";

type ListenListProps = {
    width: number;
    height: number;
    spotifyStreamingData: SpotifyStreamingData;
    selectedSongs: string[];
};

const ListenList: FunctionComponent<ListenListProps> = ({spotifyStreamingData, width, height, selectedSongs}) => {
    const listens = useMemo(() => {
        return spotifyStreamingData.filter((item) => selectedSongs.includes(item.artistName + '|' + item.trackName));
    }, [spotifyStreamingData, selectedSongs]);
    const items = useMemo(() => {
        return listens.map((listen, i) => ({
            id: `${i}`,
            label: `${listen.endTime} (${Math.floor(listen.msPlayed / 1000)}s)`,
        }));
    }, [listens]);
    return (
        <div style={{position: 'absolute', top: 0, left: 0, width, height, overflowY: 'auto'}}>
            <SpecialTable
                title={selectedSongs.length === 0 ? "Listen" : `${selectedSongs[0]} listens`}
                items={items}
                selectable={false}
                selectedIds={selectedSongs}
                onSelectedIdsChange={() => {}}
            />
        </div>
    )
}

export default ListenList;
