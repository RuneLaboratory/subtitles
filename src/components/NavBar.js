import { Button, Navbar } from "react-bootstrap";
import "./NavBar.scss";

export default function NavBar(props) {
  let backButton = null;
  let pageBtn = null;

  if (props.title && props.curPage !== "NoteBook") {
    backButton = (
      <Button variant="btn btn-dark" onClick={() => props.onBack()}>
        Back
      </Button>
    );
  } else {
    backButton = <Button variant="btn btn-dark">&nbsp;</Button>;
  }

  if (props.curPage === "NoteBook") {
    pageBtn = (
      <Button variant="btn btn-dark" onClick={() => props.onSetPage("MediaMenu")}>
        Player
      </Button>
    );
  } else {
    pageBtn = (
      <Button variant="btn btn-dark" onClick={() => props.onSetPage("NoteBook")}>
        NoteBook
      </Button>
    );
  }

  return (
    <Navbar id="nav-bar" expand="lg" bg="dark">
      {backButton}
      {pageBtn}
    </Navbar >
  );
}
