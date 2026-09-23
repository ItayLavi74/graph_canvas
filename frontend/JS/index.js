const svgNS = "http://www.w3.org/2000/svg";
const svg = document.getElementById("board")

let nodesCount = 0;
const nodes = [];
const RADIUS = 20;

function drawNode(x, y, id) {
    nodesCount++;

    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("transform", `translate(${x}, ${y})`);
    nodes.push(g);

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
    text.textContent = nodes.indexOf(g);

    g.appendChild(circle);
    g.appendChild(text);

    svg.appendChild(g);


    // MOVE
    g.addEventListener("mousedown", (e) => {
        e.stopPropagation();

        function onMouseMove(e) {
            setCordsToCursor(g, e);
        }

        document.addEventListener("mousemove", onMouseMove);

        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", onMouseMove);
        });
    });

    g.addEventListener("contextmenu", (e) => {
        e.preventDefault();

        const index = nodes.indexOf(g);
        console.log(index, nodes)
        nodes.splice(index, 1);
        updateNumbers(index);

        svg.removeChild(g);
    });

    g.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    return g;
}


svg.addEventListener("click", (e) => {
    const rect = svg.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawNode(x, y, nodesCount);
});

function setCordsToCursor(g, e) {
    const rect = svg.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(RADIUS, Math.min(rect.width - RADIUS, x));
    y = Math.max(RADIUS, Math.min(rect.height - RADIUS, y));

    g.setAttribute("transform", `translate(${x}, ${y})`);
}

function updateNumbers(index) {
    console.log(index);
    for (let i = index; i < nodes.length; i++) {
        const text = nodes[i].querySelector("text");
        text.textContent = Number(text.textContent) - 1;
    }
}
