import { useEffect, useState } from "react";
import azureFunc from "../service/AzureFunc";

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
  
  const sas = azureFunc.getSecret().sas;

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
