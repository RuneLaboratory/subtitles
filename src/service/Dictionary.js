export async function translate(vocab) {
  const headers = new Headers();
  headers.append("Ocp-Apim-Subscription-Key", "f9524b9e18834246937b94b75baf1a6c");
  headers.append("Content-Type", "application/json; charset=UTF-8");
  headers.append("Ocp-Apim-Subscription-Region", "southeastasia");

  const raw = [{ Text: vocab }];

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(raw),
    redirect: "follow",
  };

  const response = await fetch(
    "https://api.cognitive.microsofttranslator.com/dictionary/lookup?api-version=3.0&from=en&to=zh-Hans",
    requestOptions
  );

  const result = await response.json();

  let cnList = result[0].translations.map(translate=>translate.displayTarget);

  return cnList.slice(0, 4);
}
