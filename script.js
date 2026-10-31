let edges = [];
let nodes = [];

// Add an edge
function addEdge() {

    let from = document.getElementById("fromNode").value.trim().toUpperCase();
    let to = document.getElementById("toNode").value.trim().toUpperCase();
    let weight = Number(document.getElementById("weight").value);

    if (from === "" || to === "" || weight === "") {
        alert("Please enter From, To and Cost.");
        return;
    }

    if (from === to) {
        alert("A node cannot connect to itself.");
        return;
    }

    if (weight <= 0) {
        alert("Cost must be greater than 0.");
        return;
    }

    if (!nodes.includes(from)) {
        nodes.push(from);
    }

    if (!nodes.includes(to)) {
        nodes.push(to);
    }

    edges.push({
        from: from,
        to: to,
        weight: weight
    });

    displayEdges();
    drawGraph();

    document.getElementById("fromNode").value = "";
    document.getElementById("toNode").value = "";
    document.getElementById("weight").value = "";
}


// Display all edges
function displayEdges() {

    let edgeList = document.getElementById("edgeList");

    if (edges.length === 0) {
        edgeList.innerHTML = "<p>No edges added yet.</p>";
        return;
    }

    edgeList.innerHTML = "";

    edges.forEach((edge, index) => {

        let div = document.createElement("div");

        div.className = "edge-item";

        div.innerHTML =
            (index + 1) + ". " +
            edge.from + " → " +
            edge.to +
            " | Cost = " +
            edge.weight;

        edgeList.appendChild(div);
    });
}


// Create positions for nodes
function getNodePositions() {

    let graph = document.getElementById("graph");

    let width = graph.clientWidth;
    let height = graph.clientHeight;

    let centerX = width / 2;
    let centerY = height / 2;

    let radius = Math.min(width, height) / 2.8;

    let positions = {};

    nodes.forEach((node, index) => {

        let angle = (2 * Math.PI * index) / nodes.length;

        positions[node] = {
            x: centerX + radius * Math.cos(angle) - 22,
            y: centerY + radius * Math.sin(angle) - 22
        };
    });

    return positions;
}


// Draw graph
function drawGraph(highlightEdges = []) {

    let graph = document.getElementById("graph");

    graph.innerHTML = "";

    if (nodes.length === 0) {
        graph.innerHTML =
            "<p style='text-align:center;padding:100px;'>Add edges to create a graph.</p>";
        return;
    }

    let positions = getNodePositions();

    // Draw edges first
    edges.forEach(edge => {

        let p1 = positions[edge.from];
        let p2 = positions[edge.to];

        let line = document.createElement("div");

        line.className = "edge-line";

        let x1 = p1.x + 22;
        let y1 = p1.y + 22;

        let x2 = p2.x + 22;
        let y2 = p2.y + 22;

        let dx = x2 - x1;
        let dy = y2 - y1;

        let length = Math.sqrt(dx * dx + dy * dy);

        let angle = Math.atan2(dy, dx) * 180 / Math.PI;

        line.style.width = length + "px";
        line.style.left = x1 + "px";
        line.style.top = y1 + "px";
        line.style.transform = "rotate(" + angle + "deg)";

        let isMST = highlightEdges.some(e =>
            e.from === edge.from &&
            e.to === edge.to &&
            e.weight === edge.weight
        );

        if (isMST) {
            line.style.background = "#2e7d32";
            line.style.height = "5px";
        }

        graph.appendChild(line);

        // Weight label
        let label = document.createElement("div");

        label.className = "edge-label";

        label.innerText = edge.weight;

        label.style.left = ((x1 + x2) / 2) + "px";
        label.style.top = ((y1 + y2) / 2) + "px";

        graph.appendChild(label);
    });


    // Draw nodes
    nodes.forEach(node => {

        let div = document.createElement("div");

        div.className = "node";

        div.innerText = node;

        div.style.left = positions[node].x + "px";
        div.style.top = positions[node].y + "px";

        graph.appendChild(div);
    });
}


// Disjoint Set functions for Kruskal
function find(parent, node) {

    if (parent[node] !== node) {
        parent[node] = find(parent, parent[node]);
    }

    return parent[node];
}


function union(parent, rank, a, b) {

    let rootA = find(parent, a);
    let rootB = find(parent, b);

    if (rootA === rootB) {
        return false;
    }

    if (rank[rootA] < rank[rootB]) {
        parent[rootA] = rootB;
    }
    else if (rank[rootA] > rank[rootB]) {
        parent[rootB] = rootA;
    }
    else {
        parent[rootB] = rootA;
        rank[rootA]++;
    }

    return true;
}


// Kruskal Algorithm
function runKruskal() {

    if (nodes.length < 2) {
        alert("Please add at least two nodes.");
        return;
    }

    let sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

    let parent = {};
    let rank = {};

    nodes.forEach(node => {
        parent[node] = node;
        rank[node] = 0;
    });

    let mst = [];
    let totalCost = 0;

    for (let edge of sortedEdges) {

        if (union(parent, rank, edge.from, edge.to)) {

            mst.push(edge);
            totalCost += edge.weight;
        }

        if (mst.length === nodes.length - 1) {
            break;
        }
    }

    showResult("Kruskal's Algorithm", mst, totalCost);
}


// Prim Algorithm
function runPrim() {

    if (nodes.length < 2) {
        alert("Please add at least two nodes.");
        return;
    }

    let visited = new Set();
    let mst = [];
    let totalCost = 0;

    let start = nodes[0];

    visited.add(start);

    while (visited.size < nodes.length) {

        let possibleEdges = edges.filter(edge => {

            return (
                (visited.has(edge.from) && !visited.has(edge.to)) ||
                (visited.has(edge.to) && !visited.has(edge.from))
            );
        });

        if (possibleEdges.length === 0) {
            break;
        }

        possibleEdges.sort((a, b) => a.weight - b.weight);

        let selected = possibleEdges[0];

        mst.push(selected);
        totalCost += selected.weight;

        visited.add(selected.from);
        visited.add(selected.to);
    }

    if (mst.length !== nodes.length - 1) {

        document.getElementById("result").innerHTML =
            "<h3>Graph is not connected.</h3>" +
            "<p>A Minimum Spanning Tree cannot be formed.</p>";

        return;
    }

    showResult("Prim's Algorithm", mst, totalCost);
}


// Show algorithm result
function showResult(algorithm, mst, totalCost) {

    let result = document.getElementById("result");

    if (mst.length !== nodes.length - 1) {

        result.innerHTML =
            "<h3>Graph is not connected.</h3>" +
            "<p>MST cannot be formed.</p>";

        return;
    }

    let html =
        "<h3>" + algorithm + "</h3>" +
        "<p><strong>Selected Edges:</strong></p>";

    mst.forEach((edge, index) => {

        html +=
            "<div class='edge-item mst-edge'>" +
            (index + 1) +
            ". " +
            edge.from +
            " — " +
            edge.to +
            " = " +
            edge.weight +
            "</div>";
    });

    html +=
        "<div class='total-cost'>" +
        "Minimum Cost = " +
        totalCost +
        "</div>";

    result.innerHTML = html;

    drawGraph(mst);
}


// Reset everything
function resetGraph() {

    edges = [];
    nodes = [];

    document.getElementById("edgeList").innerHTML =
        "<p>No edges added yet.</p>";

    document.getElementById("result").innerHTML =
        "<p>Run an algorithm to find the Minimum Cost Spanning Tree.</p>";

    drawGraph();
}