import React, { useEffect, useRef, useState, useCallback } from "react";
import Timer, { secondsToHms, hmsTosec } from "./Timer";
import "./SubtitlePlayer.scss";

export default function SubtitlePlayer() {
  const timer = useRef(new Timer());
  const [playerTime, setplayerTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  let videoTitle = "My Hero Academia S2E24";
  const englishSubtitleList = useRef([]);
  const chineseSubtitleList = useRef([]);
  const [englishSubtitleIndex, setEnglishSubtitleIndex] = useState(-1);
  const [chineseSubtitleIndex, setChinsesSubtitleIndex] = useState(-1);
  const [englishSubtitle_previous, setEnglishSubtitle_previous] =
    useState("\u00A0");
  const [chineseSubtitle_previous, setChineseSubtitle_previous] =
    useState("\u00A0");
  const [englishSubtitle_present, setEnglishSubtitle_present] =
    useState("\u00A0");
  const [chineseSubtitle_present, setChineseSubtitle_present] =
    useState("\u00A0");
  // const [englishSubtitle_next, setEnglishSubtitle_next] = useState("\u00A0");
  // const [chineseSubtitle_next, setChineseSubtitle_next] = useState("\u00A0");
  const [inputTime, setInputTime] = useState();
  const totalDuration = 1411;

  useEffect(() => {
    timer.current.onTick = (time) => {
      setplayerTime(time);
    };

    fetch("/My Hero Academia S2E24_EN.xml")
      .then((response) => response.text())
      .then((data) => {
        const parser = new DOMParser();
        let xmlDoc = parser.parseFromString(data, "text/xml");
        let subtitles = convertXmlToSubtitle(xmlDoc);
        englishSubtitleList.current = subtitles;
        console.log(subtitles);
      })
      .catch(console.error);

    fetch("/My Hero Academia S2E24_CN.xml")
      .then((response) => response.text())
      .then((data) => {
        const parser = new DOMParser();
        let xmlDoc = parser.parseFromString(data, "text/xml");
        let subtitles = convertXmlToSubtitle(xmlDoc);
        chineseSubtitleList.current = subtitles;
        console.log(subtitles);
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

    setInputTime(""); // TODO

    return () => {
      timerRef.pause();
    };
  }, [isPlaying]);

  useEffect(() => {
    let eIndexToDisplay = englishSubtitleList.current.findIndex((subtitle) => {
      return (
        subtitle.begin < Math.trunc(playerTime * 1000) &&
        subtitle.end > Math.trunc(playerTime * 1000)
      );
    });
    if (englishSubtitleIndex !== eIndexToDisplay) {
      setEnglishSubtitleIndex(eIndexToDisplay);
    }
    let cIndexToDisplay = chineseSubtitleList.current.findIndex((subtitle) => {
      return (
        subtitle.begin < Math.trunc(playerTime * 1000) &&
        subtitle.end > Math.trunc(playerTime * 1000)
      );
    });

    if (chineseSubtitleIndex !== cIndexToDisplay) {
      setChinsesSubtitleIndex(cIndexToDisplay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerTime]);

  const renderENSubtitle = useCallback(() => {
    if (englishSubtitleIndex >= 0) {
      setEnglishSubtitle_previous(englishSubtitle_present);
      let valueToDisplay =
        englishSubtitleList.current[englishSubtitleIndex].value;
      let nextSubtitle = englishSubtitleList.current[englishSubtitleIndex + 1];
      if (
        nextSubtitle &&
        nextSubtitle.begin < Math.trunc(playerTime * 1000) &&
        nextSubtitle.end > Math.trunc(playerTime * 1000)
      ) {
        valueToDisplay = valueToDisplay + " " + nextSubtitle.value;
      }
      console.log("value to display " + valueToDisplay);
      setEnglishSubtitle_present(valueToDisplay);
    } else {
      setTimeout(() => {
        setEnglishSubtitleIndex((prev) => {
          if (prev < 0) {
            setEnglishSubtitle_present("\u00A0");
          }
          return prev;
        });
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [englishSubtitleIndex]);

  const renderCNSubtitle = useCallback(() => {
    if (chineseSubtitleIndex >= 0) {
      setChineseSubtitle_previous(chineseSubtitle_present);
      let valueToDisplay =
        chineseSubtitleList.current[chineseSubtitleIndex].value;
      let nextSubtitle = chineseSubtitleList.current[chineseSubtitleIndex + 1];
      if (
        nextSubtitle &&
        nextSubtitle.begin < Math.trunc(playerTime * 1000) &&
        nextSubtitle.end > Math.trunc(playerTime * 1000)
      ) {
        valueToDisplay = valueToDisplay + " " + nextSubtitle.value;
      }
      setChineseSubtitle_present(valueToDisplay);
    } else {
      setTimeout(() => {
        setChinsesSubtitleIndex((prev) => {
          if (prev < 0) {
            setChineseSubtitle_present("\u00A0");
          }
          return prev;
        });
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chineseSubtitleIndex]);

  useEffect(() => {
    renderENSubtitle();
  }, [renderENSubtitle]);
  useEffect(() => {
    renderCNSubtitle();
  }, [renderCNSubtitle]);

  useEffect(() => {
    if (inputTime && inputTime >= 0) {
      timer.current.setCurrentTime(hmsTosec(inputTime));
    }
  }, [inputTime]);

  return (
    <div className="app-body container bg-light">
      <div className="app-body row">
        <div id="subtitlePlayer" className="col align-self-center">
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
                  <span className="time-ms">
                    {Math.trunc(playerTime * 1000)}
                  </span>
                </p>
                <p className="time">
                  {secondsToHms(totalDuration - playerTime)}
                </p>
                <div>
                  {!isPlaying ? (
                    <input
                      id="inputTime"
                      type="number"
                      className="form-control"
                      onChange={(e) => setInputTime(e.target.value)}
                      onFocus={(e) => setInputTime(e.target.select())}
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
                  <p>{englishSubtitle_previous}</p>
                  <p>{chineseSubtitle_previous}</p>
                </div>
                <div id="subtitleText_present">
                  <p>{englishSubtitle_present}</p>
                  <p>{chineseSubtitle_present}</p>
                </div>
              </div>
            </div>
            <div className="row align-items-end h-25 button-bar">
              <div className="col">
                <button
                  id="backward1sec-btn"
                  className="btn btn-warning"
                  onClick={() => timer.current.backword(1)}
                >
                  &#171;
                </button>
              </div>
              <div className="col">
                <button
                  id="backward05sec-btn"
                  className="btn btn-warning"
                  onClick={() => timer.current.backword(0.5)}
                >
                  &#8249;
                </button>
              </div>
              <div className="col">
                <button
                  id="PlayBtn"
                  type="button"
                  className={
                    isPlaying ? "btn btn-outline-success" : "btn btn-success"
                  }
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
              </div>
              <div className="col">
                <button
                  id="forward05sec-btn"
                  className="btn btn-warning"
                  onClick={() => timer.current.forward(0.5)}
                >
                  &#8250;
                </button>
              </div>
              <div className="col">
                <button
                  id="forward1sec-btn"
                  className="btn btn-warning"
                  onClick={() => timer.current.forward(1)}
                >
                  &#187;
                </button>
              </div>
            </div>
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

    let value = subtitleElement.textContent;
    if (!(value && value.length > 0)) {
      Array.from(subtitleElement.getElementsByTagName("span")).forEach(
        (spanElement) => {
          value += spanElement.textContent + " ";
        }
      );
    }

    subtitleList.push({
      begin: begin,
      end: end,
      value: value,
    });
  });
  return subtitleList;
}
