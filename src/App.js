import { Container, Row } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import SubtitlePlayer from "./components/SubtitlePlayer";
import NavBar from "./components/NavBar";
import Menu from "./components/Menu";
import EpisodeMenu from "./components/EpisodeMenu";
import NoteBook from "./components/NoteBook";
import { useState } from "react";

function App() {
  const Page = {
    MediaMenu: "MediaMenu",
    MediaEpisode: "MediaEpisode",
    SubtitlePlayer: "SubtitlePlayer",
    NoteBook: "NoteBook",
  };
  const [title, setTitle] = useState();
  const [subtitle, setSubtitle] = useState();
  const [curPage, setCurPage] = useState(Page.MediaMenu);

  function onSetTitle(title) {
    setTitle(title);
    setSubtitle(null);
    setCurPage(Page.MediaEpisode);
  }

  function onSetSubtitle(subtitle) {
    setSubtitle(subtitle);
    setCurPage(Page.SubtitlePlayer);
  }

  function onBack() {
    if (subtitle) {
      setSubtitle(null);
      setCurPage(Page.MediaEpisode);
    } else {
      setTitle(null);
      setCurPage(Page.MediaMenu);
    }
  }

  function onSetPage(curPage) {
    if(curPage === Page.MediaMenu){
      setTitle(null);
    }
    setCurPage(curPage);
  }

  return (
    <div className="app bg-light">
      <header></header>
      <Container className="app-body">
        <Row className="app-body">
          <NavBar title={title} onBack={onBack} onSetPage={onSetPage} curPage={curPage}></NavBar>
          {(() => {
            switch (curPage) {
              case Page.MediaMenu:
                return <Menu key={title} title={title} onSetTitle={onSetTitle} />;
              case Page.MediaEpisode:
                return <EpisodeMenu partitionKey={title} onSetSubtitle={onSetSubtitle} />;
              case Page.SubtitlePlayer:
                return <SubtitlePlayer subtitle={subtitle} />;
              case Page.NoteBook:
                return <NoteBook />;
              default:
                return null;
            }
          })()}
        </Row>
      </Container>
    </div>
  );
}

export default App;

// TODO, remove the ignore error
//"start": "GENERATE_SOURCEMAP=false react-scripts start",