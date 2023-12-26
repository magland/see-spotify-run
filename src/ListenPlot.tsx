import { FunctionComponent, useMemo, useState } from "react";
import SpotifyStreamingData from "./SpotifyStreamingData";
import Plot from 'react-plotly.js';
import { Data, PlotType } from "plotly.js";

type ListenPlotProps = {
    width: number;
    height: number;
    spotifyStreamingDataFiltered: SpotifyStreamingData;
    selectedSongs: string[];
    selectedArtists: string[];
};

const ListenPlot: FunctionComponent<ListenPlotProps> = ({spotifyStreamingDataFiltered, width, height, selectedSongs, selectedArtists}) => {
    const listenDates = useMemo(() => {
        return spotifyStreamingDataFiltered.filter(item => {
            if (selectedSongs.length > 0) {
                return selectedSongs.includes(item.artistName + '|' + item.trackName);
            }
            else if (selectedArtists.length > 0) {
                return selectedArtists.includes(item.artistName);
            }
            else {
                return true;
            }
        }).map((item) => item.endTime);
    }, [spotifyStreamingDataFiltered, selectedSongs, selectedArtists]);
    const [groupMode, setGroupMode] = useState<'day' | 'week'>('week');
    if (listenDates.length === 0) {
        return <div>No track listens selected.</div>
    }
    const bottomBarHeight = 30;
    return (
        <div style={{position: 'absolute', top: 0, left: 0, width, height, overflow: 'hidden'}}>
            <ListenPlot2
                listenDates={listenDates}
                width={width}
                height={height - bottomBarHeight}
                groupMode={groupMode}
            />
            <div style={{position: 'absolute', top: height - bottomBarHeight, left: 0, width, height: bottomBarHeight, background: 'lightgray', color: 'black'}}>
                <SelectGroupMode groupMode={groupMode} setGroupMode={setGroupMode} />
            </div>
        </div>
    )
}

type ListenPlot2Props = {
    listenDates: string[];
    width: number;
    height: number;
    groupMode: 'day' | 'week';
};

const ListenPlot2: FunctionComponent<ListenPlot2Props> = ({listenDates, width, height, groupMode}) => {
    const data = useMemo(() => {
        const allDates = new Set(listenDates);
        for (const date of listenDates) {
            allDates.add(date.split(' ')[0])
        }
        const minDate = Math.min(...Array.from(allDates).map(date => new Date(date).getTime()));
        const maxDate = Math.max(...Array.from(allDates).map(date => new Date(date).getTime()));
        const everyDateBetweenMinAndMax: string[] = [];
        for (let date = minDate; date <= maxDate; date += 1000 * 60 * 60 * 24) {
            everyDateBetweenMinAndMax.push(new Date(date).toISOString().split('T')[0]);
        }
        const allCounts = new Map<string, number>();
        for (const date of everyDateBetweenMinAndMax) {
            allCounts.set(date, 0);
        }
        for (const date of listenDates) {
            allCounts.set(date.split(' ')[0], (allCounts.get(date.split(' ')[0]) ?? 0) + 1);
        }
        const x = everyDateBetweenMinAndMax;
        const y = everyDateBetweenMinAndMax.map(date => allCounts.get(date) ?? 0);
        return [{
            x,
            y,
            type: 'bar' as PlotType
        }];
    }, [listenDates]);
    const dataGroupedByWeek = useMemo(() => {
        const x2: string[] = [];
        const y2: number[] = [];
        for (let i = 0; i < data[0].x.length; i+=7) {
            x2.push(data[0].x[i]);
            y2.push(data[0].y.slice(i, i + 7).reduce((a, b) => a + b, 0));
        }
        return [{
            ...data[0],
            x: x2,
            y: y2
        }];
    }, [data]);
    return (
        <Plot
            data={groupMode === 'day' ? data : dataGroupedByWeek}
            layout={{
                width,
                height,
                title: 'Listen Count by Date',
                xaxis: {
                    title: 'Date',
                },
                yaxis: {
                    title: 'Listen Count',
                },
            }}
        />
    )
}

type SelectGroupModeProps = {
    groupMode: 'day' | 'week';
    setGroupMode: (groupMode: 'day' | 'week') => void;
};

const SelectGroupMode: FunctionComponent<SelectGroupModeProps> = ({groupMode, setGroupMode}) => {
    return (
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
            <div style={{marginRight: 10}}>Group by:</div>
            <div style={{marginRight: 10}}>
                <input type="radio" id="day" name="groupMode" value="day" checked={groupMode === 'day'} onChange={() => setGroupMode('day')} />
                <label htmlFor="day">Day</label>
            </div>
            <div>
                <input type="radio" id="week" name="groupMode" value="week" checked={groupMode === 'week'} onChange={() => setGroupMode('week')} />
                <label htmlFor="week">Week</label>
            </div>
        </div>
    )
}

export default ListenPlot;