# Plant Watering Dashboard System Documentation

## System Architecture

```mermaid
graph TB
    subgraph Frontend [Frontend - Next.js]
        App[App Component]-->|Renders|Dashboard[Dashboard Page]
        Dashboard-->|Contains|WateringTable[WateringTable Component]
        Dashboard-->|Contains|Sidebar[Sidebar Component]
        Dashboard-->|Contains|TimeDate[TimeDate Component]
        Dashboard-->|Contains|SearchBar[SearchBar Component]
        Dashboard-->|Contains|Card3D[Card3D Component]
    end

    subgraph Backend [Backend - Flask]
        API[Flask API Server]-->|Queries|DB[(MySQL Database)]
    end

    Frontend-->|HTTP Requests|API
    API-->|JSON Response|Frontend
```

## Component Hierarchy

```mermaid
classdiagram
    App <|-- Dashboard
    Dashboard *-- WateringTable
    Dashboard *-- Sidebar
    Dashboard *-- TimeDate
    Dashboard *-- SearchBar
    Dashboard *-- Card3D

    class App{
        +render()
    }
    class Dashboard{
        -data: WateringData[]
        -filteredData: WateringData[]
        -loading: boolean
        -error: string
        +fetchData()
        +handleSearch(term: string)
        +render()
    }
    class WateringTable{
        -initialData: WateringData[]
        -sortField: string
        -sortDirection: string
        +handleSort()
        +formatTime()
        +render()
    }
    class TimeDate{
        -time: string
        -date: string
        +updateTime()
        +render()
    }
    class SearchBar{
        -searchTerm: string
        +handleChange()
        +handleSubmit()
        +render()
    }
    class Card3D{
        -icon: ReactNode
        -title: string
        -value: string
        -color: string
        +render()
    }
```

## Data Flow Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant D as Dashboard
    participant A as API
    participant DB as Database

    U->>D: Access Dashboard
    activate D
    D->>A: GET /api/watering-data
    activate A
    A->>DB: Query Watering Schedules
    activate DB
    DB-->>A: Return Schedule Data
    deactivate DB
    A-->>D: JSON Response
    deactivate A
    D-->>U: Display Watering Table
    deactivate D

    U->>D: Sort/Filter Data
    activate D
    D->>D: Process Data Locally
    D-->>U: Update Display
    deactivate D

    loop Every 10 minutes
        D->>A: Refresh Data
        activate A
        A->>DB: Query Latest Data
        activate DB
        DB-->>A: Return Updated Data
        deactivate DB
        A-->>D: Update Response
        deactivate A
    end
```