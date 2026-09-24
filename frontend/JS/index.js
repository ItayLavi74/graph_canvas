const svgNS = "http://www.w3.org/2000/svg";
const svg = document.getElementById("board")

//group to store all edges - fix z cords
const edgesGroup = document.createElementNS(svgNS, "g");
svg.appendChild(edgesGroup);
const weightsGroup = document.createElementNS(svgNS, "g");
svg.appendChild(weightsGroup);

const nodes = [];
const RADIUS = 20;
const createEdge = [];
let didDrag = false;
let didInputWeight = false;

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

            setTimeout(drawEdge, 300);

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


function drawEdge() {

    node1 = createEdge[0];
    node2 = createEdge[1];

    node1Rect = createEdge[0].getBoundingClientRect();
    node2Rect = createEdge[1].getBoundingClientRect();

    boardRect = svg.getBoundingClientRect();

    const line = document.createElementNS(svgNS, "line");

    const x1 = node1Rect.left - boardRect.left + RADIUS;
    const y1 = node1Rect.top - boardRect.top + RADIUS;
    const x2 = node2Rect.left - boardRect.left + RADIUS;
    const y2 = node2Rect.top - boardRect.top + RADIUS;

    //set line attributes
    {
        line.setAttribute("x1", `${x1}`);
        line.setAttribute("y1", `${y1}`);
        line.setAttribute("x2", `${x2}`);
        line.setAttribute("y2", `${y2}`);
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", "5px");
    }

    const weight = document.createElementNS(svgNS, "text");
    // set weight attributes
    {
        const xDistance = Math.abs(x1 - x2);
        const xMin = Math.min(x1, x2);
        const yDistance = Math.abs(y1 - y2);
        const yMin = Math.min(y1, y2);

        weight.textContent = '0';
        weight.setAttribute("x", xMin + xDistance / 2);
        weight.setAttribute("y", yMin + yDistance / 2);
        weight.setAttribute("fill", "green");
        weight.classList.add("weight");
    }

    const edge = [node1, node2, line, weight];

    edgesByNode.get(node1).push(edge);
    edgesByNode.get(node2).push(edge);

    // draw edge line and weight
    edgesGroup.appendChild(line);
    weightsGroup.appendChild(weight);

    // delete line on right click
    line.addEventListener("contextmenu", (e) => {
        e.preventDefault();

        // remove line from screen
        edgesGroup.removeChild(line);
        weightsGroup.removeChild(weight);

        // remove edge from DB
        removeEdge(edge);
    })
    
    const input = document.getElementById("input-weight");

    weight.addEventListener("click", (e) => {
        e.stopPropagation();
        
        didInputWeight = true;
        
        const weightRect = weight.getBoundingClientRect();
        const x = weightRect.left;
        const y = weightRect.top;
        
        
        input.style.display = "block";
        input.style.left = x + "px";
        input.style.top = y + "px";
        
        input.focus();
        
        
    })
    
    input.addEventListener("blur", () => {
        input.style.display = "none";
        input.value = "";
    })

    input.addEventListener("keydown", (e) => {
        if (e.key != "Enter") return;

        weight.textContent = input.value.slice();

        input.style.display = "none";
        input.value.reset();
    })

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

        updateWeightPosition(edge);
    })
}

function removeConnectedLines(node) {
    const neighbors = [];

    edgesByNode.get(node).forEach((elem) => {
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
        const neighborEdges = edgesByNode.get(neighbor);
        const newNeighborEdges = neighborEdges.filter(elem =>
            elem[0] !== node && elem[1] !== node);
        edgesByNode.set(neighbor, newNeighborEdges);
    })


    edgesByNode.delete(node);
}

function removeEdge(edge) {
    node1 = edge[0];
    node2 = edge[1];

    node1edges = edgesByNode.get(node1);
    node2edges = edgesByNode.get(node2);

    index1 = node1edges.indexOf(edge);
    index2 = node2edges.indexOf(edge);

    node1edges.splice(index1, 1);
    node2edges.splice(index2, 1);
}

function updateWeightPosition(edge) {
    const weight = edge[3];

    const node1 = edge[0];
    const node2 = edge[1];
    const node1Rect = node1.getBoundingClientRect();
    const node2Rect = node2.getBoundingClientRect();

    const boardRect = svg.getBoundingClientRect();

    const x1 = node1Rect.left - boardRect.left + RADIUS;
    const y1 = node1Rect.top - boardRect.top + RADIUS;
    const x2 = node2Rect.left - boardRect.left + RADIUS;
    const y2 = node2Rect.top - boardRect.top + RADIUS;

    const xDistance = Math.abs(x1 - x2);
    const xMin = Math.min(x1, x2);
    const yDistance = Math.abs(y1 - y2);
    const yMin = Math.min(y1, y2);

    weight.setAttribute("x", xMin + xDistance / 2);
    weight.setAttribute("y", yMin + yDistance / 2);

}

function inputWeight(weight) {
    didInputWeight = true;

    const weightRect = weight.getBoundingClientRect();
    const x = weightRect.left;
    const y = weightRect.top;

    const input = document.getElementById("input-weight");

    input.style.display = "block";
    input.style.left = x + "px";
    input.style.top = y + "px";

    input.focus();

    input.addEventListener("blur", () => {
        input.style.display = "none";
        input.value = "";
    })

    input.addEventListener("keydown", (e) => {
        if (e.key != "Enter") return;

        weight.textContent = input.value;

        input.style.display = "none";
        input.value.reset();
    })
}
