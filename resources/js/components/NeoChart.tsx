import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';

type Analysis = {
  analysis_date: string;
  total_neo_count: number;
  average_diameter_min: number | string;
  average_diameter_max: number | string;
  max_velocity: number | string;
  smallest_miss_distance: number | string;
};

type LineMetric = 'smallest_miss_distance' | 'max_velocity';

type Props = {
  data: Analysis[];
  height?: number;
  lineMetric?: LineMetric; // add prop
};

export function NeoChart({ data, height = 420, lineMetric = 'smallest_miss_distance' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState<number>(800);

  // Resize handling
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setWidth(Math.max(320, w));
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const prepared = useMemo(() => {
    // Coerce and sort by date ascending
    const parsed = data
      .map(d => ({
        date: new Date(d.analysis_date),
        total: Number(d.total_neo_count ?? 0),
        avgMin: Number(d.average_diameter_min ?? 0),
        avgMax: Number(d.average_diameter_max ?? 0),
        velocity: Number(d.max_velocity ?? 0), // m/s
        miss: Number(d.smallest_miss_distance ?? 0), // m
      }))
      .filter(d => !Number.isNaN(d.date.valueOf()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return parsed;
  }, [data]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const W = width;
    const H = height;
    const margin = { top: 80, right: 64, bottom: 40, left: 44 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('width', '100%')
      .attr('height', H)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (prepared.length === 0) {
      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#6b7280')
        .text('No data');
      return;
    }

    // Domains with padding so first/last bars don't overflow
    const dates = prepared.map(d => d.date);
    const diffs = d3.pairs(dates).map(([a, b]) => b.getTime() - a.getTime()).filter(d => d > 0);
    const medianStep = diffs.length ? (d3.median(diffs) as number) : 24 * 60 * 60 * 1000; // 1 day fallback
    const padMs = Math.max(medianStep / 2, 12 * 60 * 60 * 1000); // at least 12h
    const xDomain: [Date, Date] = [
      new Date(dates[0].getTime() - padMs),
      new Date(dates[dates.length - 1].getTime() + padMs),
    ];

    const y0Max = d3.max(prepared, d => d.total) ?? 0;
    const y0 = d3.scaleLinear().domain([0, y0Max ? y0Max * 1.1 : 1]).nice().range([innerH, 0]);

    const metricAccessor = (d: (typeof prepared)[number]) =>
      lineMetric === 'smallest_miss_distance' ? d.miss : d.velocity;

    const y1Max = d3.max(prepared, metricAccessor) ?? 0;
    const y1 = d3
      .scaleLinear()
      .domain([0, y1Max ? y1Max * 1.1 : 1])
      .nice()
      .range([innerH, 0]);

    const x = d3.scaleTime().domain(xDomain).range([0, innerW]);

    // Bar sizing based on actual time step
    const stepX =
      prepared.length > 1 ? x(dates[1]) - x(dates[0]) : innerW;
    const barWidth = Math.max(4, Math.min(40, stepX * 0.8));

    // Axes
    const xAxis = d3.axisBottom<Date>(x).ticks(Math.min(6, prepared.length)).tickFormat(d3.timeFormat('%Y-%m-%d') as any);
    const yAxisLeft = d3.axisLeft(y0).ticks(5);
    const yAxisRight = d3
      .axisRight(y1)
      .ticks(5)
      .tickFormat((v: d3.NumberValue) => {
        const n = Number(v);
        if (lineMetric === 'smallest_miss_distance') {
          return `${d3.format('.2s')(n).replace('G', 'B')}m`;
        } else {
          return `${d3.format('.2f')(n / 1_000)} km/s`;
        }
      });

    g.append('g').attr('transform', `translate(0,${innerH})`).call(xAxis).selectAll('text').style('font-size', '11px');
    g.append('g').call(yAxisLeft).selectAll('text').style('font-size', '11px');
    g.append('g').attr('transform', `translate(${innerW},0)`).call(yAxisRight).selectAll('text').style('font-size', '11px');

    // Bars: Total NEO Count
    const barColor = '#60a5fa';
    g.append('g')
      .selectAll('rect')
      .data(prepared)
      .join('rect')
      .attr('x', d => x(d.date) - barWidth / 2)
      .attr('y', d => y0(d.total))
      .attr('width', barWidth)
      .attr('height', d => innerH - y0(d.total))
      .attr('fill', barColor)
      .attr('opacity', 0.85);

    // Line
    const lineColor = lineMetric === 'smallest_miss_distance' ? '#34d399' : '#f59e0b';
    const lineGen = d3
      .line<(typeof prepared)[number]>()
      .x(d => x(d.date))
      .y(d => y1(metricAccessor(d)))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(prepared)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .attr('d', lineGen);

    g.append('g')
      .selectAll('circle')
      .data(prepared)
      .join('circle')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y1(metricAccessor(d)))
      .attr('r', 3)
      .attr('fill', lineColor);

    // Legend inside chart (no overflow)
    const legend = g.append('g').attr('transform', 'translate(0,-24)'); // lift legend to create extra gap
    const legendItems = [
      { label: 'NEO Count', color: barColor },
      { label: lineMetric === 'smallest_miss_distance' ? 'Closest Miss (m)' : 'Max Velocity (m/s)', color: lineColor },
    ];
    legend
      .selectAll('g')
      .data(legendItems)
      .join(enter => {
        const lg = enter.append('g').attr('transform', (_, i) => `translate(${i * 190},0)`); // a bit more spacing between legend items
        lg.append('rect').attr('width', 12).attr('height', 12).attr('fill', d => d.color).attr('y', -10).attr('rx', 2);
        lg.append('text').text(d => d.label).attr('x', 18).attr('y', 0).attr('dominant-baseline', 'ideographic').attr('fill', '#6b7280');
        return lg;
      });

    // Tooltip
    const tooltip = d3
      .select(containerRef.current)
      .selectAll<HTMLDivElement, unknown>('.neo-chart-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'neo-chart-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', 'rgba(17,24,39,0.9)')
      .style('color', '#fff')
      .style('padding', '8px 10px')
      .style('font-size', '12px')
      .style('border-radius', '6px')
      .style('transform', 'translateY(-6px)')
      .style('opacity', 0);

    const bisect = d3.bisector<(typeof prepared)[number], Date>(d => d.date).center;

    g.append('rect')
      .attr('fill', 'transparent')
      .attr('width', innerW)
      .attr('height', innerH)
      .on('mousemove', (event: MouseEvent) => {
        const [mx] = d3.pointer(event);
        const dt = x.invert(mx);
        const idx = bisect(prepared, dt);
        const d = prepared[Math.min(prepared.length - 1, Math.max(0, idx))];

        const svgBox = svgRef.current!.getBoundingClientRect();
        const pageX = event.clientX;
        const left = pageX - svgBox.left + 10;

        const missStr = `${d3.format('.2s')(d.miss).replace('G','B')}m`; // meters (matches axis)
        const velKms = d.velocity / 1_000; // km/s

        tooltip
          .html(
            `<div style="font-weight:600;margin-bottom:4px;">${d3.timeFormat('%Y-%m-%d')(d.date)}</div>
             <div>NEO Count: <b>${d.total}</b></div>
             <div>Closest Miss: <b>${missStr}</b></div>
             <div>Max Velocity: <b>${d3.format('.2f')(velKms)} km/s</b></div>
             <div>Avg Diameter: <b>${d.avgMin.toFixed?.(2) ?? d.avgMin}–${d.avgMax.toFixed?.(2) ?? d.avgMax} m</b></div>`
          )
          .style('left', `${left}px`)
          .style('top', `${margin.top + y1(metricAccessor(d)) + 6}px`)
          .style('opacity', 1);
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', 0);
      });


    return () => {
      d3.select(containerRef.current).selectAll('.neo-chart-tooltip').remove();
    };
  }, [prepared, width, height, lineMetric]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} />
    </div>
  );
}

export default NeoChart;
