import "./App.css";
import SubtitlePlayer from "./components/SubtitlePlayer";
import NavBar from "./components/NavBar";
import Menu from "./components/Menu";
import EpisodeMenu from "./components/EpisodeMenu";
import { useState } from "react";

function App() {
  const [title, setTitle] = useState();
  const [subtitle, setSubtitle] = useState();

  function onSetTitle(title) {
    setTitle(title);
    setSubtitle(null);
  }

  function onSetSubtitle(subtitle) {
    setSubtitle(subtitle);
  }

  function onBack(){
    if(subtitle){
      setSubtitle(null);
    }else{
      setTitle(null);
    }
  }

  let page = <Menu key={title} title={title} onSetTitle={onSetTitle} />;
  if(subtitle){
    page = <SubtitlePlayer subtitle={subtitle} />;
  }else if(title){
    page = <EpisodeMenu partitionKey={title} onSetSubtitle={onSetSubtitle}/>
  }

  return (
    <div className="App bg-light">
      <header></header>
      <div className="app-body container">
        <div className="app-body row">
          <NavBar title={title} onBack={onBack}></NavBar>
          {page}
        </div>
      </div>
    </div>
  );
}

export default App;
