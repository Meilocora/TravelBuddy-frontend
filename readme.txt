# ✈️ TravelBuddy

Full-stack mobile travel planning application built with
React Native, Expo, TypeScript and a Python/Flask backend.

[Screenshot / Banner]

## About

TravelBuddy is an Android application for planning,
organizing and documenting multi-stage journeys.

Users can manage destinations, activities, accommodation,
transportation, expenses and travel media in one application.

## Features

- Interactive travel maps
- Route planning with multiple waypoints
- Location and POI management
- Multi-stage journey planning
- Accommodation management
- Transportation planning
- Travel expense tracking
- Camera and travel media
- Authentication
- Firebase media storage

## Screenshots

[4–6 images]

## Architecture

flowchart LR
    A[React Native / Expo App] -->|REST API| B[Flask Backend]
    B --> C[(PostgreSQL)]
    A --> D[Google Maps APIs]
    A --> E[Firebase Storage]

## Tech Stack

### Mobile
- React Native
- Expo
- TypeScript
- React Navigation
- Axios

### Backend
- Python
- Flask
- SQLAlchemy
- PostgreSQL

### Services
- Google Maps
- Firebase

## Architecture

React Native App
      ↓ REST
Flask API
      ↓
SQLAlchemy
      ↓
PostgreSQL

External:
Google Maps / Firebase

## Getting Started

...

# Backend Repository: TravelBuddy Backend

 → https://github.com/Meilocora/TravelBuddy-backend

## Author

Eric Wenig