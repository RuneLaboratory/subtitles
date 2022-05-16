import { useEffect, useState } from "react";
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
              <li className="list-group-item" title={s.subtitleCN_B}>{s.subtitleEN_B}</li>
              <li className="list-group-item" title={s.subtitleCN_C}>{s.subtitleEN_C}</li>
              <li className="list-group-item" title={s.subtitleCN_A}>{s.subtitleEN_A}</li>
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
            e.target.nextSibling.classList.toggle("show");
          }}
          title={vocab.definitionCN.map(d=>d + " ")}
        >
          {vocab.vocab}
        </div>
        <div id={"body-" + vocab.id} className="collapse" aria-labelledby="headingOne" data-parent="#accordion">
          <div className="card-body">
            <div>
              {genSubtitleSample(vocab.from)}
            </div>
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
      <div>Note Book</div>
      <div className="vocabs">{vocabCards}</div>
    </div>
  );
}
