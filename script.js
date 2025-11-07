// Family data — edit this freely
const familyData = {
  name: "Grandparent A", // Person 1 of the couple
  img: "https://placehold.co/80x80?text=G1",
  info: "The root of the family (Person A).",
  
  // Add spouse object
  spouse: { 
      name: "Grandparent B", // Person 2 of the couple
      img: "https://placehold.co/80x80?text=G2",
      info: "The root of the family (Person B).",
      id: "node-spouse-0" // Spouse needs an ID too
  },
    
    // Children belong to the couple
    children: [{
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
// Assign unique IDs to each node in the hierarchy for selection and handle spouses
let idCounter = 0;
const root = d3.hierarchy(familyData).each(d => {
    // Ensure unique ID for primary person
    if (!d.data.id) d.data.id = `node-${idCounter++}`;
    
    // Assign unique ID to spouse if present
    if (d.data.spouse) {
        d.data.spouse.id = `node-${idCounter++}`;
    }
});

treeLayout(root);

// Variable to keep track of the currently selected node ID
let selectedNodeId = null;

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
    .on("click", (event, d) => showPerson(d.data)); // Pass data to showPerson

// Draw primary node content (rect, image, name) - UNCHANGED from previous
// Draw node background
node
    .append("rect")
    .attr("id", d => `rect-${d.data.id}`) // Add unique ID to the rect
    .attr("class", "node-rect") // Add class for base styling
    .attr("x", -80)
    .attr("y", -55)
    .attr("width", 160)
    .attr("height", 110)
    .attr("rx", 12)
    .attr("fill", "white")
    .attr("stroke", "#ddd"); // Base stroke will be overwritten by CSS class

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

// Draw Spouses and Marriage Lines ---
const spacing = 180; // Distance between primary person and spouse

const spouseNode = g
    .selectAll(".spouse-node")
    .data(root.descendants().filter(d => d.data.spouse)) // Filter for nodes with spouses
    .join("g")
    .attr("class", "node spouse-node")
    // Position the spouse (Person 2) to the right of the primary node
    .attr("transform", d => `translate(${d.x + width / 2 + spacing},${d.y + 60})`)
    .style("cursor", "pointer")
    // Handle clicks on the spouse
    .on("click", (event, d) => showPerson(d.data.spouse));

// Draw spouse background (similar to primary node)
spouseNode
    .append("rect")
    .attr("id", d => `rect-${d.data.spouse.id}`)
    .attr("class", "node-rect")
    .attr("x", -80)
    .attr("y", -55)
    .attr("width", 160)
    .attr("height", 110)
    .attr("rx", 12)
    .attr("fill", "white")
    .attr("stroke", "#ddd");

// Spouse Image
spouseNode
    .append("image")
    .attr("href", d => d.data.spouse.img)
    .attr("x", -30)
    .attr("y", -35)
    .attr("width", 60)
    .attr("height", 60)
    .attr("clip-path", "circle(30px)");

// Spouse Name
spouseNode
    .append("text")
    .attr("dy", 45)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .text(d => d.data.spouse.name);

// Draw the horizontal marriage link
g.selectAll(".marriage-link")
    .data(root.descendants().filter(d => d.data.spouse))
    .join("line")
    .attr("class", "link marriage-link")
    // Start X: Center of primary person
    .attr("x1", d => d.x + width / 2)
    // End X: Center of spouse
    .attr("x2", d => d.x + width / 2 + spacing) 
    // Y: Draw above the node for clarity
    .attr("y1", d => d.y + 60 - 55) 
    .attr("y2", d => d.y + 60 - 55)
    .attr("stroke", "#2196F3") // Use a distinct color for marriage
    .attr("stroke-width", 3);

// --- Parent-Child Link Fix ---
// This part needs adjustment because the parent is now the center of the couple.
// We change the vertical link start point to be the midpoint between the couple.

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
            // X position is centered between the primary node and the spouse
            .x(d => d.x + width / 2 + (d.source.data.spouse ? spacing / 2 : 0))
            .y(d => d.y + 60)
    );
    
// Zoom + pan
const zoom = d3.zoom().scaleExtent([0.3, 2]).on("zoom", e => g.attr("transform", e.transform));
svg.call(zoom);
svg.on("dblclick", () => svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity));

// Person details box
function showPerson(person) {
    const box = document.getElementById("person-details");
    box.innerHTML = `
        <div style="display:flex;gap:1rem;align-items:center;">
          <img src="${person.img}" width="100" height="100" style="border-radius:12px;object-fit:cover;">
          <div>
            <h2>${person.name}</h2>
            <p>${person.info}</p>
          </div>
        </div>
      `;

    // 1. Smoothly scroll to the info box (UX improvement)
    box.scrollIntoView({ behavior: "smooth", block: "start" });

    // 2. Visually highlight the selected person
    if (selectedNodeId) {
        // Remove highlight from the previously selected node
        d3.select(`#rect-${selectedNodeId}`).classed("selected-node", false);
    }

    // Apply highlight to the newly selected node
    d3.select(`#rect-${person.id}`).classed("selected-node", true);
    
    // Update the tracker
    selectedNodeId = person.id;
}