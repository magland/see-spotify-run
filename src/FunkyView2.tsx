import { FunctionComponent, useEffect, useMemo, useState } from "react";
import SpotifyStreamingData from "./SpotifyStreamingData";
import { Hyperlink, useWindowDimensions } from "@fi-sci/misc";
import { Splitter } from "@fi-sci/splitter";
import ArtistList from "./ArtistList";
import SongList from "./SongList";
import ListenList from "./ListenList";
import { TimeFilter, timeFilterIncludes } from "./MainWindow";

type FunkyView2Props = {
    spotifyStreamingData: SpotifyStreamingData;
    onTimeFilterChanged: (timeFilter: TimeFilter) => void;
    onBlastOff: () => void;
};

export type MonthTimeFilter = {
    use: boolean;
    beginMonth: number; // 1-12
    beginYear: number; // 2015-2021
    endMonth: number; // 1-12
    endYear: number; // 2015-2021
}

const monthTimeFilterToTimeFilter = (monthTimeFilter: MonthTimeFilter): TimeFilter => {
    const beginMonthTwoDigits = monthTimeFilter.beginMonth < 10 ? '0' + monthTimeFilter.beginMonth : monthTimeFilter.beginMonth;
    const beginDate = `${monthTimeFilter.beginYear}-${beginMonthTwoDigits}-01`;
    // last day of month
    // month is 0-indexed so here we are getting the last day of endMonth
    const date = new Date(monthTimeFilter.endYear, monthTimeFilter.endMonth, 0);
    const endMonthTwoDigits = monthTimeFilter.endMonth < 10 ? '0' + monthTimeFilter.endMonth : monthTimeFilter.endMonth;
    const endDateTwoDigits = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const endDate = `${monthTimeFilter.endYear}-${endMonthTwoDigits}-${endDateTwoDigits}`;
    return {use: monthTimeFilter.use, beginDate, endDate};
}

const correctMonthTimeFilter = (monthTimeFilter: MonthTimeFilter): MonthTimeFilter => {
    // if end month is before begin month, put end month equal to begin month
    if (monthTimeFilter.endYear < monthTimeFilter.beginYear) {
        return {...monthTimeFilter, endMonth: monthTimeFilter.beginMonth, endYear: monthTimeFilter.beginYear};
    }
    if (monthTimeFilter.endYear === monthTimeFilter.beginYear && monthTimeFilter.endMonth < monthTimeFilter.beginMonth) {
        return {...monthTimeFilter, endMonth: monthTimeFilter.beginMonth};
    }
    return monthTimeFilter;
}

const FunkyView2: FunctionComponent<FunkyView2Props> = ({spotifyStreamingData, onTimeFilterChanged, onBlastOff}) => {
    const {width, height} = useWindowDimensions();
    const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
    const [monthTimeFilter, setMonthTimeFilter] = useState<MonthTimeFilter>({use: false, beginMonth: 1, beginYear: 2023, endMonth: 12, endYear: 2023}); // will be set in useEffect below
    const timeFilter = useMemo(() => monthTimeFilterToTimeFilter(monthTimeFilter), [monthTimeFilter]);
    useEffect(() => {
        const newMonthTimeFilter = correctMonthTimeFilter(monthTimeFilter);
        if (newMonthTimeFilter !== monthTimeFilter) {
            setMonthTimeFilter(newMonthTimeFilter);
        }
    }, [monthTimeFilter]);
    const topBarHeight = 28;
    const spotifyStreamingDataFiltered = useMemo(() => (
        spotifyStreamingData.filter((item) => timeFilterIncludes(timeFilter, item.endTime))
    ), [spotifyStreamingData, timeFilter])
    const totalRangeMonthTimeFilter = useMemo(() => {
        const beginYear = Math.min(...spotifyStreamingData.map((item) => parseInt(item.endTime.split('-')[0])));
        const endYear = Math.max(...spotifyStreamingData.map((item) => parseInt(item.endTime.split('-')[0])));
        const beginMonth = Math.min(...spotifyStreamingData.filter((item) => parseInt(item.endTime.split('-')[0]) === beginYear).map((item) => parseInt(item.endTime.split('-')[1])));
        const endMonth = Math.max(...spotifyStreamingData.filter((item) => parseInt(item.endTime.split('-')[0]) === endYear).map((item) => parseInt(item.endTime.split('-')[1])));
        return {use: true, beginMonth, beginYear, endMonth, endYear};
    }, [spotifyStreamingData]);
    useEffect(() => {
        setMonthTimeFilter(totalRangeMonthTimeFilter);
    }, [totalRangeMonthTimeFilter]);
    useEffect(() => {
        onTimeFilterChanged(timeFilter);
    }, [timeFilter, onTimeFilterChanged]);
    return (
        <div style={{position: 'absolute', width, height}}>
            <div style={{position: 'absolute', top: 0, left: 0, width, height: topBarHeight, backgroundColor: 'black', color: 'white'}}>
                <TopBar monthTimeFilter={monthTimeFilter} onMonthTimeFilterChanged={setMonthTimeFilter} totalRangeMonthTimeFilter={totalRangeMonthTimeFilter} onBlastOff={onBlastOff} />
            </div>
            <div style={{position: 'absolute', top: topBarHeight, left: 0, width, height: height - topBarHeight, backgroundColor: 'white', color: 'black'}}>
                <Splitter
                    width={width}
                    height={height}
                    initialPosition={width / 3}
                >
                    <ArtistList
                        width={0}
                        height={0}
                        spotifyStreamingData={spotifyStreamingDataFiltered}
                        selectedArtists={selectedArtists}
                        onSelectedArtistsChanged={setSelectedArtists}
                    />
                    <RightSection
                        width={0}
                        height={0}
                        spotifyStreamingData={spotifyStreamingDataFiltered}
                        selectedArtists={selectedArtists}
                    />
                </Splitter>
            </div>
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
            initialPosition={width / 2}
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

type TopBarProps = {
    monthTimeFilter: MonthTimeFilter;
    onMonthTimeFilterChanged: (monthTimeFilter: MonthTimeFilter) => void;
    totalRangeMonthTimeFilter: MonthTimeFilter;
    onBlastOff: () => void;
};

const TopBar: FunctionComponent<TopBarProps> = ({monthTimeFilter, onMonthTimeFilterChanged, totalRangeMonthTimeFilter, onBlastOff}) => {
    const allMonthChoices: {month: number, year: number}[] = useMemo(() => {
        const choices: {month: number, year: number}[] = [];
        for (let year = totalRangeMonthTimeFilter.beginYear; year <= totalRangeMonthTimeFilter.endYear; year++) {
            const monthMin = year === totalRangeMonthTimeFilter.beginYear ? totalRangeMonthTimeFilter.beginMonth : 1;
            const monthMax = year === totalRangeMonthTimeFilter.endYear ? totalRangeMonthTimeFilter.endMonth : 12;
            for (let month = monthMin; month <= monthMax; month++) {
                choices.push({month, year});
            }
        }
        return choices;
    }, [totalRangeMonthTimeFilter]);
    return (
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <div style={{padding: 5}}>Time Filter</div>
            <input
                type="checkbox"
                checked={monthTimeFilter.use}
                onChange={(e) => onMonthTimeFilterChanged({...monthTimeFilter, use: e.target.checked})}
            />
            {
                monthTimeFilter.use && (
                    <>
                        <div style={{padding: 5}}>From</div>
                        <MonthSelect
                            month={monthTimeFilter.beginMonth}
                            year={monthTimeFilter.beginYear}
                            allMonthChoices={allMonthChoices}
                            onMonthChanged={(month, year) => onMonthTimeFilterChanged({...monthTimeFilter, beginMonth: month, beginYear: year})}
                        />
                        <div style={{padding: 5}}>To</div>
                        <MonthSelect
                            month={monthTimeFilter.endMonth}
                            year={monthTimeFilter.endYear}
                            allMonthChoices={allMonthChoices}
                            onMonthChanged={(month, year) => onMonthTimeFilterChanged({...monthTimeFilter, endMonth: month, endYear: year})}
                        /> 
                    </>
                )
            }
            &nbsp;&nbsp;&nbsp;
            <Hyperlink onClick={onBlastOff} color="white">Blast Off</Hyperlink>
        </div>
    )
}

type MonthSelectProps = {
    month: number;
    year: number;
    onMonthChanged: (month: number, year: number) => void;
    allMonthChoices: {month: number, year: number}[];
};

const MonthSelect: FunctionComponent<MonthSelectProps> = ({month, year, onMonthChanged, allMonthChoices}) => {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sept', 'Oct', 'Nov','Dec'
    ];
    return (
        <select
            value={month + ':' + year}
            onChange={(e) => {
                const [month, year] = e.target.value.split(':').map((v) => parseInt(v));
                onMonthChanged(month, year);
            }}
        >
            {
                allMonthChoices.map((choice, i) => (
                    <option key={i} value={choice.month + ':' + choice.year}>{months[choice.month - 1]} {choice.year}</option>
                ))
            }
        </select>
    )
}

export default FunkyView2;