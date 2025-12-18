// This file is a part of AlphaGameBot.
// 
//     AlphaGameBot - A Discord bot that's free and (hopefully) doesn't suck.
//     Copyright (C) 2025  Damien Boisvert (AlphaGameDeveloper)
// 
//     AlphaGameBot is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
// 
//     AlphaGameBot is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
// 
//     You should have received a copy of the GNU General Public License
//     along with AlphaGameBot.  If not, see <https://www.gnu.org/licenses/>.

import type { Gauge, Histogram } from "prom-client";
import type { MetricDataMap } from "../../interfaces/metrics/MetricDataMap";
import { type MetricConfiguration, PrometheusMetricType } from "../../interfaces/metrics/MetricConfiguration";
import { Metrics } from "../metrics";

/**
 * Metric configurations for all supported metrics.
 * Adding a new metric only requires adding a new configuration here.
 */
export const metricConfigurations: MetricConfiguration[] = [
    {
        name: Metrics.HTTP_REQUEST,
        description: "HTTP requests received by the web server",
        prometheusType: PrometheusMetricType.HISTOGRAM,
        prometheusName: "alphagamebot_web_http_request_duration_seconds",
        prometheusHelp: "HTTP request duration in seconds",
        prometheusLabels: ["method", "path", "statusCode"],
        prometheusBuckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.HTTP_REQUEST];
            (metric as Histogram).observe(
                { method: String(typedData.method), path: String(typedData.path), statusCode: String(typedData.statusCode) },
                Number(typedData.durationMs) / 1000
            );
        }
    },
    {
        name: Metrics.API_REQUEST,
        description: "API requests to specific endpoints",
        prometheusType: PrometheusMetricType.HISTOGRAM,
        prometheusName: "alphagamebot_web_api_request_duration_seconds",
        prometheusHelp: "API request duration in seconds",
        prometheusLabels: ["endpoint", "method", "statusCode"],
        prometheusBuckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.API_REQUEST];
            (metric as Histogram).observe(
                { endpoint: String(typedData.endpoint), method: String(typedData.method), statusCode: String(typedData.statusCode) },
                Number(typedData.durationMs) / 1000
            );
        }
    },
    {
        name: Metrics.DATABASE_OPERATION,
        description: "Database operation duration",
        prometheusType: PrometheusMetricType.HISTOGRAM,
        prometheusName: "alphagamebot_web_database_operation_duration_seconds",
        prometheusHelp: "Database operation duration in seconds",
        prometheusLabels: ["model", "operation"],
        prometheusBuckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.DATABASE_OPERATION];
            (metric as Histogram).observe(
                { model: String(typedData.model), operation: String(typedData.operation) },
                Number(typedData.durationMs) / 1000
            );
        }
    },
    {
        name: Metrics.APPLICATION_ERROR,
        description: "Number of application errors",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_web_application_error",
        prometheusHelp: "Number of application errors",
        prometheusLabels: ["event"],
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.APPLICATION_ERROR];
            (metric as Gauge).inc({ event: String(typedData.name) });
        }
    },
    {
        name: Metrics.METRICS_GENERATION_TIME,
        description: "Time taken to generate metrics",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_web_metrics_generation_time_ms",
        prometheusHelp: "Time taken to generate metrics in ms",
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.METRICS_GENERATION_TIME];
            (metric as Gauge).set(Number(typedData.durationMs));
        }
    },
    {
        name: Metrics.METRICS_QUEUE_LENGTH,
        description: "Current length of the metrics queue",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_web_metrics_queue_length",
        prometheusHelp: "Current length of the metrics queue",
        processData: (metric, data) => {
            const typedData = data as MetricDataMap[Metrics.METRICS_QUEUE_LENGTH];
            (metric as Gauge).set(Number(typedData.length));
        }
    },
    {
        name: Metrics.METRICS_QUEUE_LENGTH_BY_METRIC,
        description: "Current length of the metrics queue by metric",
        prometheusType: PrometheusMetricType.GAUGE,
        prometheusName: "alphagamebot_web_metrics_queue_length_by_metric",
        prometheusHelp: "Current length of the metrics queue by metric",
        prometheusLabels: ["metric"],
        processData: () => {
            // This metric is handled specially in the exporter
        }
    }
];
