const drawScatterPlot = (data) => {
  const graphWidth = 900
  const graphHeight = 460
  const paddingBottom = 50
  const paddingLeft = 80
  const paddingRight = 50
  const paddingTop =50
  const circleRadius = 6
  const svg = d3.select('svg')
                .attr('width', graphWidth + paddingLeft + paddingRight)
                .attr('height', graphHeight + paddingBottom + paddingTop)

  const [xMin, xMax] = d3.extent(data, d => +d.Year)
  const xScale = d3.scaleLinear()
                   .domain([xMin-1, xMax+1])
                   .range([0, graphWidth])
  const [yMin, yMax] = d3.extent(data, d => new Date(d.Date))
  const yScale = d3.scaleLinear()
                   .domain([yMin, yMax])
                   .range([0, graphHeight])

  const xTickValues = (() => {
    let values = []
    for(i = xMin -1; i <= xMax+1; i++) {
      values = [...values, i]
    }
    return values
  })()

  const xAxis = d3.axisBottom()
                  .scale(xScale)
                  .tickValues(xTickValues.filter(d => d % 2 === 0))
                  .tickFormat(d => d)

  const yTickValues = (() => {
    let values = []

    for(i = yMin; i <= yMax; i.setSeconds(i.getSeconds() + 1)) {
      const date = new Date(i)
      if (date.getSeconds() % 15 === 0) {
        values = [...values, date]
      }
    }
    return values
  })()

  const yAxis = d3.axisLeft()
                  .scale(yScale)
                  .tickValues(yTickValues.sort(d => -d))
                  .tickFormat(d3.timeFormat('%M:%S'));

  const filters = ['no-doping', 'doping']
  const colors = ['#ff7f0e', '#1f77b4']
  const legends = ['No doping allegations', 'Riders with doping allegations']
  const colorScale = d3.scaleOrdinal()
                       .domain(filters)
                       .range(colors)
  const legendScale = d3.scaleOrdinal()
                       .domain(filters)
                       .range(legends)
  const tooltip = d3.select('#tooltip')

  const graph = svg.append('g')
                    .selectAll('circle.dot')
                    .data(data)
                    .join('circle')
                    .classed('dot', true)
                    .attr('cx', d => xScale(+d.Year))
                    .attr('cy', d => yScale(d.Date))
                    .attr('data-xvalue', d => d.Year)
                    .attr('data-yvalue', d => d.Date)
                    .attr('r', circleRadius)
                    .attr('stroke', '#000000')
                    .attr('stroke-width', 1)
                    .attr('fill', d => d.Doping ? colorScale('doping') : colorScale('no-doping'))
                    .on('mouseover', function(e, d) {
                      tooltip
                      .html(`
                        ${d.Name}: ${d.Nationality}
                        <br />
                        Year: ${d.Year}, Time: ${d.Time}
                        ${d.Doping ? `
                          <br />
                          <br />
                          ${d.Doping}
                        `: ``}
                      `)
                      .style('left', `${e.clientX + circleRadius}px`)
                      .style('top', () => {
                        const { height } = tooltip.node().getBoundingClientRect()
                        return `${e.clientY - height/2}px`
                      })
                      .attr('data-year', d.Year)
                      .style('opacity', '0.9')

                      d3.select(this).style('cursor', 'pointer')
                    })
                    .on('mouseout', function() {
                      tooltip.style('opacity', 0)
                             .style('left', 0)
                             .style('top', 0)
                    })

  svg.append('g')
     .attr('id', 'x-axis')
     .call(xAxis)
     .attr('transform', `translate(${paddingLeft}, ${graphHeight + paddingTop})`)

  svg.append('g')
     .attr('id', 'y-axis')
     .call(yAxis)
     .attr('transform', `translate(${paddingLeft}, ${paddingTop})`)

  graph.attr('transform', `translate(${paddingLeft}, ${paddingTop})`)

  svg.append('text')
     .text('Time in Minutes')
     .attr('transform', `translate(${paddingLeft - 50}, ${paddingTop*3})rotate(-90)`)
     .attr('text-anchor', 'middle')
     .style('font-size', '0.8rem')

  svg.append('text')
     .text("35 Fastest times up Alpe d'Huez")
     .attr('transform', `translate(${graphWidth/2 + paddingLeft}, ${paddingTop/2 - 5})`)
     .attr('text-anchor', 'middle')
     .style('font-size', '1.2rem')


  const legend = svg.selectAll('g.legend')
                    .data(filters)
                    .join('g')
                    .classed('legend', true)
                    .attr('id', 'legend')
                    .attr('transform', (_, i) => `translate(${graphWidth + paddingLeft}, ${graphHeight/2 + i*20})`)
  const legendText = legend.append('text')
        .text(d => legendScale(d))
        .style('font-size', '0.8rem')
        .attr('text-anchor', 'end')
        .attr('dy', 'center')
  legend.append('rect')
        .attr('width', 16)
        .attr('height', 16)
        .attr('fill', d => colorScale(d))
        .attr('transform', () => {
          const { height } = legendText.node().getBBox()
          return `translate(5, ${-height})`
        })

}

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
  .then(resp => resp.json())
  .then(resp => {
    resp = resp.map( d => {
      const date = new Date()
      const [minutes, seconds] = d.Time.split(':')
      date.setHours(0, +minutes, +seconds)
      return {...d, Date: date}
    })
    drawScatterPlot(resp)
  })