import { useEffect, useState } from "react";

export default function EpisodeMenu(props) {
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    fetchEpisode(props.partitionKey, (result) => {
      setEpisodes(result);
    });
  }, []);

  return (
    <div id="menu">
      <div key={props.partitionKey} className="card">
        <div className="card-header" id="headingOne">
          <h5 className="mb-0">{props.partitionKey}</h5>
        </div>
        <div className="collapse  show">
          <div className="card-body">
            <div>
              <ul className="list-group">
                {episodes.map((episode) => (
                  <li
                    key={episode.Title}
                    className="list-group-item btn"
                    onClick={() => {
                      props.onSetSubtitle(episode);
                    }}
                  >
                    {episode.Title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function fetchEpisode(partitionKey, onComplete) {
  const url = `https://fileaccessapi01.table.core.windows.net/subtitle()?$filter=PartitionKey eq '${partitionKey}'`;
  const sas =
    "&sv=2020-08-04&ss=t&srt=o&sp=rwdlacu&se=2023-04-22T18:12:06Z&st=2022-04-22T10:12:06Z&spr=https&sig=rN1%2ByQcJkJsTCJyoz5djH0675qUwDI7gtF%2BZxipqUUw%3D";

  const headers = new Headers();
  headers.append("Accept", "application/json;odata=nometadata");

  const requestOptions = {
    method: "GET",
    headers: headers,
    redirect: "follow",
  };

  const response = await fetch(url + sas, requestOptions);
  const result = await response.clone().json();
  onComplete(result.value);
}
