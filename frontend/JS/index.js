const runButton = document.getElementById("runButton");

runButton.addEventListener("click", run);

const ALGORITHM = "dijkstra";
const START_NODE = "A";

async function run() {

    const input = getInput();

    const response = await fetch("http://localhost:5000/api/receive", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
    });

    const data = await response.json();

    const outputBox = document.getElementById("output");
    outputBox.textContent = JSON.stringify(data, null, 2);

}

function getInput() {
    const adjList = parseGraphToAdjList(graph);

    return {
        "algorithm": ALGORITHM,
        "graph": adjList,
        "startNode": START_NODE
    }
}