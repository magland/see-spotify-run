import { FunctionComponent, useEffect, useMemo, useReducer } from "react";
import SpotifyStreamingData from "./SpotifyStreamingData";
import { useWindowDimensions } from "@fi-sci/misc";

type FunkyView1Props = {
    spotifyStreamingData: SpotifyStreamingData;
    onDelete: () => void;
    onSkip: () => void;
};

type Item = {
    id: string;
    name: string;
    artist: string;
    position: [number, number, number];
    velocity: [number, number, number];
    color: string;
}

type State = {
    spotifyStreamingData: SpotifyStreamingData;
    lastUpdated: number;
    items: Item[];
    lastIndexAdded: number;
    amp: number // pixels per second
};

const defaultState: State = {
    spotifyStreamingData: [],
    lastUpdated: Date.now(),
    items: [],
    lastIndexAdded: -1,
    amp: 50
};

type Action = {
    type: 'evolve';
    width: number;
    height: number;
} | {
    type: 'add';
} | {
    type: 'set-spotify-streaming-data';
    spotifyStreamingData: SpotifyStreamingData;
}

const funkyView1Reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'evolve': {
            const elapsed = (Date.now() - state.lastUpdated) / 1000;
            const W = Math.min(Math.max(action.width, 700), 1200);
            const H = Math.min(Math.max(action.height, 700), 1200);
            return {
                ...state,
                items: state.items.map(item => {
                    const [x, y, z] = item.position;
                    const [vx, vy, vz] = item.velocity;
                    const newPosition = [x + vx * elapsed, y + vy * elapsed, z + vz * elapsed] as [number, number, number];
                    return {
                        ...item,
                        position: newPosition
                    };
                }).filter(item => {
                    if ((item.position[0] < -W / 2 || item.position[0] > H / 2) ||
                        (item.position[1] < -W / 2 || item.position[1] > H / 2)) {
                        return false;
                    }
                    return true;
                }),
                lastUpdated: Date.now(),
                amp: state.amp + 5 * elapsed,
            };
        }
        case 'add': {
            const numToAdd = Math.min(200 - state.items.length, 2);
            const newItems: Item[] = [];
            let numAdded = 0;
            const includedIds = new Set(state.items.map(item => item.id));
            let lastIndexAdded = state.lastIndexAdded;
            // eslint-disable-next-line no-constant-condition
            while (true) {
                if (numAdded >= numToAdd) {
                    break;
                }
                const indexToAdd = lastIndexAdded + 1;
                if (indexToAdd >= state.spotifyStreamingData.length) {
                    // indexToAdd = 0;
                    break;
                }
                const item = state.spotifyStreamingData[indexToAdd];
                if (!includedIds.has(`${indexToAdd}`)) {
                    newItems.push({
                        id: `${indexToAdd}`,
                        name: item.artistName + '|' + item.trackName,
                        artist: item.artistName,
                        position: [0, 0, 0],
                        velocity: randomVelocity(state.amp),
                        color: colorForArtist(item.artistName),
                    });
                    numAdded++;
                }
                lastIndexAdded = indexToAdd;
                numAdded++;
                if (lastIndexAdded === state.lastIndexAdded) {
                    // we cycled around and didn't find any new items to add
                    break;
                }
            }
            return {
                ...state,
                lastIndexAdded,
                items: [...state.items, ...newItems],
            };
        }
        case 'set-spotify-streaming-data': {
            return {
                ...state,
                spotifyStreamingData: action.spotifyStreamingData,
            }
        }
        default:
            return state;
    }
}

const FunkyView1: FunctionComponent<FunkyView1Props> = ({spotifyStreamingData, onDelete, onSkip}) => {
    const [state, dispatch] = useReducer(funkyView1Reducer, defaultState)

    useEffect(() => {
        dispatch({
            type: 'set-spotify-streaming-data',
            spotifyStreamingData
        })
    }, [spotifyStreamingData]);

    const {width, height} = useWindowDimensions()

    useEffect(() => {
        const interval = setInterval(() => {
            dispatch({type: 'evolve', width, height});
            dispatch({type: 'add'});
        }, 1000 / 60);
        return () => {
            clearInterval(interval);
        };
    }, [width, height]);

    const currentDate = useMemo(() => {
        if (state.lastIndexAdded >= state.spotifyStreamingData.length) {
            return null;
        }
        if (state.lastIndexAdded < 0) {
            return null;
        }
        return state.spotifyStreamingData[state.lastIndexAdded].endTime;
    }, [state.spotifyStreamingData, state.lastIndexAdded]);

    const maxArtist = useMemo(() => {
        const artistCounts = new Map<string, number>();
        for (const item of state.items) {
            const count = artistCounts.get(item.artist) || 0;
            artistCounts.set(item.artist, count + 1);
        }
        let maxCount = 0;
        let maxArtist = '';
        for (const [artist, count] of artistCounts.entries()) {
            if (count > maxCount) {
                maxCount = count;
                maxArtist = artist;
            }
        }
        return maxArtist;
    }, [state.items]);

    return (
        <div style={{position: 'absolute', width, height, overflow: 'hidden', background: 'black', cursor: 'crosshair'}}>
            {
                state.items.map((item) => (
                    <div key={item.id} style={{
                        position: 'absolute',
                        left: width / 2 + item.position[0],
                        top: height / 2 + item.position[1],
                        width: 200,
                        // transform: `translate(-50%, -50%) translate3d(${item.position[2]}px, 0, 0)`,
                        transform: `translate(-50%, -50%)`,
                        color: item.color,
                        // font size depends on z position
                        fontSize: 20 * (1 + item.position[2] / 1000),
                    }}>
                        {item.name}
                    </div>
                ))
            }
            <StatusBar currentDate={currentDate} maxArtist={maxArtist} width={width} />
            <BottomBar width={width} top={height - 30} onDelete={onDelete} onSkip={onSkip} />
        </div>
    );
};

const StatusBar: FunctionComponent<{currentDate: string | null, maxArtist: string, width: number}> = ({currentDate, maxArtist, width}) => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width,
            height: 30,
            background: 'black',
            color: 'white',
            fontSize: 20,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            {currentDate}
            &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
            <span style={{color: colorForArtist(maxArtist)}}>
                {maxArtist}
            </span>
        </div>
    )
}

const BottomBar: FunctionComponent<{width: number, top: number, onDelete: () => void, onSkip: () => void}> = ({width, top, onDelete, onSkip}) => {
    return (
        <div style={{
            position: 'absolute',
            top: top,
            left: 0,
            width,
            height: 30,
            background: 'black',
            color: 'white',
            fontSize: 20,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <a href="#" onClick={() => window.location.reload()}>reload</a>
            &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
            <a href="#" onClick={onDelete}>delete</a>
            &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
            <a href="#" onClick={onSkip}>skip</a>
        </div>
    )
}

const randomVelocity = (amp: number): [number, number, number] => {
    const x = (Math.random() * 2 - 1) * amp;
    const y = (Math.random() * 2 - 1) * amp;
    const z = (Math.random() * 2 - 1) * amp;
    return [x, y, z];
}

const randomBrightColor = (): string => {
    const r = 128 + Math.floor(Math.random() * 127);
    const g = 128 + Math.floor(Math.random() * 127);
    const b = 255 - Math.floor(Math.random() * 255);
    const a = 0.7;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const colorsForArtists = new Map<string, string>();
const colorForArtist = (artistName: string): string => {
    if (!colorsForArtists.has(artistName)) {
        colorsForArtists.set(artistName, randomBrightColor());
    }
    return colorsForArtists.get(artistName)!;
}

export default FunkyView1;