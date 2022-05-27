import { useEffect, useRef, useState } from "react";
import azureFunc from "../service/AzureFunc";
import "./Menu.scss";

export default function Menu(props) {
  const [selectedCategory, setSelectedCategory] = useState();
  const titles = useRef([]);
  const titleItem = titles.current.map((category) => {
    let isSelected = selectedCategory === category.partitionKey;

    return (
      <div key={category.partitionKey} className="card">
        <div
          className="card-header btn"
          id="headingOne"
          onClick={() => {
            setSelectedCategory(category.partitionKey);
          }}
        >
          <h5 className="mb-0 btn">{category.partitionKey}</h5>
        </div>
        <div className={isSelected ? "collapse  show" : "collapse"}>
          <div className="card-body">
            <div>
              <ul className="list-group">
                {category.rowKeys.map((title) => (
                  <li
                    key={title}
                    className="list-group-item btn"
                    onClick={() => {
                      props.onSetTitle(title);
                    }}
                  >
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  });

  useEffect(() => {
    fetchSubtitles((results) => {
      let titleList = [];
      results.forEach((title) => {
        let categoryList = titleList.find((t) => t.partitionKey === title.PartitionKey);
        if (categoryList) {
          categoryList.rowKeys.push(title.RowKey);
        } else {
          titleList.push({ partitionKey: title.PartitionKey, rowKeys: [title.RowKey] });
        }
      });
      titles.current = titleList;
      setSelectedCategory(results[0].PartitionKey);
    });
  }, []);

  return <div id="menu">{titleItem}</div>;
}

async function fetchSubtitles(onComplete) {
  let azureTableUrl = process.env.REACT_APP_AZURE_FILE_TABLE_URL;
  azureTableUrl += "/subtitleKey";
  const sas = azureFunc.getSecret().sas;
  
  const headers = new Headers();
  headers.append("Accept", "application/json;odata=nometadata");

  const requestOptions = {
    method: "GET",
    headers: headers,
    redirect: "follow",
  };

  const response = await fetch(azureTableUrl + "?" + sas, requestOptions);
  const result = await response.clone().json();
  onComplete(result.value);
}
