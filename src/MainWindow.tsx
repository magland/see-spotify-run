import { FunctionComponent, useCallback, useEffect, useState } from "react";
import SpotifyStreamingData from "./SpotifyStreamingData";
import FunkyView1 from "./FunkyView1";

const MainWindow: FunctionComponent = () => {
  const [spotifyStreamingData, setSpotifyStreamingData] =
    useState<SpotifyStreamingData>();
  useEffect(() => {
    const sd = localStorage.getItem("spotifyData");
    if (sd) {
      setSpotifyStreamingData(JSON.parse(sd));
    }
  }, []);

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
            const data = JSON.parse(result);
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

  if (!spotifyStreamingData) {
    return (
      <div>
        <button onClick={handleUpload}>Upload spotify streaming data</button>
      </div>
    );
  }

  return (
    <FunkyView1 spotifyStreamingData={spotifyStreamingData} onDelete={handleDelete} />
  )
};

export default MainWindow;
