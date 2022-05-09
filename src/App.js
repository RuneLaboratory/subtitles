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
    NoteBook: "NoteBook"
  }
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
    setCurPage(curPage);
  }

  let page;
  console.log(curPage);
  if (curPage === Page.MediaMenu) {
    console.log("in medai menu");
    page = <Menu key={title} title={title} onSetTitle={onSetTitle} />;
  } else if (curPage === Page.MediaMenu) {
    page = <EpisodeMenu partitionKey={title} onSetSubtitle={onSetSubtitle} />
  } else if (curPage === Page.SubtitlePlayer) {
    page = <SubtitlePlayer subtitle={subtitle} />;
  } else if (curPage === Page.NoteBook) {
    page = <NoteBook />;
  }

  // if (subtitle) {
  //   page = <SubtitlePlayer subtitle={subtitle} />;
  // } else if (title) {
  //   page = <EpisodeMenu partitionKey={title} onSetSubtitle={onSetSubtitle} />
  // }

  return (
    <div className="App bg-light">
      <header></header>
      <div className="app-body container">
        <div className="app-body row">
          <NavBar title={title} onBack={onBack} onSetPage={onSetPage} curPage={curPage}></NavBar>
          {page}
        </div>
      </div>
    </div>
  );
}

export default App;
