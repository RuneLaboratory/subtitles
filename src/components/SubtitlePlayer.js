import React, { useEffect, useRef, useState } from "react";
import Timer, { secondsToHms, hmsTosec } from "./Timer";
import "./SubtitlePlayer.scss";

export default function SubtitlePlayer() {
  const timer = useRef(new Timer());
  const [playerTime, setplayerTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  let videoTitle = "The Queen's Gambit";
  const englishSubtitleList = useRef([]);
  const chineseSubtitleList = useRef([]);
  const [englishSubtitle_present, setEnglishSubtitle_present] =
    useState("Loading ... ");
  const [chineseSubtitle_present, setChineseSubtitle_present] =
    useState("加载中 ... ");
  const [inputTime, setInputTime] = useState();
  const totalDuration = 3493;

  useEffect(() => {
    timer.current.onTick = (time) => {
      setplayerTime(time);
    };

    fetch("/The Queens Gambit_English_S1E1.xml")
      .then((response) => response.text())
      .then((data) => {
        const parser = new DOMParser();
        let xmlDoc = parser.parseFromString(data, "text/xml");
        let subtitles = convertXmlToSubtitle(xmlDoc);
        englishSubtitleList.current = subtitles;
      })
      .catch(console.error);

    fetch("/The Queens Gambit_Chinese_S1E1.xml")
      .then((response) => response.text())
      .then((data) => {
        const parser = new DOMParser();
        let xmlDoc = parser.parseFromString(data, "text/xml");
        let subtitles = convertXmlToSubtitle(xmlDoc);
        chineseSubtitleList.current = subtitles;
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let timerRef = timer.current;
    if (isPlaying) {
      timerRef.start();
    } else {
      timerRef.pause();
    }

    // TODO
    setInputTime("");
    
    return () => {
      timerRef.pause();
    };
  }, [isPlaying]);

  useEffect(() => {
    let eSubtitleToDisplay = englishSubtitleList.current.find(
      (subtitle) =>
        subtitle.begin > Math.trunc(playerTime * 1000) &&
        subtitle.end > Math.trunc(playerTime * 1000)
    );
    if (eSubtitleToDisplay) {
      setEnglishSubtitle_present(eSubtitleToDisplay.value);
    }

    let cSubtitleToDisplay = chineseSubtitleList.current.find(
      (subtitle) =>
        subtitle.begin > Math.trunc(playerTime * 1000) &&
        subtitle.end > Math.trunc(playerTime * 1000)
    );
    if (cSubtitleToDisplay) {
      setChineseSubtitle_present(cSubtitleToDisplay.value);
    }
  }, [playerTime]);

  useEffect(() => {
    if (inputTime) {
      timer.current.setCurrentTime(hmsTosec(inputTime));
    }
  }, [inputTime]);

  return (
    <div id="subtitlePlayer">
      <div className=".container h-100">
        <div className="row align-items-start h-25">
          <div id="videoTitle">
            <h3>{videoTitle}</h3>
          </div>
          <div id="playerTime">
            <p>
              <span className="time-sec">
                {Math.trunc(playerTime) + " Sec "}
              </span>
              <span className="time-ms">{Math.trunc(playerTime * 1000)}</span>
            </p>
            <p className="time">{secondsToHms(totalDuration - playerTime)}</p>
            <div>
              {!isPlaying ? (
                <input
                  id="inputTime"
                  type="number"
                  className="form-control"
                  onChange={(e) => setInputTime(e.target.value)}
                />
              ) : (
                <input type="hidden"></input>
              )}
            </div>
          </div>
        </div>
        <div className="row align-items-center h-50">
          <div id="subtitleDisplay">
            <div id="subtitleText_previous">
              <p>{englishSubtitle_present}</p>
              <p>{chineseSubtitle_present}</p>
            </div>
          </div>
        </div>
        <div className="row align-items-end h-25">
          <div>
            <button
              id="backward1sec-btn"
              className="btn btn-warning"
              onClick={() => timer.current.backword(1)}
            >
              -
            </button>
            <button
              id="PlayBtn"
              type="button"
              className={
                (isPlaying ? "btn btn-outline-success" : "btn btn-success") +
                " btn-lg"
              }
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              id="forward1sec-btn"
              className="btn btn-warning"
              onClick={() => timer.current.forward(1)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function convertXmlToSubtitle(xmlDoc) {
  let tickRate = xmlDoc
    .getElementsByTagName("tt")[0]
    .getAttribute("ttp:tickRate");
  let subtitleElements = xmlDoc.getElementsByTagName("p");
  let subtitleList = [];
  Array.from(subtitleElements).forEach((subtitleElement) => {
    let begin =
      (subtitleElement.getAttribute("begin").slice(0, -1) / tickRate) * 1000;
    let end =
      (subtitleElement.getAttribute("end").slice(0, -1) / tickRate) * 1000;

    let value = "";
    Array.from(subtitleElement.getElementsByTagName("span")).forEach(
      (spanElement) => {
        value += spanElement.textContent + " ";
      }
    );

    subtitleList.push({
      begin: begin,
      end: end,
      value: value,
    });
  });
  return subtitleList;
}
