function legend(where) {
    this.container = d3.select(where);

    this.width = this.container.node().clientWidth;
    this.height = this.width * 0.06;

    this.svg = this.container.append("svg")
        .attr("width", this.width)
        .attr("height", this.height);

    this.draw();
}

legend.prototype.draw = function() {
    // create the svg:defs element and the main gradient definition
    let svgDefs = this.svg.append("defs");

    let mainGradient = svgDefs.append('linearGradient')
        .attr("id", 'mainGradient');

    mainGradient.append('stop')
        .attr('class', 'stop-left')
        .attr('offset', '0');

    mainGradient.append('stop')
        .attr('class', 'stop-right')
        .attr("offset", '1');

    let bar = this.svg.append("rect")
        .classed("filled", true)
        .attr("x", 0)
        .attr("y", this.height / 2)
        .attr("width", this.width / 4)
        .attr("height", this.height / 6);

    let text = this.svg.append("text")
        .attr("x", this.width / 8)
        .attr("y", this.height / 3)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "black")
        .text("Number of simulations");

    let textL = this.svg.append("text")
        .attr("x", 0)
        .attr("y", this.height / 3)
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .text("0");

    let textR = this.svg.append("text")
        .attr("x", this.width / 4)
        .attr("y", this.height / 3)
        .style("text-anchor", "end")
        .style("font-size", "12px")
        .text("6");

    let sim = this.svg.append("text")
        .attr("x", this.width / 4 + this.height)
        .attr("y", this.height * 3 / 5)
        .style("text-anchor", "start")
        .style("font-size", "14px")
        .style("fill", "black")
        .text("Simulations:");

    let colors = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f'];
    let runs = ["4_-2_4", "4_-2_10", "4_3_4", "10_-2_4", "10_-2_10", "10_3_4"];

    for (let i = 0; i < runFolder.length; i++) {
        let runlegend = this.svg.append("rect")
            .attr("x", this.width / 4 + this.height * 2.5 + this.height * i * 1.5)
            .attr("y", this.height / 4)
            .attr("width", this.height)
            .attr("height", this.height / 2)
            .style("fill", colors[i]);

        let runLabel = this.svg.append("text")
            .attr("x", this.width / 4 + this.height * 3 + this.height * i * 1.5)
            .attr("y", this.height * 3 / 5)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(runs[i]);
    }

}
