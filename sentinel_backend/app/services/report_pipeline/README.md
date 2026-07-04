# SentinelAI: Report Pipeline

## Overview

The `report_pipeline` module manages the asynchronous generation and formatting of enterprise security reports (e.g., Executive PDFs).

## Responsibilities

* **Data Aggregation:** Collects the organizational risk score, active threats, and executive AI summaries across the entire workspace.
* **PDF Compilation:** Utilizes templating engines (e.g., ReportLab, Jinja2) to stitch the deterministic metrics and the AI-generated summaries into a highly polished, exportable artifact (`executive_report.pdf`).
* **Format Conversion:** Ensures consistent formatting and handles the binary stream conversion for API delivery.
