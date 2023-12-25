import { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import SpotifyStreamingData from "./SpotifyStreamingData";
import FunkyView1 from "./FunkyView1";
import { useWindowDimensions } from "@fi-sci/misc";
import FunkyView2 from "./FunkyView2";

export type TimeFilter = {
  use: boolean
  beginDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
};

export const timeFilterIncludes = (timeFilter: TimeFilter, date: string) => {
  if (!timeFilter.use) {
      return true;
  }
  const date0 = date.split(' ')[0];
  if (date0 < timeFilter.beginDate) {
      return false;
  }
  if (date0 > timeFilter.endDate) {
      return false;
  }
  return true;
}

const MainWindow: FunctionComponent = () => {
  const [spotifyStreamingData, setSpotifyStreamingData] =
    useState<SpotifyStreamingData>();
  const [timeFilter, setTimeFilter] = useState<TimeFilter | undefined>(undefined);
  useEffect(() => {
    const sd = localStorage.getItem("spotifyData");
    if (sd) {
      try {
        setSpotifyStreamingData(JSON.parse(sd));
      }
      catch (e) {
        console.error(e);
        console.warn('Problem parsing spotify data from local storage')
      }
    }
  }, []);

  const [mode, setMode] = useState<'funky-view-1' | 'funky-view-2'>('funky-view-2');

  const handleUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === "string") {
            let data
            try {
              data = JSON.parse(result);
            }
            catch (e) {
              console.error(e);
              console.warn('Problem parsing spotify data from file')
            }
            localStorage.setItem("spotifyData", JSON.stringify(data));
            setSpotifyStreamingData(data);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const handleDelete = useCallback(() => {
    localStorage.removeItem("spotifyData");
    setSpotifyStreamingData(undefined);
  }, []);

  const {width, height} = useWindowDimensions();

  const handleExit = useCallback(() => {
    setMode('funky-view-2');
  }, []);

  const spotifyStreamingDataFiltered = useMemo(() => {
    if (!spotifyStreamingData) {
      return undefined;
    }
    if (!timeFilter) {
      return spotifyStreamingData;
    }
    return spotifyStreamingData.filter((item) => timeFilterIncludes(timeFilter, item.endTime));
  }, [spotifyStreamingData, timeFilter]);

  if (!spotifyStreamingData) {
    return (
      <div style={{position: 'absolute', width, height}}>
        {/* Centered */}
        <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
          <button onClick={handleUpload}>Upload spotify streaming data</button>
        </div>
      </div>
    );
  }

  if (mode === 'funky-view-2') {
    return (
      <FunkyView2 spotifyStreamingData={spotifyStreamingData} onTimeFilterChanged={setTimeFilter} onBlastOff={() => setMode('funky-view-1')} />
    );
  }
  else {
    return (
      spotifyStreamingDataFiltered ? <FunkyView1 spotifyStreamingData={spotifyStreamingDataFiltered} onDelete={handleDelete} onExit={handleExit} /> : <span />
    )
  }
};

export default MainWindow;
