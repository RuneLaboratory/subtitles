import "./NavBar.scss";

export default function NavBar(props) {
  let backButton = null;

  if (props.title) {
    backButton = (
      <button
        className="btn btn-dark"
        onClick={() => {
          props.onBack();
        }}
      >
        Back
      </button>
    );
  }

  return (
    <nav id="nav-bar" className="navbar navbar-expand-lg navbar-dark bg-dark">
      {backButton}
    </nav>
  );
}
