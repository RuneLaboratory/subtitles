import "./App.css";
import SubtitlePlayer from "./components/SubtitlePlayer";
import NavBar from "./components/NavBar";
import Menu from "./components/Menu";
import { useState } from "react";

function App() {
  const [subtitleId, setSubtitleId] = useState("SubtitlePlayer");

  function onSetSubtitleId(subtitleId) {
    setSubtitleId(subtitleId);
  }

  return (
    <div className="App bg-light">
      <header></header>
      <NavBar onSetSubtitleId={onSetSubtitleId}></NavBar>
      {subtitleId ? <SubtitlePlayer /> : <Menu onSetSubtitleId={onSetSubtitleId}/>}
    </div>
  );
}

export default App;
