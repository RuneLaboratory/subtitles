import "./NavBar.scss";

export default function NavBar(props) {
  let backButton = null;
  let pageBtn = null;

  if (props.title && props.curPage !== "NoteBook") {
    backButton = (
      <button
        className="btn btn-dark"
        onClick={() => props.onBack()}
      >
        Back
      </button>
    );
  } else {
    backButton = (
      <button className="btn btn-dark">
        &nbsp;
      </button>
    );
  }

  if (props.curPage === "NoteBook") {
    pageBtn = (<button className="btn btn-dark" onClick={() => props.onSetPage("MediaMenu")}>Player</button>);
  } else {
    pageBtn = (<button className="btn btn-dark" onClick={() => props.onSetPage("NoteBook")}>NoteBook</button>);
  }

  return (
    <nav id="nav-bar" className="navbar navbar-expand-lg navbar-dark bg-dark">
      {backButton}
      {pageBtn}
    </nav>
  );
}
