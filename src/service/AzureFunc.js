let secret = null;

function getSecret() {
    return secret;
}

async function authenticate(username, password) {
    let functionUrl = process.env.REACT_APP_AZURE_FUNCTION_ENDPOINT;

    const headers = new Headers();
    headers.append("Content-Type", "application/json; charset=UTF-8");

    const postBody = { username: username, password: password };

    const requestOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(postBody),
        redirect: "follow",
    };

    let response = await fetch(functionUrl + "/api/authenticate", requestOptions)
    let returnValue = await response.json();
    secret = returnValue;

    if (returnValue.sas) return true;
    return false;
}

const azureFunc = { authenticate, getSecret };
export default azureFunc;