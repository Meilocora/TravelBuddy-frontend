# TravelBuddy

**A full-stack mobile travel planning application built with React Native, Expo and Flask.**

TravelBuddy helps travelers organize complex multi-stage journeys in one place, from destinations and activities to transportation, accommodation, expenses and travel media.

The project consists of a React Native mobile client and a Python/Flask REST API backed by a relational database.

> This is a personal portfolio project developed to explore full-stack mobile development, API design, relational data modeling, authentication, geospatial features and automated testing.

---

## Screenshots

<p align="center">
  <img src="docs/images/journeys-overview.jpg" width="220" />
  <img src="docs/images/major_stage_overview.jpg" width="220" />
  <img src="docs/images/routeplanning.jpg" width="220" />
</p>

<p align="center">
  <img src="docs/images/currency_calculator.jpg" width="220" />
  <img src="docs/images/media_form.jpg" width="220" />
  <img src="docs/images/expense_tracking.jpg" width="220" />
</p>

## Demo

See TravelBuddy in action:

┌────────────────────────────────────┐
│                                    │
│        TravelBuddy App             │
│                                    │
│               ▶                    │
│                                    │
│       Watch the demo               │
│                                    │
└────────────────────────────────────┘

[![TravelBuddy Demo](docs/images/demo-preview.png)](docs/videos/demo.mp4)

## Key Features

- **Multi-stage journey planning**  
  Organize trips hierarchically into journeys, major stages and minor stages.

- **Interactive maps and places**  
  Plan destinations and points of interest using map and location-based functionality.

- **Transportation management**  
  Add transportation between stages and keep travel connections organized.

- **Accommodation & activities**  
  Manage accommodation, activities and other trip-specific information.

- **Expense tracking**  
  Track travel costs and individual spendings across different parts of a journey.

- **Travel media**  
  Capture and organize photos and videos and associate them with locations and stages.

- **Currency support**  
  Manage currencies and travel-related monetary information.

- **User authentication & authorization**  
  JWT-based authentication with resource-level ownership protection.

- **Location-aware functionality**  
  Uses device location and external map/location services for travel-related features.

---

## Architecture

TravelBuddy uses a separated mobile-client / REST-API architecture:

```text
┌─────────────────────────────┐
│     React Native / Expo     │
│       TypeScript App        │
└──────────────┬──────────────┘
               │
               │ REST / JSON
               ▼
┌─────────────────────────────┐
│        Flask REST API       │
│            Python           │
└──────────────┬──────────────┘
               │
               │ SQLAlchemy ORM
               ▼
┌─────────────────────────────┐
│     Relational Database     │
└─────────────────────────────┘

Additional Services
├── Google Maps / Location Services
└── Firebase Media Storage

The frontend and backend are maintained as separate repositories.

Backend Repository:
https://github.com/Meilocora/TravelBuddy-backend

## Tech Stack

- Mobile
      React Native
      Expo
      TypeScript
      React Navigation
      Google Maps integration
      Expo Camera / Image Picker
      Firebase

- Backend
      Python
      Flask
      SQLAlchemy
      REST API
      JWT authentication
      Relational database

- Development & Quality
      Git & GitHub
      pytest
      pytest-cov
      Ruff
      GitHub Actions

## Data Model

```mermaid
erDiagram
    USER ||--o{ JOURNEY : owns
    USER ||--o{ CUSTOM_COUNTRY : owns
    USER ||--o{ PLACE_TO_VISIT : owns
    USER ||--o{ MEDIUM : owns
    USER ||--o{ CURRENCY : owns

    JOURNEY ||--o{ MAJOR_STAGE : contains
    MAJOR_STAGE ||--o{ MINOR_STAGE : contains

    MINOR_STAGE ||--o{ ACTIVITY : contains
    MINOR_STAGE ||--o{ ACCOMMODATION : contains

    JOURNEY ||--o| COSTS : tracks
    MAJOR_STAGE ||--o| COSTS : tracks
    MINOR_STAGE ||--o| COSTS : tracks

    COSTS ||--o{ SPENDING : contains


```markdown
## Authentication & Security

The backend uses JWT-based authentication with separate access and refresh tokens.

Protected API routes derive the authenticated user from the token instead of trusting user IDs supplied by the client.

Resource-level authorization ensures that users can only access or modify resources belonging to their own account.

Ownership checks also cover nested and related resources, including:

- journeys and travel stages
- activities and transportation
- places and custom countries
- media
- currencies
- expenses and spendings
- bulk and reorder operations

Authorization behavior is covered by automated regression tests.


## Testing & Code Quality

The backend includes automated tests with `pytest`, focusing particularly on authentication, authorization and ownership boundaries.

Security regression tests verify scenarios such as:

- users cannot access or delete resources owned by another user
- foreign stages cannot be modified through reorder operations
- media cannot be linked to resources owned by another user
- child resources cannot be modified through unrelated parent resources
- updates to one journey cannot unintentionally modify another journey

Tests run against an isolated test database.

Code quality is checked using **Ruff**, while **GitHub Actions** automatically runs linting and tests on pushes and pull requests.

Run the test suite locally:
  python -m pytest -v

Run tests with coverage:
  python -m pytest --cov=app --cov-report=term-missing

Run the linter:
  ruff check .