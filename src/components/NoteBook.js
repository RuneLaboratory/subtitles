import { useEffect, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { vocabDB } from "../service/CosmosDB";
import "./NoteBook.scss";

export default function Menu(props) {
  const [vocabs, setVocabs] = useState([]);

  function genSubtitleSample(from) {
    return from.map((f, i) => {
      return (
        <div key={i} className="media-sample">
          <p>{f.mediaName + " " + f.episode}</p>
          {f.subtitle.map((s, i) => (
            <ul key={i} className="list-group">
              <OverlayTrigger
                trigger="click"
                placement="bottom"
                delay={{ show: 250, hide: 250 }}
                overlay={<Tooltip id="button-tooltip">{s.subtitleCN_B}</Tooltip>}
              >
                <li className="list-group-item">{s.subtitleEN_B}</li>
              </OverlayTrigger>
              <OverlayTrigger
                trigger="click"
                placement="bottom"
                delay={{ show: 250, hide: 250 }}
                overlay={<Tooltip id="button-tooltip">{s.subtitleCN_C}</Tooltip>}
              >
                <li className="list-group-item">{s.subtitleEN_C}</li>
              </OverlayTrigger>
              <OverlayTrigger
                placement="bottom"
                delay={{ show: 250, hide: 250 }}
                overlay={<Tooltip id="button-tooltip">{s.subtitleCN_A}</Tooltip>}
              >
                <li className="list-group-item">{s.subtitleEN_A}</li>
              </OverlayTrigger>
            </ul>
          ))}
        </div>
      );
    });
  }

  const vocabCards = vocabs.map((vocab) => {
    return (
      <div key={vocab.id} className="card">
        <div
          className="card-header btn"
          id={"head-" + vocab.id}
          onClick={(e) => {
            if (e.target.classList.contains("card-header")) {
              e.target.nextSibling.classList.toggle("show");
            }
          }}
        >
          <OverlayTrigger
            trigger="click"
            placement="bottom"
            delay={{ show: 1000, hide: 250 }}
            overlay={<Tooltip id="button-tooltip">{vocab.definitionCN.map((d) => d + " ")}</Tooltip>}
          >
            <div className="vocab-title">
              <span>{vocab.vocab}</span>
            </div>
          </OverlayTrigger>
        </div>

        <div id={"body-" + vocab.id} className="collapse" aria-labelledby="headingOne" data-parent="#accordion">
          <div className="card-body">
            <div>{genSubtitleSample(vocab.from)}</div>
          </div>
        </div>
      </div>
    );
  });

  useEffect(() => {
    vocabDB.getLatestVocab().then((results) => {
      setVocabs(results);
    });
  }, []);

  return (
    <div id="note-book">
      <div className="vocabs">{vocabCards}</div>
    </div>
  );
}
