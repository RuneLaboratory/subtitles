import { useEffect, useState } from "react";

export default function EpisodeMenu(props) {
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    fetchEpisode(props.partitionKey, (result) => {
      setEpisodes(result);
    });
  }, [props.partitionKey]);

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
                    {episode.RowKey + " " + episode.Title}
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
  let azureTableUrl = process.env.REACT_APP_AZURE_FILE_TABLE_URL;
  azureTableUrl += `/subtitle()?$filter=PartitionKey eq '${partitionKey}'&`;
  
  const sas =
    "sv=2020-08-04&ss=bt&srt=so&sp=rwlacuitf&se=2023-04-23T21:53:18Z&st=2022-04-23T13:53:18Z&spr=https&sig=TwLbIptzacZMOyIMIbtfhl8kLvSwfyxoRbZZ%2FmS32zY%3D";

  const headers = new Headers();
  headers.append("Accept", "application/json;odata=nometadata");

  const requestOptions = {
    method: "GET",
    headers: headers,
    redirect: "follow",
  };

  const response = await fetch(azureTableUrl + sas, requestOptions);
  const result = await response.clone().json();
  onComplete(result.value);
}
