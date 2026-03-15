# HungryHIPAA 🦛

**Ingest PHI. Deidentify fast. Download safely.**

HungryHIPAA is a privacy-first healthcare dashboard and frontend deidentification prototype built with React, Vite, and Tailwind CSS. It combines synthetic healthcare analytics with an in-browser file processing workflow that lets users upload text-based files containing sensitive data, transform them on the client side, and download deidentified outputs.

## Overview

HungryHIPAA was designed to explore how a modern healthcare interface can balance usability, analytics, and privacy. The application presents synthetic healthcare metrics in a polished dashboard while also demonstrating a lightweight deidentification workflow for uploaded files.

This project focuses on:
- healthcare data presentation
- privacy-aware UI design
- browser-based file handling
- early-stage PHI deidentification concepts

## Features

- Dark, polished healthcare analytics dashboard
- Synthetic dataset metrics loaded from a local JSON source
- Static chart visualizations for healthcare trends
- Frontend-only file upload workflow
- In-browser text-based deidentification prototype
- Downloadable processed output files
- Custom branded theme with logo, vibrant accents, and modern typography

## Why It Stands Out

HungryHIPAA is more than a basic dashboard. It combines:
- **healthcare analytics**, through synthetic summary metrics and charts
- **privacy-first thinking**, through browser-based deidentification flow
- **product-oriented UI design**, through branding, theming, and interaction feedback

It is built to show both technical implementation and applied healthcare/privacy awareness.

## Tech Stack

- React
- Vite
- Tailwind CSS
- JavaScript
- CSS custom properties
- Browser APIs (`Blob`, `URL.createObjectURL`, file input handling)

## Project Structure

```bash
src/
  App.jsx
  main.jsx
  index.css

public/
  dashboard_summary.json
  top_conditions_chart.png
  encounter_types_chart.png
  hippo-logo.png
