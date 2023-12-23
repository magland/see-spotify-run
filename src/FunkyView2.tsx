import { FunctionComponent, useState } from "react";
import SpotifyStreamingData from "./SpotifyStreamingData";
import { useWindowDimensions } from "@fi-sci/misc";
import { Splitter } from "@fi-sci/splitter";
import ArtistList from "./ArtistList";
import SongList from "./SongList";
import ListenList from "./ListenList";

type FunkyView2Props = {
    spotifyStreamingData: SpotifyStreamingData;
};

const FunkyView2: FunctionComponent<FunkyView2Props> = ({spotifyStreamingData}) => {
    const {width, height} = useWindowDimensions();
    const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
    return (
        <div style={{position: 'absolute', top: 0, left: 0, width, height, overflowY: 'auto'}}>
            <Splitter
                width={width}
                height={height}
                initialPosition={width / 3}
            >
                <ArtistList
                    width={0}
                    height={0}
                    spotifyStreamingData={spotifyStreamingData}
                    selectedArtists={selectedArtists}
                    onSelectedArtistsChanged={setSelectedArtists}
                />
                <RightSection
                    width={0}
                    height={0}
                    spotifyStreamingData={spotifyStreamingData}
                    selectedArtists={selectedArtists}
                />
            </Splitter>
        </div>
    )
};

type RightSectionProps = {
    width: number;
    height: number;
    spotifyStreamingData: SpotifyStreamingData;
    selectedArtists: string[];
};

const RightSection: FunctionComponent<RightSectionProps> = ({width, height, spotifyStreamingData, selectedArtists}) => {
    const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={height / 2}
        >
            <SongList
                width={0}
                height={0}
                spotifyStreamingData={spotifyStreamingData}
                selectedArtists={selectedArtists}
                selectedSongs={selectedSongs}
                onSelectedSongsChanged={setSelectedSongs}
            />
            <ListenList
                width={0}
                height={0}
                spotifyStreamingData={spotifyStreamingData}
                selectedSongs={selectedSongs}
            />
        </Splitter>
    )
}

export default FunkyView2;