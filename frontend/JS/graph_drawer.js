const svgNS = "http://www.w3.org/2000/svg";
const svg = document.getElementById("board")

//group to store all edges - fix z cords
const edgesGroup = document.createElementNS(svgNS, "g");
svg.appendChild(edgesGroup);
const weightsGroup = document.createElementNS(svgNS, "g");
svg.appendChild(weightsGroup);

//AI generated
const defs = document.createElementNS(svgNS, "defs");
svg.appendChild(defs);

defs.appendChild(createArrowMarker(svgNS, "arrowhead-black", "black"));
defs.appendChild(createArrowMarker(svgNS, "arrowhead-red", "red"));
// AI generated end

const input = document.getElementById("input-weight");

const MAX_WEIGHT_DIGITS = 3;

const directional_graph = false;

const nodes = [];
const RADIUS = 20;
const createEdge = [];
let didDrag = false;
let didInputWeight = false;
let currentWeight = null;
let isSecondEdge = false;

const graph = new Map();
const linesByNode = new Map();

function drawNode(x, y) {

    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("transform", `translate(${x}, ${y})`);

    nodes.push(g);
    graph.set(g, []);

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

        if (didDrag || didInputWeight) {
            didDrag = false;
            didInputWeight = false;
            return;
        }

        if (createEdge[0] == g) {
            circle.setAttribute("stroke", "#c48d00")
            createEdge.pop()
        } else if (createEdge.length == 1) {
            // if we are choosing the second node
            circle.setAttribute("stroke", "#0db8c4")
            createEdge.push(g);

            setTimeout(() => { drawEdge(createEdge[0], createEdge[1]) }, 100);

        } else {
            circle.setAttribute("stroke", "#0db8c4")
            createEdge.push(g)
        }
    });

    // delete node on right click
    g.addEventListener("contextmenu", (e) => {
        e.preventDefault();

        // updating number on other nodes by
        // removing this node from the nodes array
        const index = nodes.indexOf(g);
        nodes.splice(index, 1);
        updateNumbers(index);

        // remove all lines connected to this node
        removeConnectedLines(g);

        svg.removeChild(g);
    })




    g.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    return g;
}


svg.addEventListener("click", (e) => {
    if (didInputWeight) {
        didInputWeight = false;
        return;
    }
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
    for (let i = index; i < nodes.length; i++) {
        const text = nodes[i].querySelector("text");
        text.textContent = Number(text.textContent) - 1;
    }
}

// check if the edge is already exist
function hasEdge(node1, node2) {
    let edgeAlreadyExist = false;
    graph.get(node1).forEach((edge) => {
        if (edge[1] == node2) {
            edgeAlreadyExist = true;
        }
    })

    return edgeAlreadyExist;
}


function drawEdge(node1, node2) {
    // check if the edge already exist
    // return if true
    if (hasEdge(node1, node2)) {
        resetSelectedEdges();
        return;
    }

    let line;

    const [x1, y1] = getNodeCords(node1);
    const [x2, y2] = getNodeCords(node2);

    //set line attributes
    if (directional_graph) {
        line = document.createElementNS(svgNS, "path");

        line.setAttribute("fill", "none");
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", "3px");

        // add arrow and curve

        const [cx, cy] = getCurvedCenterFromNodes(node1, node2);

        line.setAttribute("d", `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`);
        line.setAttribute("marker-end", "url(#arrowhead-black)");
    }
    else {
        line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", `${x1}`);
        line.setAttribute("y1", `${y1}`);
        line.setAttribute("x2", `${x2}`);
        line.setAttribute("y2", `${y2}`);
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", "4px");
    }

    // create weight
    const weight = document.createElementNS(svgNS, "text");

    // create edge
    const edge = [node1, node2, line, weight];

    // set weight attributes
    {
        weight.textContent = '0';
        weight.setAttribute("fill", "green");
        weight.classList.add("weight");

        updateWeightPosition(edge);
    }

    graph.get(node1).push(edge);
    graph.get(node2).push(edge);

    // if graph is non dircational add the reversed edge
    if (!directional_graph) {
        // flag for drawing the second edge (the reversed one) only once
        if (!isSecondEdge) {
            isSecondEdge = true;
            drawEdge(node2, node1);
            isSecondEdge = false;
        }
    }

    // draw edge line and weight
    edgesGroup.appendChild(line);
    weightsGroup.appendChild(weight);

    // edge and weight interaction handeling
    {
        // delete line on right click
        line.addEventListener("contextmenu", (e) => {
            e.preventDefault();

            // remove line from screen
            edgesGroup.removeChild(line);
            weightsGroup.removeChild(weight);

            // remove doubled line if graph is non directional
            if (!directional_graph) {
                const ghostEdge = getGhostEdge(edge);
                const ghostLine = ghostEdge[2];
                const ghostWeight = ghostEdge[3];

                edgesGroup.removeChild(ghostLine);
                weightsGroup.removeChild(ghostWeight);
            }

            // remove edge from DB
            if (!directional_graph) {
                const reversedEdge = [node2, node1, line, weight];

                removeEdge(edge);
                removeEdge(reversedEdge);
            }
            else {
                removeEdge(edge);
            }
        })

        weight.addEventListener("click", (e) => {
            e.stopPropagation();

            didInputWeight = true;
            currentWeight = weight;

            const weightRect = weight.getBoundingClientRect();
            const x = weightRect.left;
            const y = weightRect.top;


            input.style.display = "block";
            input.style.left = x + "px";
            input.style.top = y + "px";

            input.focus();

        })
    }


    resetSelectedEdges();

    createEdge.length = 0;
}

function resetSelectedEdges() {

    createEdge.forEach(elem => {
        circle = elem.querySelector("circle");
        circle.setAttribute("stroke", "#c48d00")
    });

    createEdge.length = 0;
}

// return ghost edge for dealing with double edge in a non directional graph
function getGhostEdge(edge) {
    const node1 = edge[0];
    const node2 = edge[1];

    let ghostEdge;
    graph.get(node1).forEach(e => {
        if (e[0] == node2) {
            ghostEdge = e;
            return;
        }
    })
    return ghostEdge;
}

// input weight events
{
    input.addEventListener("blur", () => {
        input.style.display = "none";
        input.value = "";
    });

    input.addEventListener("keydown", (e) => {
        let key = e.key;

        // update the weight if Enter is pressed
        if (key == "Enter") {
            input.style.display = "none";

            // prevent empty weight
            if (input.value != '')
                currentWeight.textContent = input.value.slice();

            return;
        }

        // if key is not a number -> dont allow
        const isKeyValid = /^[0-9]$/.test(key) || key == 'Backspace'
        if (!isKeyValid) {
            console.log("Only numbers allowed!");
            e.preventDefault();
        }

        // 0 cannot be first digit of more that one digit number
        if (input.value == '0' && key != 'Backspace') {
            e.preventDefault();
        }

        // 3 digits max
        if (input.value.length >= MAX_WEIGHT_DIGITS && key != 'Backspace') {
            console.log("3 digits max");
            e.preventDefault();
        }
    });
}

// returns the center between two dots
function getCurvedCenterFromNodes(node1, node2) {

    const [x1, y1] = getNodeCords(node1);
    const [x2, y2] = getNodeCords(node2);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);

    let cx = (x1 + x2) / 2;
    let cy = (y1 + y2) / 2;

    if (len !== 0) {
        const nx = -dy / len;
        const ny = dx / len;
        const curve = 20;
        cx += nx * curve;
        cy += ny * curve;
    }

    return [cx, cy];
}

// update edges position while moving
function updateEdgesPosition(node) {

    const [x1, y1] = getNodeCords(node);

    graph.get(node).forEach((edge) => {
        const line = edge[2];
        if (directional_graph) {
            // if this node is the start of this edge
            if (edge.indexOf(node) == 0) {
                const secondNode = edge[1];
                const [x2, y2] = getNodeCords(secondNode);
                const [cx, cy] = getCurvedCenterFromNodes(node, secondNode);

                //update line cords
                line.setAttribute("d", `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`);

            } else { // if this node is the end of this edge
                const secondNode = edge[0];
                const [x2, y2] = getNodeCords(secondNode);
                const [cx, cy] = getCurvedCenterFromNodes(secondNode, node);

                //update line cords
                line.setAttribute("d", `M ${x2},${y2} Q ${cx},${cy} ${x1},${y1}`);
            }
        }
        else {
            // if this node is the start node of this edge
            if (edge.indexOf(node) == 0) {
                line.setAttribute("x1", `${x1}`);
                line.setAttribute("y1", `${y1}`);
            } else {    // if this node is the end node of this edge
                line.setAttribute("x2", `${x1}`);
                line.setAttribute("y2", `${y1}`);
            }
        }
        updateWeightPosition(edge);
    })
}

function removeConnectedLines(node) {
    node.getBoundingClientRect();
    const neighbors = [];

    graph.get(node).forEach((elem) => {
        // removing all edgess tarting from node
        const line = elem[2];
        edgesGroup.removeChild(line);
        const weight = elem[3];
        weightsGroup.removeChild(weight);

        // collect neighbors
        const neighbor = elem[0] == node ? elem[1] : elem[0];
        neighbors.push(neighbor);
    })

    // remove edges from neighbors in 'edgesByNode'
    neighbors.forEach((neighbor) => {
        const neighborEdges = graph.get(neighbor);
        const newNeighborEdges = neighborEdges.filter(elem =>
            elem[0] !== node && elem[1] !== node);
        graph.set(neighbor, newNeighborEdges);
    })


    graph.delete(node);
}

function getNodeCords(node) {
    const boardRect = svg.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();

    const x = nodeRect.left - boardRect.left + RADIUS;
    const y = nodeRect.top - boardRect.top + RADIUS;

    return [x, y];
}

// removes edge from graph DB, removes it from both nodes
function removeEdge(edgeToRemove) {
    const node1 = edgeToRemove[0];
    const node2 = edgeToRemove[1];

    const index1 = getEdgeIndexFromStartNode(node1, edgeToRemove);
    const index2 = getEdgeIndexFromStartNode(node2, edgeToRemove);

    // remove edges from graph (from both nodes)
    graph.get(node1).splice(index1, 1);
    graph.get(node2).splice(index2, 1);
}

/* 
   return the index of an edge in a node's edges list in graph
   if not found, returns null
*/
function getEdgeIndexFromStartNode(node, edge) {
    nodeEdges = graph.get(node);

    const startNode = edge[0];
    const endNode = edge[1];

    // for every node in starting node edges list
    for (var i = 0; i < nodeEdges.length; i++) {
        const currEdge = nodeEdges[i];
        const currStartNode = currEdge[0];
        const currEndNode = currEdge[1];

        const isEdgeMatched = (currStartNode == startNode) && (currEndNode == endNode);

        // if the currEdge is matched to edge then return index
        if (isEdgeMatched) return i;
    }

    return null;
}

function updateWeightPosition(edge) {
    const weight = edge[3];
    const node1 = edge[0];
    const node2 = edge[1];

    if (directional_graph) {
        const [cx, cy] = getCurvedCenterFromNodes(node1, node2);

        weight.setAttribute("x", cx);
        weight.setAttribute("y", cy);
    }
    else {
        const [x1, y1] = getNodeCords(node1);
        const [x2, y2] = getNodeCords(node2);

        const xDistance = Math.abs(x1 - x2);
        const xMin = Math.min(x1, x2);
        const yDistance = Math.abs(y1 - y2);
        const yMin = Math.min(y1, y2);

        weight.setAttribute("x", xMin + xDistance / 2);
        weight.setAttribute("y", yMin + yDistance / 2);
    }
}
