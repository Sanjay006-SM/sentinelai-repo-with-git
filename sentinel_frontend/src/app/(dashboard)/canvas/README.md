# SentinelAI: Threat Graph Canvas

## Overview

The `canvas` module houses the advanced visualization components used to render the Enterprise Knowledge Graph (Digital Twin) directly in the browser. It allows analysts to visually explore the blast radius of compromised identities.

## Responsibilities

* **Graph Rendering:** Utilizes specialized visualization libraries to render nodes (Identities, Roles, AWS Resources) and edges (Permissions, Assumptions, Network paths).
* **Interactive Exploration:** Enables zooming, panning, and node-expansion to traverse the attack path interactively.
* **Performance Optimization:** Implements rendering optimizations to handle dense, multi-hop subgraphs without locking the main browser thread.

## Architecture

The core of this module is the `ThreatGraphCanvas.tsx` component. It consumes the standardized graph projections delivered by the backend and maps them into a visual coordinate system, applying conditional styling based on the severity of the associated risk findings.
