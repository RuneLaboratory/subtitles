import azureFunc from "../service/AzureFunc";

export async function translate(vocab) {
  const headers = new Headers();
  headers.append("Ocp-Apim-Subscription-Key", azureFunc.getSecret().translatorKey);
  headers.append("Content-Type", "application/json; charset=UTF-8");
  headers.append("Ocp-Apim-Subscription-Region", "southeastasia");

  const raw = [{ Text: vocab }];

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(raw),
    redirect: "follow",
  };

  let translatorUrl = process.env.REACT_APP_AZURE_TRANSLATOR_ENDPOINT;
  translatorUrl += "/dictionary/lookup?api-version=3.0&from=en&to=zh-Hans";

  const response = await fetch(
    translatorUrl,
    requestOptions
  );

  const result = await response.json();

  let cnList = result[0].translations.map(translate=>translate.displayTarget);

  return cnList.slice(0, 4);
}
