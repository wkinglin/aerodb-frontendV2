# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + TypeScript + Vite + Electron desktop application. The application appears to be a database frontend tool with features for algorithm management, database creation, flowchart visualization, and file uploading.

## Common Development Commands

- `npm run dev` - Start the development server with hot reloading
- `npm run build` - Build the application for production (Vue TypeScript compilation, Vite build, and Electron packaging)
- `npm run preview` - Preview the production build locally

## Project Architecture

### Frontend Framework
- Vue 3 with Composition API (`<script setup>`)
- TypeScript for type safety
- Element Plus UI component library
- Vue Router for navigation
- Vite as the build tool

### Desktop Application
- Electron for cross-platform desktop application
- Main process in `electron/main.ts`
- Preload script in `electron/preload.ts`
- Renderer process is the Vue application

### Project Structure
- `src/main.ts` - Application entry point
- `src/App.vue` - Main application component with WebSocket connection
- `src/router/index.ts` - Vue Router configuration with all routes
- `src/layout/` - Main application layout (sidebar, header, main content)
- `src/views/` - Page components for different routes
- `src/components/` - Reusable UI components
- `src/store/` - Global state management (currently using a simple JavaScript store)

### Key Features
- WebSocket connection to backend at `ws://127.0.0.1:9090/`
- Global WebSocket management via `src/global.ts`
- Auto-generated routes using `vite-plugin-pages`
- Multiple views including dashboard, algorithm tables, database creation, flowcharts, and file upload

### Important Dependencies
- `element-plus` - UI component library
- `@antv/g6` - Graph visualization library
- `gojs` - Diagramming library
- `vue-router` - Navigation routing