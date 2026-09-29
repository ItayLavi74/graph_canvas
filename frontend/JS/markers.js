// AI generated code
function createArrowMarker(svgNS, id, color) {
    const marker = document.createElementNS(svgNS, "marker");
    marker.setAttribute("id", id);
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "10");
    marker.setAttribute("refX", "10");
    marker.setAttribute("refY", "5");
    marker.setAttribute("orient", "auto");

    const arrowPath = document.createElementNS(svgNS, "path");
    arrowPath.setAttribute("d", "M 5,5 L 0,2 M 5,5 L 0,8");
    arrowPath.setAttribute("stroke", "blue");
    arrowPath.setAttribute("stroke-width", "1px");
    arrowPath.setAttribute("fill", "none");



    marker.appendChild(arrowPath);
    return marker;
}