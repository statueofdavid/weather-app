async function fetchDataFromAPI(baseUrl, urlParams, options = {}) {
  const searchParams = new URLSearchParams(urlParams);
  const url = `${baseUrl}?${searchParams.toString()}`;

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API request failed with status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export default fetchDataFromAPI;
