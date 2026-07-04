# SentinelAI: CloudTrail Inspection

## Overview

The `cloudtrail` module offers a dedicated interface for deep-diving into raw, unparsed AWS CloudTrail events before they are fully normalized by the Risk Intelligence Engine.

## Responsibilities

* **Raw Log Viewing:** Provides a raw JSON viewer for inspecting raw ingestion payloads, assisting administrators in debugging integration parsing issues.
* **Dropzone:** May include legacy or supplementary manual drag-and-drop zones for ingesting offline `.json` dumps directly from the browser to the backend.
