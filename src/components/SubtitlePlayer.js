import React, { useEffect, useRef, useState } from "react";
import Timer, { secondsToHms, hmsTosec } from "./Timer";
import "./SubtitlePlayer.scss";

export default function SubtitlePlayer(props) {
  const timer = useRef(new Timer());
  const [playerTime, setplayerTime] = useState(0);
  const [checkRange, setCheckRange] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [subtitlesENCN, setSubtitlesENCN] = useState([]);
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [inputTime, setInputTime] = useState();
  const totalDuration = 1411;
  // const music = useRef(new Audio("/sound_of_silence.mp3"));
  const [enableAutoPlay, setEnableAutoPlay] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    console.log(props);

    window.addEventListener("blur", () => {
      setEnableAutoPlay((prev) => {
        if (prev) {
          setIsPlaying(true);
        }
        return prev;
      });
    });

    setMsg("---");
    if (!(navigator.userAgent.includes("iPad") || navigator.userAgent.includes("Mac"))) {
      setMsg(navigator.userAgent + " . ");
      window.addEventListener("focus", () => {
        setEnableAutoPlay((prev) => {
          if (prev) {
            setIsPlaying(false);
          }
          return prev;
        });
      });
    }

    timer.current.onTick = (time) => {
      setplayerTime(time);
    };

    Promise.all([fetchSubtitleFile(props.subtitle.FilePath_EN), fetchSubtitleFile(props.subtitle.FilePath_CN)])
      .then((xmlDoc) => {
        const subtitlesENCN = generateSubtitleElement(xmlDoc[0], xmlDoc[1]);
        setSubtitlesENCN(subtitlesENCN);
      })
      .catch((ex) => {
        console.error(ex);
      });
  }, [props]);

  useEffect(() => {
    let timerRef = timer.current;
    if (isPlaying) {
      timerRef.start();
    } else {
      // if (enableAutoPlay) {
      //   music.current.play();
      // }
      timerRef.pause();
    }

    setInputTime(""); // TODO

    return () => {
      timerRef.pause();
    };
  }, [isPlaying, enableAutoPlay]);

  useEffect(() => {
    const lis = document.querySelectorAll("#subtitleDisplay li");
    let nextLi = null;
    if (checkRange < 0) {
      console.log("check all");
      const nextLiIndex = Array.from(lis).findIndex(
        (li) => li.dataset.begin <= playerTime && li.dataset.end > playerTime
      );
      nextLi = lis[nextLiIndex];
      setSubtitleIndex(nextLiIndex);
      setCheckRange(0);
    } else if (checkRange > 0) {
      console.log("check range");
      let index = subtitleIndex - checkRange;
      const endIndex = subtitleIndex + checkRange;

      while (index <= endIndex) {
        if (lis[index].dataset.begin <= playerTime && lis[index].dataset.end > playerTime) {
          nextLi = lis[index];
          break;
        }
        index++;
      }
      setSubtitleIndex(index);
      setCheckRange(0);
    } else {
      if (lis[subtitleIndex + 1]?.dataset.begin <= playerTime) {
        nextLi = lis[subtitleIndex + 1];
        setSubtitleIndex(subtitleIndex + 1);
      }
    }

    if (nextLi) {
      nextLi.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      console.log("Moved to " + subtitleIndex);
    }
  }, [playerTime, subtitleIndex, checkRange]);

  useEffect(() => {
    if (inputTime && inputTime >= 0) {
      timer.current.setCurrentTime(hmsTosec(inputTime));
      setCheckRange(-1);
    }
  }, [inputTime]);

  return (
    <div id="subtitlePlayer" className="col align-self-center">
      <input
        className="position-absolute top-0 end-0 form-check-input"
        type="checkbox"
        value=""
        id="enableAutoPlay"
        checked={enableAutoPlay}
        onChange={() => setEnableAutoPlay(!enableAutoPlay)}
      ></input>
      <div className=".container h-100">
        <div className="row align-items-start part1">
          <div id="videoTitle">
            <h3>{props.subtitle.PartitionKey + " " + props.subtitle.RowKey + " " + props.subtitle.Title}</h3>
          </div>
          {/* <p className="msg">{msg}</p> */}
          <div id="playerTime">
            <p className="timecounter">
              <span className="time-sec">{Math.trunc(playerTime) + " Sec "}</span>
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
                  onFocus={(e) => setInputTime(e.target.select())}
                />
              ) : (
                <input type="hidden"></input>
              )}
            </div>
          </div>
        </div>
        <div className="row align-items-center part2">
          <div id="subtitleDisplay">
            <div id="subtitle-text-list">{subtitlesENCN}</div>
          </div>
        </div>
        <div className="row align-items-end button-bar part3">
          <div className="col">
            <button
              id="backward1sec-btn"
              className="btn btn-warning"
              onClick={() => {
                timer.current.backword(1);
                setCheckRange(5);
              }}
            >
              &#171;
            </button>
          </div>
          <div className="col">
            <button
              id="backward05sec-btn"
              className="btn btn-warning"
              onClick={() => {
                timer.current.backword(0.5);
                setCheckRange(3);
              }}
            >
              &#8249;
            </button>
          </div>
          <div className="col">
            <button
              id="PlayBtn"
              type="button"
              className={isPlaying ? "btn btn-outline-success" : "btn btn-success"}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
          </div>
          <div className="col">
            <button
              id="forward05sec-btn"
              className="btn btn-warning"
              onClick={() => {
                timer.current.forward(0.5);
                setCheckRange(3);
              }}
            >
              &#8250;
            </button>
          </div>
          <div className="col">
            <button
              id="forward1sec-btn"
              className="btn btn-warning"
              onClick={() => {
                timer.current.forward(1);
                setCheckRange(5);
              }}
            >
              &#187;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateSubtitleElement(xmlDocEN, xmlDocCN) {
  const xmlDoc2Objs = (xmlDoc, lang) => {
    const tickRate = xmlDoc.getElementsByTagName("tt")[0].getAttribute("ttp:tickRate");
    const subtitleElements = xmlDoc.getElementsByTagName("p");

    const subtitleObjs = Array.from(subtitleElements).map((p, index) => {
      const begin = p.getAttribute("begin").slice(0, -1) / tickRate;
      const end = p.getAttribute("end").slice(0, -1) / tickRate;
      const id = lang + "_" + index;

      let subtitleText = p.textContent;
      if (!(subtitleText && subtitleText.length > 0)) {
        Array.from(p.getElementsByTagName("span")).forEach((spanElement) => {
          subtitleText += spanElement.textContent + " ";
        });
        subtitleText = subtitleText.slice(0, -1);
      }
      return { id: id, lang: lang, begin: begin, end: end, subtitleText: subtitleText };
    });

    return subtitleObjs;
  };

  let enSubtitleObjs = xmlDoc2Objs(xmlDocEN, "EN");
  let cnSubtitleObjs = xmlDoc2Objs(xmlDocCN, "CN");

  let subtitleListElements = [];

  while (enSubtitleObjs.length > 0 || cnSubtitleObjs.length > 0) {
    let subtitleToPust =
      enSubtitleObjs[0]?.begin <= cnSubtitleObjs[0]?.begin ? enSubtitleObjs.shift() : cnSubtitleObjs.shift();

    subtitleListElements.push(
      <li
        key={subtitleToPust.id}
        id={subtitleToPust.id}
        data-begin={subtitleToPust.begin}
        data-end={subtitleToPust.end}
        data-lang={subtitleToPust.lang}
      >
        <p>{subtitleToPust.subtitleText}</p>
      </li>
    );
  }

  return (
    <ul>
      <div className="emptySub"></div>
      {subtitleListElements}
      <div className="emptySub"></div>
    </ul>
  );
}

async function fetchSubtitleFile(path) {
  const url = `https://fileaccessapi01.blob.core.windows.net/all-files${path}`;
  const sas =
    "sv=2020-08-04&ss=bt&srt=so&sp=rwlacuitf&se=2023-04-23T21:53:18Z&st=2022-04-23T13:53:18Z&spr=https&sig=TwLbIptzacZMOyIMIbtfhl8kLvSwfyxoRbZZ%2FmS32zY%3D";

  const headers = new Headers();
  headers.append("Accept", "application/xml");

  const requestOptions = {
    method: "GET",
    headers: headers,
    redirect: "follow",
  };

  const response = await fetch(url + "?" + sas, requestOptions);
  const data = await response.text();

  const parser = new DOMParser();
  let xmlDoc = parser.parseFromString(data, "text/xml");

  return xmlDoc;
}
