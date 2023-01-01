var width = 460,
    height = 460,
    radius = 250;

var color = d3.scale.category10().range();

var cluster = d3.layout.cluster()
    .size([360, radius - 140])
//    .sort(function(a, b) { return d3.ascending(a.name, b.name); });
;

var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.45)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + [width / 2, height / 2] + ")");
var defs = svg.append('defs');

function getData() {
    return [
        {"name":"Female.Ann",     "imports":["Female.Brenda"]},
        {"name":"Female.Brenda",  "imports":["Male.Bill"]},
        {"name":"Female.Claudia", "imports":["Male.Andrew"]},
        {"name":"Female.Deborah", "imports":["Male.Darryl"]},
        {"name":"Female.Emily",   "imports":["Male.Andrew"]},
        {"name":"Female.Flora",   "imports":["Male.Darryl"]},
        {"name":"Female.Gia",     "imports":["Male.Darryl"]},
        {"name":"Female.Hannah",  "imports":["Male.Curtis"]},
        {"name":"Female.Irene",   "imports":["Male.Hugh"]},
        {"name":"Male.Andrew",    "imports":["Female.Emily"]},
        {"name":"Male.Bill",      "imports":["Female.Emily"]},
        {"name":"Male.Curtis",    "imports":["Female.Emily"]},
        {"name":"Male.Darryl",    "imports":["Female.Claudia"]},
        {"name":"Male.Edgar",     "imports":["Female.Claudia"]},
        {"name":"Male.Franklin",  "imports":["Female.Claudia"]},
        {"name":"Male.George",    "imports":["Female.Claudia"]},
        {"name":"Male.Hugh",      "imports":["Female.Claudia"]}
    ];
};


// Return a list of imports for the given array of nodes.
function packageImports(nodes) {

    var map = {};
    var imports = [];

    nodes.forEach(function(d) {
        map[d.name] = d;
    });

    nodes.forEach(function(d) {
        if (d.imports) {
            d.imports.forEach(function(i) {
                imports.push({
                    'source' : map[d.name],
                    'target' : map[i]
                });
            });
        }
    });

    return imports;
}

  var xnodes = {
        "name":"",
        "children":[{
            "name":"Female",
            "children": getData()
        }]
    };

  var links = packageImports(cluster.nodes(xnodes)).map(function(d, i) {
      d.index = i;
      return d;
  });

  xnodes.children = xnodes.children[0].children.map(function(d) {
      d.children = [];
      return d;
  });

  var nodes = cluster.nodes(xnodes);
  var splines = bundle(links);

  var path = svg.selectAll("path.link")
      .data(links)
    .enter().append("path")
      .attr("class", function(d) { return "link source-" + d.source.key + " target-" + d.target.key; })
      .attr("d", function(d) { return line(splines[d.index]); });

    svg.selectAll('circle.xxx')
        .data(nodes.filter(function(n) { return ! n.children.length; }))
        .enter()
        .append('circle')
        .attr('r', 2)
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });

  var nodeSelection = svg.selectAll("g.node")
      .data(nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("id", function(d) { return "node-" + d.key; })
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });
    nodeSelection.append("text")
      .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
      .text(function(d) { return d.name; })
      .style('fill', function(d) {
          return d.name.substring(0, d.name.indexOf('.')) == 'Male' ? color[0] : color[1];
      })
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

  function mouseover(d) {

        var links = svg.selectAll("path.link").filter(function(link) {
            return link.target == d || link.source == d;
        });

        for (var i = 0; i < links[0].length; i ++) {
            var gradient = defs.append('linearGradient')
                .attr('id', 'link-gradient-' + i);
            gradient.append('stop')
                .attr('stop-color', color[0]);
            gradient.append('stop')
                .attr('stop-color', color[1])
                .attr('offset', '100%');
        }

        links.style("stroke-width", 5)
            .each(function(d, i) {
                d3.select(this).style('stroke', 'url(#link-gradient-' + i + ')')
            });
  }

function mouseout(d) {
    svg.selectAll("path.link").style("stroke-width", null)
        .style("stroke", null);
    defs.selectAll('*').remove();
}

function updateNodes(name, value) {
  return function(d) {
    if (value) this.parentNode.appendChild(this);
    svg.select("#node-" + d[name].key).classed(name, value);
  };
}
