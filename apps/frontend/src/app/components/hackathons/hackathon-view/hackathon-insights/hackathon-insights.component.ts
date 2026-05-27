import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { HackathonService } from '../../../../services/hackathon.service';
import { HackathonInsightsResponse, InsightDataPoint } from '@h.linker/libs';
import type { EChartsOption } from 'echarts';
import { BreadcrumbComponent } from '../../../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-hackathon-insights',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    NgxEchartsModule,
    BreadcrumbComponent,
  ],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({ echarts: () => import('echarts') }),
    },
  ],
  templateUrl: './hackathon-insights.component.html',
  styleUrls: ['./hackathon-insights.component.scss'],
})
export class HackathonInsightsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private hackathonService = inject(HackathonService);

  slug: string | null = null;

  isLoading = signal(true);
  insights = signal<HackathonInsightsResponse | null>(null);

  roleChartOption = signal<EChartsOption>({});
  submissionChartOption = signal<EChartsOption>({});
  juryChartOption = signal<EChartsOption>({});
  scoreChartOption = signal<EChartsOption>({});

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.slug = this.route.snapshot.queryParamMap.get('slug');

    if (id) {
      this.loadInsights(id);
    }
  }

  private loadInsights(id: string) {
    this.hackathonService.getInsights(id).subscribe({
      next: (data) => {
        this.insights.set(data);
        this.initCharts(data.charts);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private initCharts(charts: HackathonInsightsResponse['charts']) {
    const textStyle = {
      color: 'rgba(255, 255, 255, 0.6)',
      fontFamily: 'Inter',
    };
    const splitLine = { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } };

    this.roleChartOption.set({
      tooltip: {
        trigger: 'item',
        backgroundColor: '#30363D',
        textStyle: { color: '#fff' },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data: charts.roleDistribution.map((d) => ({
            name: d.label,
            value: d.value,
          })),
          label: { color: '#fff' },
          itemStyle: {
            borderRadius: 8,
            borderColor: '#0D1117',
            borderWidth: 2,
          },
        },
      ],
      color: ['#4169A5', '#58a6ff', '#F08800', '#3fb950', '#8b949e'],
    });

    this.submissionChartOption.set(
      this.createLineChart(
        charts.submissionTimeline,
        'Submissions',
        '#3fb950',
        textStyle,
        splitLine,
      ),
    );

    this.juryChartOption.set(
      this.createLineChart(
        charts.juryActivityTimeline,
        'Evaluations',
        '#4169A5',
        textStyle,
        splitLine,
      ),
    );

    this.scoreChartOption.set({
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#30363D',
        textStyle: { color: '#fff' },
      },
      xAxis: {
        type: 'category',
        data: charts.scoreDistribution.map((d) => d.label),
        axisLabel: textStyle,
      },
      yAxis: { type: 'value', splitLine, axisLabel: textStyle },
      series: [
        {
          data: charts.scoreDistribution.map((d) => d.value),
          type: 'bar',
          barWidth: '40%',
          itemStyle: { color: '#F08800', borderRadius: [4, 4, 0, 0] },
        },
      ],
    });
  }

  private createLineChart(
    data: InsightDataPoint[],
    seriesName: string,
    color: string,
    textStyle: any,
    splitLine: any,
  ): EChartsOption {
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#30363D',
        textStyle: { color: '#fff' },
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.label),
        axisLabel: textStyle,
        boundaryGap: false,
      },
      yAxis: { type: 'value', splitLine, axisLabel: textStyle },
      series: [
        {
          name: seriesName,
          data: data.map((d) => d.value),
          type: 'line',
          smooth: true,
          symbolSize: 8,
          itemStyle: { color },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color },
                { offset: 1, color: 'rgba(0,0,0,0)' },
              ],
            },
          },
        },
      ],
    };
  }
}
