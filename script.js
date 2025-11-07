// Family data — edit this freely
const familyData = {
  name: "Grandparents",
  img: "https://placehold.co/80x80?text=G",
  info: "The root of the family.",
  children: [
    {
      name: "Alice",
      img: "https://placehold.co/80x80?text=A",
      info: "Alice — born 1930. Loved gardening and cooking.",
      children: [
        {
          name: "Carol",
          img: "https://placehold.co/80x80?text=C",
          info: "Carol — daughter of Alice. Remembered for her paintings."
        },
        {
          name: "David",
          img: "https://placehold.co/80x80?text=D",
          info: "David — son of Alice. Engineer, loved trains."
        }
      ]
    },
    {
      name: "Ben",
      img: "https://placehold.co/80x80?text=B",
      info: "Ben — brother of Alice. Traveled widely.",
      children: [
        {
          name: "Eve",
          img: "https://placehold.co/80x80?text=E",
          info: "Eve — Ben's daughter, an avid reader."
        }
      ]
    }
  ]
};

const svg = d3.select("#family-tree");
const width = document.getElementById("tree-container").clientWidth;
const height = 600;
const g = svg
  .attr("viewBox", [0, 0, width, height])
  .append("g");

const treeLayout = d3.tree().nodeSize([160, 120]);
const root = d3.hierarchy(familyData);
treeLayout(root);

// Links
g.selectAll(".link")
  .data(root.links())
  .join("path")
  .attr("class", "link")
  .attr("fill", "none")
  .attr("stroke", "#aaa")
  .attr("stroke-width", 2)
  .attr(
    "d",
    d3
      .linkVertical()
      .x(d => d.x + width / 2)
      .y(d => d.y + 60)
  );

// Nodes
const node = g
  .selectAll(".node")
  .data(root.descendants())
  .join("g")
  .attr("class", "node")
  .attr("transform", d => `translate(${d.x + width / 2},${d.y + 60})`)
  .style("cursor", "pointer")
  .on("click", (_, d) => showPerson(d));

// Draw node background
node
  .append("rect")
  .attr("class", "node-rect")
  .attr("x", -80)
  .attr("y", -55)
  .attr("width", 160)
  .attr("height", 110)
  .attr("rx", 12)
  .attr("fill", "white")
  .attr("stroke", "#ddd")
  .attr("stroke-width", 2);

// Image
node
  .append("image")
  .attr("href", d => d.data.img)
  .attr("x", -30)
  .attr("y", -35)
  .attr("width", 60)
  .attr("height", 60)
  .attr("clip-path", "circle(30px)");

// Name
node
  .append("text")
  .attr("dy", 45)
  .attr("text-anchor", "middle")
  .attr("font-weight", "bold")
  .text(d => d.data.name);

// Zoom + pan
const zoom = d3.zoom().scaleExtent([0.3, 2]).on("zoom", e => g.attr("transform", e.transform));
svg.call(zoom);
svg.on("dblclick", () => svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity));

// Keep track of currently selected node
let selectedNode = null;

// Person details box with highlighting and smooth scroll
function showPerson(nodeData) {
  // Remove highlight from previously selected node
  if (selectedNode) {
    d3.select(selectedNode)
      .select(".node-rect")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 2);
  }

  // Highlight the newly selected node
  const currentNode = d3.selectAll(".node")
    .filter(d => d === nodeData)
    .node();
  
  if (currentNode) {
    d3.select(currentNode)
      .select(".node-rect")
      .attr("stroke", "#2563eb")
      .attr("stroke-width", 4);
    
    selectedNode = currentNode;
  }

  // Update the details box
  const box = document.getElementById("person-details");
  box.innerHTML = `
    <div style="display:flex;gap:1rem;align-items:center;">
      <img src="${nodeData.data.img}" width="100" height="100" style="border-radius:12px;object-fit:cover;">
      <div>
        <h2>${nodeData.data.name}</h2>
        <p>${nodeData.data.info}</p>
      </div>
    </div>
  `;

  // Smooth scroll to the details box
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}