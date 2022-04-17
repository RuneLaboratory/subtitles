import React, { useEffect, useState } from "react";
import Timer from "./Timer";

export default function SubtitlePlayer() {
  const [playerTime, setplayerTime] = useState(0);
  const [timer] = useState(new Timer());
  const [isPlaying, setIsPlaying] = useState(false);
  let videoTitle = "The Queen's Gambit";
  const [englishSubtitleList, setEnglishSubtitleList] = useState([]);
  const [chineseSubtitleList, setChineseSubtitleList] = useState([]);
  const [englishSubtitle_present, setEnglishSubtitle_present] =
    useState("Loading ... ");
  const [chineseSubtitle_present, setChineseSubtitle_present] =
    useState("加载中 ... ");

  useEffect(() => {
    timer.onTick = (time) => {
      setplayerTime(time);
    };
  }, [timer]);

  useEffect(() => {
    if (isPlaying) {
      timer.start();
    } else {
      timer.pause();
    }
    return () => {
      timer.pause();
    };
  }, [isPlaying, timer]);

  useEffect(() => {
    let renderingJob;
    function renderSubtitle() {
      let eSubtitle = englishSubtitleList[0];
      if (eSubtitle) {
        if (eSubtitle.end < Math.trunc(playerTime * 1000)) {
          englishSubtitleList.shift();
        }
        if (
          eSubtitle.begin > Math.trunc(playerTime * 1000) &&
          eSubtitle.end > Math.trunc(playerTime * 1000)
        ) {
          setEnglishSubtitle_present(eSubtitle.value);
        }
      }

      let cSubtitle = chineseSubtitleList[0];
      if (cSubtitle) {
        if (cSubtitle.end < Math.trunc(playerTime * 1000)) {
          chineseSubtitleList.shift();
        }
        if (
          cSubtitle.begin > Math.trunc(playerTime * 1000) &&
          cSubtitle.end > Math.trunc(playerTime * 1000)
        ) {
          setChineseSubtitle_present(cSubtitle.value);
        }
      }

      renderingJob = requestAnimationFrame(renderSubtitle);
    }

    if (isPlaying) {
      requestAnimationFrame(renderSubtitle);
    } else {
      cancelAnimationFrame(renderingJob);
    }

    return () => {
      cancelAnimationFrame(renderingJob);
    };
  }, [isPlaying, playerTime, englishSubtitleList, chineseSubtitleList]);

  useEffect(() => {
    fetch("/The Queens Gambit_English_S1E1.xml")
      .then((response) => response.text())
      .then((data) => {
        const parser = new DOMParser();
        let xmlDoc = parser.parseFromString(data, "text/xml");
        let subtitles = convertXmlToSubtitle(xmlDoc);
        setEnglishSubtitleList(subtitles);
        console.log(subtitles);
      })
      .catch(console.error);

    fetch("/The Queens Gambit_Chinese_S1E1.xml")
      .then((response) => response.text())
      .then((data) => {
        const parser = new DOMParser();
        let xmlDoc = parser.parseFromString(data, "text/xml");
        let subtitles = convertXmlToSubtitle(xmlDoc);
        setChineseSubtitleList(subtitles);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <div id="videoTitle">
        <h3>{videoTitle}</h3>
      </div>
      <div id="playerTime">
        <p>{Math.trunc(playerTime * 1000)}</p>
        <p>{Math.trunc(playerTime) + " sec"}</p>
      </div>
      <div id="subtitleDisplay">
        <div id="subtitleText_previous">
          <p>{englishSubtitle_present}</p>
          <p>{chineseSubtitle_present}</p>
        </div>
      </div>
      <div>
        <button id="PlayPauseBtn" onClick={() => setIsPlaying(!isPlaying)}>
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
