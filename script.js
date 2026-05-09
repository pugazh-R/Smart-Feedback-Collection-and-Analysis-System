const form = document.getElementById("form");
const resultText = document.getElementById("result");
const textarea = document.getElementById("msg");

let chart;

/* =========================
   FORM SUBMIT HANDLER
========================= */
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = textarea.value.trim();

    if (!message) return;

    try {
        setLoadingState(true);

        const res = await fetch("/api/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        if (!res.ok) throw new Error("Server error");

        const data = await res.json();

        updateResultUI(data.sentiment);

        textarea.value = ""; // clear input

        await loadChart();

    } catch (error) {
        showError("Something went wrong. Please try again.");
        console.error(error);
    } finally {
        setLoadingState(false);
    }
});

/* =========================
   LOAD CHART DATA
========================= */
async function loadChart() {
    try {
        const res = await fetch("/api/summary");
        if (!res.ok) throw new Error("Chart fetch failed");

        const data = await res.json();

        const labels = Object.keys(data);
        const values = Object.values(data);

        if (chart) chart.destroy();

        chart = new Chart(document.getElementById("chart"), {
            type: "doughnut", // upgraded from pie
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        "#22c55e", // green
                        "#ef4444", // red
                        "#6b7280"  // gray
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#fff",
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error("Chart error:", error);
    }
}

/* =========================
   UI HELPERS
========================= */

// Loading state for button
function setLoadingState(isLoading) {
    const btn = form.querySelector("button");

    if (isLoading) {
        btn.disabled = true;
        btn.innerText = "Submitting...";
        btn.style.opacity = "0.7";
    } else {
        btn.disabled = false;
        btn.innerText = "Submit Feedback";
        btn.style.opacity = "1";
    }
}

// Sentiment UI styling
function updateResultUI(sentiment) {
    resultText.innerText = `Sentiment: ${sentiment}`;

    // Dynamic color
    if (sentiment.toLowerCase() === "positive") {
        resultText.style.color = "#22c55e";
    } else if (sentiment.toLowerCase() === "negative") {
        resultText.style.color = "#ef4444";
    } else {
        resultText.style.color = "#9ca3af";
    }

    // Smooth animation
    resultText.style.opacity = "0";
    resultText.style.transform = "translateY(10px)";

    setTimeout(() => {
        resultText.style.transition = "0.4s";
        resultText.style.opacity = "1";
        resultText.style.transform = "translateY(0)";
    }, 50);
}

// Error UI
function showError(message) {
    resultText.innerText = message;
    resultText.style.color = "#ef4444";
}

/* =========================
   INITIAL LOAD
========================= */
loadChart();