// === AI Function ===
async function getAIExplanation(matchedTrackers) {
  const prompt = `The following website uses these tracking services: ${[
    ...new Set(matchedTrackers),
  ].join(
    ", "
  )}. Can you explain in simple terms what privacy risks they pose to the user?`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer YOUR-API-KEY`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error("Invalid response from OpenAI");
  }

  return data.choices[0].message.content;
}

// === Main Logic ===
fetch(chrome.runtime.getURL("tracker_db.json"))
  .then((response) => response.json())
  .then((trackerList) => {
    chrome.runtime.sendMessage({ type: "GET_SITE_DATA" }, (response) => {
      if (!response) {
        document.getElementById("cookieData").innerText = "No data available.";
        return;
      }

      const { cookies, scripts } = response;

      // Show cookies
      document.getElementById("cookieData").innerText =
        cookies || "No cookies found.";

      // Show script URLs
      const list = document.getElementById("scriptList");
      let matchedTrackers = [];

      scripts.forEach((script) => {
        const li = document.createElement("li");
        li.textContent = script;

        trackerList.trackers.forEach((tracker) => {
          if (script.toLowerCase().includes(tracker.toLowerCase())) {
            li.style.color = "red"; // Highlight risky ones
            matchedTrackers.push(tracker);
          }
        });

        list.appendChild(li);
      });

      // Calculate and display privacy score
      const score = Math.max(0, 100 - matchedTrackers.length * 10);
      const scoreBox = document.createElement("div");
      scoreBox.innerHTML = `<strong>Privacy Score: ${score}/100</strong>`;
      scoreBox.style.margin = "10px 0";
      scoreBox.style.fontSize = "14px";
      scoreBox.style.backgroundColor =
        score >= 80 ? "#d4edda" : score >= 50 ? "#fff3cd" : "#f8d7da";
      scoreBox.style.padding = "6px";
      scoreBox.style.borderRadius = "4px";
      document.body.insertBefore(scoreBox, document.body.children[1]);

      // Get AI explanation

      const explanationBox = document.getElementById("explanationBox");

if (matchedTrackers.length > 0) {
  explanationBox.innerText = "Generating privacy explanation...";

  getAIExplanation(matchedTrackers)
    .then((explanation) => {
      explanationBox.innerText = explanation;
    })
    .catch((err) => {
      console.error("AI error:", err);
      explanationBox.innerText = "Could not load AI explanation.";
    });
} else {
  explanationBox.innerText = "This site appears safe. No known trackers detected.";
}

    });
  });
