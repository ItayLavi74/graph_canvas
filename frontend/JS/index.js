const svgNS = "http://www.w3.org/2000/svg";
const svg = document.getElementById("board")

let nodesCount = 0;

function drawNode(x, y, id) {
    nodesCount++;

    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("transform", `translate(${x}, ${y})`);

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", 0);
    circle.setAttribute("cy", 0);
    circle.setAttribute("r", 30);
    circle.setAttribute("fill", "lightgray");
    circle.setAttribute("stroke", "#c48d00");
    circle.setAttribute("stroke-width", "1px");

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", 0);
    text.setAttribute("y", 0);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.textContent = id;

    g.appendChild(circle);
    g.appendChild(text);
    svg.appendChild(g);

    // MOVE
    g.addEventListener("mousedown", (e) => {
        e.stopPropagation();

        function onMouseMove(e) {
            setCordsToCursor(g, e);
        }

        g.addEventListener("mousemove", onMouseMove);

        g.addEventListener("mouseup", () => {
            g.removeEventListener("mousemove", onMouseMove);
        });
    });

    g.addEventListener("contextmenu", (e) => {
        e.preventDefault();   // מבטל את התפריט של הדפדפן
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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    g.setAttribute("transform", `translate(${x}, ${y})`);
}

