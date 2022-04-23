import { useEffect, useState } from "react";
import "./Menu.scss";

export default function Menu(props) {
  const [category, setCategorty] = useState();

  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json;odata=nometadata");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    fetch(
      "https://fileaccessapi01.table.core.windows.net/subtitleKey?sv=2020-08-04&ss=t&srt=o&sp=rwdlacu&se=2023-04-22T18:12:06Z&st=2022-04-22T10:12:06Z&spr=https&sig=rN1%2ByQcJkJsTCJyoz5djH0675qUwDI7gtF%2BZxipqUUw%3D",
      requestOptions
    )
      .then((response) => {
          console.log(response);
        response.text();
      })
      .then((result) => {
        console.log("hey");
        console.log(result);
        console.log("hey end");
      })
      .catch((error) => console.log("error", error));
  }, []);

  return (
    <div id="menu">
      <div className="card">
        <div className="card-header" id="headingOne">
          <h5 className="mb-0">
            <button
              className="btn"
              onClick={() => {
                props.onSetSubtitleId("a");
              }}
            >
              Collapsible Group Item #1
            </button>
          </h5>
        </div>
        <div className="collapse show">
          <div className="card-body">
            <div>
              Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf
              moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod.
              Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda
              shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea
              proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim
              aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
