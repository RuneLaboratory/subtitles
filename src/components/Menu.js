import { useEffect, useRef, useState } from "react";
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
  const url = "https://fileaccessapi01.table.core.windows.net/subtitleKey";
  const sas =
    "?sv=2020-08-04&ss=t&srt=o&sp=rwdlacu&se=2023-04-22T18:12:06Z&st=2022-04-22T10:12:06Z&spr=https&sig=rN1%2ByQcJkJsTCJyoz5djH0675qUwDI7gtF%2BZxipqUUw%3D";

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
