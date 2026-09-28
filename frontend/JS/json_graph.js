const runButton = document.getElementById("runButton");

runButton.addEventListener("click", run);

function run() {
    const adjList = parseGraphToAdjList(graph);

    console.log(adjList);
}

function parseGraphToAdjList(graph) {
    const adjList = {};
    console.log(graph);

    graph.forEach((edges, key) => {
        const node = key.querySelector("text").textContent;
        adjList[node] = {};

        edges.forEach(edge => {
            const secondNode = edge[1].querySelector("text").textContent;
            if (secondNode == node) return;
            const weight = edge[3].textContent;

            adjList[node][secondNode] = weight;
        });
    });

    return adjList;
}