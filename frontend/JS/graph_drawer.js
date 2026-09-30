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

const directional_graph = true;

const nodes = [];
const RADIUS = 20;
const createEdge = [];
let didDrag = false;
let didInputWeight = false;
let currentEdge = null;
let isSecondEdge = false;

const graph = new Map();
const linesByNode = new Map();

function drawNode(x, y) {

    const node = document.createElementNS(svgNS, "g");
    node.setAttribute("transform", `translate(${x}, ${y})`);

    nodes.push(node);
    graph.set(node, []);

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
    text.textContent = String.fromCharCode(nodes.indexOf(node) + 65);

    node.appendChild(circle);
    node.appendChild(text);

    svg.appendChild(node);


    // MOVE
    node.addEventListener("mousedown", (e) => {
        e.stopPropagation();

        function onMouseMove(e) {
            didDrag = true;
            setCordsToCursor(node, e);
        }

        document.addEventListener("mousemove", onMouseMove);

        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", onMouseMove);
        });

    });

    node.addEventListener("click", (e) => {
        e.preventDefault();

        if (didDrag || didInputWeight) {
            didDrag = false;
            didInputWeight = false;
            return;
        }

        if (createEdge[0] == node) {
            circle.setAttribute("stroke", "#c48d00")
            createEdge.pop()
        } else if (createEdge.length == 1) {
            // if we are choosing the second node
            circle.setAttribute("stroke", "#0db8c4")
            createEdge.push(node);

            setTimeout(() => { drawEdge(createEdge[0], createEdge[1]) }, 100);

        } else {
            circle.setAttribute("stroke", "#0db8c4")
            createEdge.push(node)
        }
    });

    // delete node on right click
    node.addEventListener("contextmenu", (e) => {
        e.preventDefault();

        // updating number on other nodes by
        // removing this node from the nodes array
        const index = nodes.indexOf(node);
        nodes.splice(index, 1);
        updateNodesCharsAfterDelete(index);

        // remove all lines connected to this node
        removeConnectedLines(node);

        svg.removeChild(node);
    })

    node.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    return node;
}

// svg event listeners
{
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

    svg.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });
}

// while draging a node, update node and related edges position
function setCordsToCursor(node, e) {
    const rect = svg.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(RADIUS, Math.min(rect.width - RADIUS, x));
    y = Math.max(RADIUS, Math.min(rect.height - RADIUS, y));

    node.setAttribute("transform", `translate(${x}, ${y})`);
    updateEdgesPosition(node);
}

// update nodes chars starting from index on nodes array
function updateNodesCharsAfterDelete(index) {
    for (let i = index; i < nodes.length; i++) {
        const text = nodes[i].querySelector("text");
        text.textContent = String.fromCharCode(i + 65);
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
        console.log("The edge you are trying to draw is already exist.");
        resetSelectedEdges();
        return;
    }

    let line;

    const [x1, y1] = getNodeCords(node1);
    const [x2, y2] = getNodeCords(node2);

    // create weight
    const weight = document.createElementNS(svgNS, "text");

    // create edge
    const edge = [node1, node2, line, weight, null];
    const twinEdge = hasTwinEdge(edge);

    // update twins pointers if needed
    if (twinEdge != null) {
        edge[4] = twinEdge;
        twinEdge[4] = edge;
    }

    //set line attributes
    if (directional_graph) { // if graph is diractional
        line = document.createElementNS(svgNS, "path");

        line.setAttribute("fill", "none");
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", "3px");

        // add arrow and curve if needed
        // curve is defined in 'getCenterFromEdge'
        const [cx, cy] = getCenterFromEdge(edge);
        line.setAttribute("d", `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`);
        line.setAttribute("marker-end", "url(#arrowhead-black)");
    }
    else { // if graph is not directional
        line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", `${x1}`);
        line.setAttribute("y1", `${y1}`);
        line.setAttribute("x2", `${x2}`);
        line.setAttribute("y2", `${y2}`);
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", "4px");
    }
    // updates edge's line pointer
    edge[2] = line;

    // set weight attributes
    {
        weight.textContent = '0';
        weight.setAttribute("fill", "blue");
        weight.classList.add("weight");

        updateWeightPosition(edge);
    }

    graph.get(node1).push(edge);
    graph.get(node2).push(edge);

    // if graph is non dircational add the reversed edge (considered as twin edge)
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

            const twinEdge = edge[4];
            if (directional_graph && twinEdge != null) {
                twinEdge[4] = null;
                updateEdgeCurve(twinEdge);
            }

            // remove doubled line if graph is non directional
            if (!directional_graph) {
                const twinEdge = edge[4];
                const twinLine = twinEdge[2];
                const twinWeight = twinEdge[3];

                edgesGroup.removeChild(twinLine);
                weightsGroup.removeChild(twinWeight);
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
            currentEdge = edge;

            const weightRect = weight.getBoundingClientRect();
            const x = weightRect.left;
            const y = weightRect.top;


            input.style.display = "block";
            input.style.left = x + "px";
            input.style.top = y + "px";

            input.focus();

        })
    }

    // update curve for twin edge if needed (checkd in function)
    updateEdgeCurve(twinEdge);

    resetSelectedEdges();
    createEdge.length = 0;
}

function updateEdgeCurve(edge) {
    // console.log("edge to curve update:", edge);
    if (edge == null || !directional_graph) return;
    updateLineCurve(edge);
    updateWeightPosition(edge);
}

// update line curve
function updateLineCurve(edge) {
    const [node1, node2, line] = edge;

    const [x1, y1] = getNodeCords(node1);
    const [x2, y2] = getNodeCords(node2);

    const [cx, cy] = getCenterFromEdge(edge);

    line.setAttribute("d", `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`);
}

// check if edge has twin (edge with similar nodes) and return it if it does, 
// return null otherwise
function hasTwinEdge(edge) {
    const [node1, node2] = edge;

    let reversedEdge = null;
    graph.get(node1).forEach((currEdge) => {
        const [currNode1, currNode2] = currEdge;

        const isReversedMatch = (node1 == currNode2) && (node2 == currNode1);

        if (isReversedMatch) reversedEdge = currEdge;
    })

    return reversedEdge;
}

// reset selected nodes (stroke colors and DB)
function resetSelectedEdges() {

    createEdge.forEach(elem => {
        circle = elem.querySelector("circle");
        circle.setAttribute("stroke", "#c48d00")
    });

    createEdge.length = 0;
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
            if (input.value != '') {
                const weight = currentEdge[3];

                weight.textContent = input.value.slice();
                // update the twin edge if graph isn't directional
                if (!directional_graph) {
                    const twinEdge = currentEdge[4];
                    const twinWeight = twinEdge[3];

                    twinWeight.textContent = weight.textContent;

                }
            }


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
function getCenterFromEdge(edge) {
    const [node1, node2] = edge;

    const [x1, y1] = getNodeCords(node1);
    const [x2, y2] = getNodeCords(node2);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);

    let cx = (x1 + x2) / 2;
    let cy = (y1 + y2) / 2;

    // if directional or there is no twin -> dont curve
    if (directional_graph && edge[4] != null && len !== 0) {
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
                const [cx, cy] = getCenterFromEdge(edge);

                //update line cords
                line.setAttribute("d", `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`);

            } else { // if this node is the end of this edge
                const secondNode = edge[0];
                const [x2, y2] = getNodeCords(secondNode);
                const [cx, cy] = getCenterFromEdge(edge);

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
        // removing all edgess starting from node
        const line = elem[2];
        edgesGroup.removeChild(line);
        const weight = elem[3];
        weightsGroup.removeChild(weight);

        // collect neighbors
        const neighbor = elem[0] == node ? elem[1] : elem[0];
        neighbors.push(neighbor);
    })

    // remove edges from neighbors in graph
    neighbors.forEach((neighbor) => {
        const neighborEdges = graph.get(neighbor);
        const newNeighborEdges = neighborEdges.filter(elem =>
            elem[0] !== node && elem[1] !== node);
        graph.set(neighbor, newNeighborEdges);
    })

    graph.delete(node);
}

// return x,y cords of node
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

// update weight text position to match line (handles curved lines)
function updateWeightPosition(edge) {
    const weight = edge[3];

    const [cx, cy] = getCenterFromEdge(edge);
    weight.setAttribute("x", cx);
    weight.setAttribute("y", cy);
}
