const svgNS = "http://www.w3.org/2000/svg";
const svg = document.getElementById("board")

//group to store all edges - fix z cords
const edgesGroup = document.createElementNS(svgNS, "g");
svg.appendChild(edgesGroup);

const nodes = [];
const RADIUS = 20;
const createEdge = [];
let didDrag = false;

const edgesByNode = new Map();

function drawNode(x, y) {

    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("transform", `translate(${x}, ${y})`);

    nodes.push(g);
    edgesByNode.set(g, []);

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", 0);
    circle.setAttribute("cy", 0);
    circle.setAttribute("r", RADIUS);
    circle.setAttribute("fill", "lightgray");
    circle.setAttribute("stroke", "#c48d00");
    circle.setAttribute("stroke-width", "1px");

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", 0);
    text.setAttribute("y", 0);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.textContent = nodes.indexOf(g) + 1;

    g.appendChild(circle);
    g.appendChild(text);

    svg.appendChild(g);


    // MOVE
    g.addEventListener("mousedown", (e) => {
        e.stopPropagation();

        function onMouseMove(e) {
            didDrag = true;
            setCordsToCursor(g, e);
        }

        document.addEventListener("mousemove", onMouseMove);

        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", onMouseMove);
        });

    });

    g.addEventListener("click", (e) => {
        e.preventDefault();

        if (didDrag) {
            didDrag = false;
            return;
        }
        if (createEdge[0] == g) {
            circle.setAttribute("stroke", "#c48d00")
            createEdge.pop()
        } else if (createEdge.length == 1) {
            // if we are choosing the second node
            circle.setAttribute("stroke", "#0db8c4")
            createEdge.push(g);

            setTimeout(drawEdge, 300);

        } else {
            circle.setAttribute("stroke", "#0db8c4")
            createEdge.push(g)
        }
    });

    g.addEventListener("contextmenu", (e) => {
        e.preventDefault();

        const index = nodes.indexOf(g);
        console.log(index, nodes)
        nodes.splice(index, 1);
        updateNumbers(index);

        removeConnectedLines(g);
        edgesByNode.delete(g);

        svg.removeChild(g);
    })




    g.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    return g;
}


svg.addEventListener("click", (e) => {
    const rect = svg.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawNode(x, y);
});

function setCordsToCursor(g, e) {
    const rect = svg.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(RADIUS, Math.min(rect.width - RADIUS, x));
    y = Math.max(RADIUS, Math.min(rect.height - RADIUS, y));


    g.setAttribute("transform", `translate(${x}, ${y})`);
    updateEdgesPosition(g);
}

function updateNumbers(index) {
    console.log(index);
    for (let i = index; i < nodes.length; i++) {
        const text = nodes[i].querySelector("text");
        text.textContent = Number(text.textContent) - 1;
    }
}

// toggle create edges
// drawEdgeButton = document.getElementById("createEdges");
// drawEdgeButton.addEventListener("click", () => {
//     drawEdgeToggle = drawEdgeToggle == true ? false : true;
//     console.log(drawEdgeToggle);
// })

function drawEdge() {
    node1 = createEdge[0];
    node2 = createEdge[1];

    node1Rect = createEdge[0].getBoundingClientRect();
    node2Rect = createEdge[1].getBoundingClientRect();

    boardRect = svg.getBoundingClientRect();

    console.log("creating an edge");

    const line = document.createElementNS(svgNS, "line");

    line.setAttribute("x1", `${node1Rect.left - boardRect.left + RADIUS}`);
    line.setAttribute("y1", `${node1Rect.top - boardRect.top + RADIUS}`);
    line.setAttribute("x2", `${node2Rect.left - boardRect.left + RADIUS}`);
    line.setAttribute("y2", `${node2Rect.top - boardRect.top + RADIUS}`);
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", "3px");

    const edge = [node1, node2, line];

    edgesByNode.get(node1).push(edge);
    edgesByNode.get(node2).push(edge);

    // draw edge line
    edgesGroup.appendChild(line);

    createEdge.forEach(elem => {
        circle = elem.querySelector("circle");
        circle.setAttribute("stroke", "#c48d00")
    });
    createEdge.length = 0;
}

function updateEdgesPosition(node) {
    const nodeRect = node.getBoundingClientRect();
    const boardRect = svg.getBoundingClientRect();

    const x = nodeRect.left - boardRect.left + RADIUS;
    const y = nodeRect.top - boardRect.top + RADIUS;

    edgesByNode.get(node).forEach((edge) => {
        const line = edge[2];
        // if this node is the start node of this edge
        if (edge.indexOf(node) == 0) {
            line.setAttribute("x1", `${x}`);
            line.setAttribute("y1", `${y}`);
        } else {
            line.setAttribute("x2", `${x}`);
            line.setAttribute("y2", `${y}`);
        }
    })
}

function removeConnectedLines(node) {
    const neighbors = [];

    edgesByNode.get(node).forEach((elem) => {
        // removing all edges starting from node
        const line = elem[2];
        edgesGroup.removeChild(line);

        // collect neighbors
        const neighbor = elem[0] == node ? elem[1] : elem[0];
        neighbors.push(neighbor);
    })

    // remove edges from neighbors in 'edgesByNode'
    neighbors.forEach((neighbor) => {
        neighborEdges = edgesByNode.get(neighbor);
        neighborEdges.forEach((elem) => {
            if (elem[1] == node || elem[0] == node) {
                const indexOfElem = neighborEdges.indexOf(elem);
                neighborEdges.splice(indexOfElem, 1);
            }
        })

    })

}