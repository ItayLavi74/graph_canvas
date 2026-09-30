# Graph Visualizer & Solver

An interactive browser-based tool for drawing and visualizing graphs, including nodes, weighted edges, and direction.

The frontend application converts the drawn graph structure into an adjacency list and sends it to the `algo_runner` backend service to execute pathfinding and graph algorithms (such as Dijkstra).

## Features

- Interactive graph drawing (add, drag, and delete nodes).
- Weighted edges with editable weights.
- Context menu support (right-click to delete nodes or edges).
- Support for directed and undirected graphs (configurable via the `directional_graph` boolean constant in `graph_drawer.js`).
- Converts the visual graph into an adjacency list JSON format.
- Sends graph payload to `algo_runner` backend API.

## Setup & Usage

1. Start the `algo_runner` backend service on `http://localhost:5000`.
2. Open `index.html` in a web browser.
3. Draw nodes and edges on the canvas.
4. Click **Run** to execute the algorithm via the backend and view the results.
