import "./NavBar.scss";

export default function NavBar(props) {
  return (
    <nav id="nav-bar" className="navbar navbar-expand-lg navbar-dark bg-dark">
      <button
        className="btn btn-dark"
        onClick={() => {
          props.onSetSubtitleId(null);
        }}
      >
        Back
      </button>
      {/* <a className="navbar-brand">
        Back
      </a> */}
    </nav>
  );
}
