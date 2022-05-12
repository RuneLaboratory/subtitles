import React, { useEffect, useRef, useState } from "react";
import Timer, { secondsToHms, hmsTosec } from "./Timer";
import { vocabDB } from "../service/CosmosDB";
import { translate } from "../service/Dictionary";
import "./SubtitlePlayer.scss";

export default function SubtitlePlayer(props) {
  const timer = useRef(new Timer());
  const [playerTime, setplayerTime] = useState(0);
  const [checkRange, setCheckRange] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [subtitlesENCN, setSubtitlesENCN] = useState([]);
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const boldIndex = useRef(0);
  const [inputTime, setInputTime] = useState();
  // const music = useRef(new Audio("/sound_of_silence.mp3"));
  const [enableAutoPlay, setEnableAutoPlay] = useState(false);
  const [selectedSelection, setSelectedSelection] = useState();

  useEffect(() => {
    window.addEventListener("blur", () => {
      setEnableAutoPlay((prev) => {
        if (prev) setIsPlaying(true);
        return prev;
      });
    });

    if (!(navigator.userAgent.includes("iPad") || navigator.userAgent.includes("Mac"))) {
      window.addEventListener("focus", () => {
        setEnableAutoPlay((prev) => {
          if (prev) setIsPlaying(false);
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

    const bgColor = isPlaying ? null : "#ffe6eb";
    document.getElementById("subtitleDisplay").style.backgroundColor = bgColor;
    setInputTime(""); // TODO

    return () => {
      timerRef.pause();
    };
  }, [isPlaying, enableAutoPlay]);

  useEffect(() => {
    const lis = document.querySelectorAll("#subtitleDisplay li");
    let subtitleIndexToSet = null;
    let nextLi = null;
    if (checkRange < 0) {
      const nextLiIndex = Array.from(lis).findIndex(
        (li) => li.dataset.begin <= playerTime && li.dataset.end > playerTime
      );
      if (nextLiIndex >= 0) {
        nextLi = lis[nextLiIndex];
        subtitleIndexToSet = nextLiIndex;
      }
      setCheckRange(0);
    } else if (checkRange > 0) {
      let index = subtitleIndex - checkRange;
      const endIndex = subtitleIndex + checkRange;
      while (index >= 0 && index <= endIndex) {
        if (lis[index].dataset.begin <= playerTime && lis[index].dataset.end > playerTime) {
          nextLi = lis[index];
          subtitleIndexToSet = index;
          break;
        }
        index++;
      }
      setCheckRange(0);
    } else {
      if (lis[subtitleIndex + 1]?.dataset.begin <= playerTime) {
        nextLi = lis[subtitleIndex + 1];
        subtitleIndexToSet = subtitleIndex + 1;
      }
    }

    if (nextLi) {
      if (nextLi.dataset.lang === "EN") {
        lis[boldIndex.current].classList.remove("current-subtitle");
        boldIndex.current = subtitleIndexToSet;
        nextLi.classList.add("current-subtitle");
      }

      setSubtitleIndex(subtitleIndexToSet);
      nextLi.scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    }
  }, [playerTime, subtitleIndex, checkRange]);

  useEffect(() => {
    if (inputTime && inputTime >= 0) {
      timer.current.setCurrentTime(hmsTosec(inputTime));
      setplayerTime(timer.current.currentTime());
      setCheckRange(-1);
    }
  }, [inputTime]);

  async function onUserSelectVocab() {
    const selection = window.getSelection();
    let vocab = selection.toString()?.trim();
    if (vocab.length > 1 && vocab.length < 35) {
      const definitionCN = await translate(vocab);
      setSelectedSelection({ selection: selection, vocab: vocab + " : " + definitionCN });
    }
  }

  async function saveVocab() {
    const selection = selectedSelection?.selection;
    let vocab = selection?.toString()?.trim();

    if (!vocab) return;

    const curElementEN = selection.anchorNode.parentElement.parentElement;

    if (curElementEN.dataset.lang === "CN") {
      return;
    }

    let curElementCN;
    let preElementEN = curElementEN.previousSibling.hasAttribute("id") ? null : document.createElement("li");
    let preElementCN = curElementEN.previousSibling.hasAttribute("id") ? null : document.createElement("li");
    let nextElementEN = curElementEN.nextSibling.hasAttribute("id") ? null : document.createElement("li");
    let nextElementCN = curElementEN.nextSibling.hasAttribute("id") ? null : document.createElement("li");

    let pElement = curElementEN.previousSibling;
    while (!preElementEN) {
      pElement.dataset.lang === "EN" ? (preElementEN = pElement) : (pElement = pElement.previousSibling);
    }
    pElement = curElementEN.previousSibling;
    while (!preElementCN) {
      pElement.dataset.lang === "CN" ? (preElementCN = pElement) : (pElement = pElement.previousSibling);
    }
    pElement = curElementEN.nextSibling;
    while (!curElementCN) {
      pElement.dataset.lang === "CN" ? (curElementCN = pElement) : (pElement = pElement.nextSibling);
    }
    pElement = curElementEN.nextSibling;
    while (!nextElementEN) {
      pElement.dataset.lang === "EN" ? (nextElementEN = pElement) : (pElement = pElement.nextSibling);
    }
    pElement = nextElementEN.nextSibling;
    while (!nextElementCN) {
      pElement.dataset.lang === "CN" ? (nextElementCN = pElement) : (pElement = pElement.nextSibling);
    }

    const subtitleElements = {
      subtitleEN_B: preElementEN.textContent,
      subtitleCN_B: preElementCN.textContent,
      subtitleEN_C: curElementEN.textContent,
      subtitleCN_C: curElementCN.textContent,
      subtitleEN_A: nextElementEN.textContent,
      subtitleCN_A: nextElementCN.textContent,
    };

    let existingVocab = await vocabDB.getVocab(vocab, vocab);

    let mediaMatchIndex = existingVocab?.from.findIndex(
      (f) => f.mediaName === props.subtitle.PartitionKey && f.episode === props.subtitle.RowKey
    );
    let mediaMatch = existingVocab?.from[mediaMatchIndex];
    let subtitleMatch = mediaMatch?.subtitle.find((s) => s.subtitleEN_C === curElementEN.textContent);

    let vocabObj = existingVocab;
    if (subtitleMatch) {
      const saveBtn = document.querySelector("button#save-btn");
      const oriText = saveBtn.textContent;
      saveBtn.textContent = "Skip";
      setTimeout(() => (saveBtn.textContent = oriText), 2000);
      return;
    } else if (mediaMatch) {
      mediaMatch.subtitle.push(subtitleElements);
      existingVocab.from[mediaMatchIndex] = mediaMatch;
    } else if (existingVocab) {
      vocabObj.from.push({
        mediaName: props.subtitle.PartitionKey,
        episode: props.subtitle.RowKey,
        subtitle: [subtitleElements],
      });
    } else {
      const definitionCN = await translate(vocab);
      vocabObj = {
        id: vocab,
        vocab: vocab,
        definitionCN: definitionCN,
        from: [
          {
            mediaName: props.subtitle.PartitionKey,
            episode: props.subtitle.RowKey,
            subtitle: [subtitleElements],
          },
        ],
      };
    }

    const createdVocab = await vocabDB.upsertVocab(vocabObj);
    if (createdVocab) {
      const saveBtn = document.querySelector("button#save-btn");
      const oriText = saveBtn.textContent;
      saveBtn.textContent = "Saved!";
      setTimeout(() => (saveBtn.textContent = oriText), 2000);
    }
  }

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
          <div id="videoTitle" onClick={() => setIsPlaying(!isPlaying)} className="btn btn-light">
            <h5>{props.subtitle.PartitionKey + " " + props.subtitle.RowKey + " " + props.subtitle.Title}</h5>
          </div>
          <div className="function-bar row">
            <p className="timecounter col">
              <span className="time-sec">{Math.trunc(playerTime) + " Sec "}</span>
              <span className="time-ms">{Math.trunc(playerTime * 1000)}</span>
            </p>
            <p className="time col">{secondsToHms(props.subtitle.DurationSec - playerTime)}</p>
            <p className="saveBtn col">
              <button id="save-btn" className="btn btn-primary btn-sm float-end" onClick={saveVocab}>
                Save
              </button>
              <span className="selected-vocab float-end">{selectedSelection?.vocab}</span>
            </p>
            <div>
              {!isPlaying ? (
                <input
                  id="inputTime"
                  type="number"
                  className="form-control form-control-sm"
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
            <div id="subtitle-text-list" onMouseUp={onUserSelectVocab}>
              {subtitlesENCN}
            </div>
          </div>
        </div>
        <div className="row align-items-end button-bar part3">
          <div className="col">
            <button
              id="backward2sec-btn"
              className="btn btn-warning"
              onClick={() => {
                timer.current.backword(2);
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
              id="forward2sec-btn"
              className="btn btn-warning"
              onClick={() => {
                timer.current.forward(2);
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

      let subtitleText = "";
      if (p.hasChildNodes() && p.childNodes.length > 1) {
        Array.from(p.childNodes).forEach((element) => {
          subtitleText += element.textContent + " ";
        });
        subtitleText = subtitleText.slice(0, -1);
      } else {
        subtitleText = p.textContent;
      }

      return { id: id, lang: lang, begin: begin, end: end, subtitleText: subtitleText };
    });

    return subtitleObjs;
  };

  let enSubtitleObjs = xmlDoc2Objs(xmlDocEN, "EN");
  let cnSubtitleObjs = xmlDoc2Objs(xmlDocCN, "CN");

  let subtitleListElements = [];

  while (enSubtitleObjs.length > 0 || cnSubtitleObjs.length > 0) {
    let subtitleToPust;
    if (cnSubtitleObjs.length === 0) {
      subtitleToPust = enSubtitleObjs.shift();
    } else if (enSubtitleObjs.length === 0) {
      subtitleToPust = cnSubtitleObjs.shift();
    } else {
      subtitleToPust =
        enSubtitleObjs[0].begin <= cnSubtitleObjs[0].begin ? enSubtitleObjs.shift() : cnSubtitleObjs.shift();
    }

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
  const url = `https://fileaccessapi01.blob.core.windows.net/subtitle/${path}`;
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
