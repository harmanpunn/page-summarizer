function fetchSummary() {
  const currentPageUrl = encodeURIComponent(window.location.href);
  // const currentPageUrl = window.location.href;

  const apiUrl = `http://192.168.1.161:8080/talk_to_GPT?url=${currentPageUrl}`;

  return fetch(apiUrl)
      .then(response => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
      });
}


function injectPane(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const pane = doc.querySelector('#container');
  document.body.appendChild(pane);

  // Event listeners
  document.getElementById('closeIcon').addEventListener('click', function() {
      pane.style.display = 'none';
  });

  document.getElementById('summarizeBtn').addEventListener('click', async function() {
    try {
        const data = await fetchSummary();
        const summaryText = data.summary || "Summary not available.";
        console.log("Summary:", summaryText);
        document.querySelector('#summary p').innerText = summaryText;
        document.getElementById('summary').style.display = 'block';
    } catch (error) {
        console.error("Error fetching summary:", error);
        document.querySelector('#summary p').innerText = "Error fetching summary.";
    }
});

}

if (!document.getElementById('container')) {
  fetch(chrome.runtime.getURL('pane.html'))
      .then(response => response.text())
      .then(injectPane);
} else {
  const pane = document.getElementById('container');
  pane.style.display = pane.style.display === 'none' ? 'block' : 'none';
}
