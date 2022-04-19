import React, { useEffect, useRef, useState } from "react";
import Timer, { secondsToHms } from "./Timer";
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
    return () => {
      timerRef.pause();
    };
  }, [isPlaying]);

  useEffect(() => {
    let eSubtitle = englishSubtitleList.current[0];
    if (eSubtitle) {
      if (eSubtitle.end < Math.trunc(playerTime * 1000)) {
        englishSubtitleList.current.shift();
      }
      if (
        eSubtitle.begin > Math.trunc(playerTime * 1000) &&
        eSubtitle.end > Math.trunc(playerTime * 1000)
      ) {
        setEnglishSubtitle_present(eSubtitle.value);
      }
    }

    let cSubtitle = chineseSubtitleList.current[0];
    if (cSubtitle) {
      if (cSubtitle.end < Math.trunc(playerTime * 1000)) {
        chineseSubtitleList.current.shift();
      }
      if (
        cSubtitle.begin > Math.trunc(playerTime * 1000) &&
        cSubtitle.end > Math.trunc(playerTime * 1000)
      ) {
        setChineseSubtitle_present(cSubtitle.value);
      }
    }
  }, [playerTime]);

  return (
    <div id="subtitlePlayer">
      <div id="videoTitle">
        <h3>{videoTitle}</h3>
      </div>
      <div id="playerTime">
        <p>
          <span>{Math.trunc(playerTime) + " Sec "}</span>
          <span>{Math.trunc(playerTime * 1000)}</span>
        </p>
        <p>{secondsToHms(playerTime)}</p>
      </div>
      <div id="subtitleDisplay">
        <div id="subtitleText_previous">
          <p>{englishSubtitle_present}</p>
          <p>{chineseSubtitle_present}</p>
        </div>
      </div>
      <div>
        <button
          id="PlayBtn"
          type="button"
          className="btn btn-primary"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
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
