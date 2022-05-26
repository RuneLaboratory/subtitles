import { useEffect, useRef, useState } from "react";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import { vocabDB } from "../service/CosmosDB";
import "./NoteBook.scss";

export default function Menu(props) {
  const [vocabs, setVocabs] = useState([]);
  const vocabDBIterator = useRef();
  const hasMoreResults = useRef(true);

  function genSubtitleSample(from) {
    return from.map((f, i) => {
      return (
        <div key={i} className="media-sample">
          <p>{f.mediaName + " " + f.episode}</p>
          {f.subtitle.map((s, i) => (
            <ul key={i} className="list-group">
              <OverlayTrigger
                placement="bottom"
                delay={{ show: 250, hide: 250 }}
                overlay={<Tooltip id="button-tooltip">{s.subtitleCN_B}</Tooltip>}
              >
                <li className="list-group-item">{s.subtitleEN_B}</li>
              </OverlayTrigger>
              <OverlayTrigger
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

  async function loadMore() {
    if (!hasMoreResults.current) {
      return;
    }
    let result = await vocabDBIterator.current.fetchNext();
    hasMoreResults.current = result.hasMoreResults;
    setVocabs(loadedResult => loadedResult.concat(result.resources));
  }

  useEffect(() => {

    vocabDB.getVocabIterator(process.env.REACT_APP_NOTEBOOK_VOCAB_PAGE_SIZE).then(async (iterator) => {
      vocabDBIterator.current = iterator;
      let result = await vocabDBIterator.current.fetchNext();
      hasMoreResults.current = result.hasMoreResults;
      setVocabs(result.resources);
    });

  }, []);

  return (
    <div id="note-book">
      <div className="vocabs">{vocabCards}</div>
      {hasMoreResults.current && <div id="loadmore-btn"><Button variant="light btn-sm" onClick={loadMore}>Load more <br />&#9660;</Button></div>}
    </div>
  );
}
