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
  const [yMin, yMax] = d3.extent(data, d => d.Date)
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

  const yTickValues = (() => {
    let values = []
    yMin.setSeconds(0)
    for(i = yMin; i <= yMax; i.setSeconds(i.getSeconds() + 15)) {
      values = [...values, new Date(i)]
    }
    return values
  })()

  const yAxis = d3.axisLeft()
                  .scale(yScale)
                  .tickValues(yTickValues.filter(d => d.getSeconds() % 15 === 0).sort(d => -d))
                  .tickFormat(d3.timeFormat('%M:%S'));

  const colorScale = d3.scaleOrdinal()
                       .domain(['doping', 'no-doping'])
                       .range(['#1f77b4', '#ff7f0e'])

  const tooltip = d3.select('#tooltip')

  const graph = svg.append('g')
                    .selectAll('circle')
                    .data(data)
                    .join('circle')
                    .attr('cx', d => xScale(+d.Year))
                    .attr('cy', d => yScale(d.Date))
                    .attr('data-xValue', d => d.Year)
                    .attr('data-yValue', d => d.Date)
                    .attr('r', circleRadius)
                    .attr('stroke', '#000000')
                    .attr('stoke-width', 2)
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
                      .style('left', `${e.clientX}px`)
                      .style('top', `${e.clientY}px)`)
                      .style('opacity', '0.9')

                    })
                    .on('mouseout', function() {
                      tooltip.style('opacity', 0)
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