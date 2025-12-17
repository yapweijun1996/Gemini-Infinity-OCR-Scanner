# Gemini Infinity OCR Scanner

## Overview

**Gemini Infinity Scanner** is a continuous, agentic OCR (Optical Character Recognition) application that leverages Google's Gemini AI to extract text from live camera feeds. The app automatically captures the sharpest frames, processes them in batches, and loops indefinitely for real-time text extraction.

### Key Features

- **Continuous Scanning**: Infinite loop OCR with automatic frame capture
- **Smart Sharpness Detection**: Only captures high-quality frames using edge detection algorithms
- **Batch Processing**: Sends multiple frames to Gemini AI for efficient text extraction
- **Configurable Prompts**: Choose from presets (Standard OCR, Text-Only, Code/ID, Markdown) or create custom instructions
- **Multiple Gemini Models**: Support for various Gemini models (2.5 Flash, 2.0 Flash Exp, 1.5 Pro, etc.)
- **Real-time Logs**: Live log view with thumbnails, extracted text, and status indicators
- **Download Results**: Export extracted text as TXT or JSON files
- **Responsive UI**: Dark theme with mobile-friendly design
- **Auto-Focus**: Attempts to trigger camera re-focus when blur is detected
- **Client-side Processing**: All processing happens in the browser for privacy

## Architecture Overview

```mermaid
graph TB
    A[User Interface Layer] --> B[Application State]
    B --> C[Camera Service]
    B --> D[Image Processing]
    B --> E[Gemini AI Service]
    B --> F[Local Storage]
    
    A --> A1[Home View]
    A --> A2[Scanning View]
    A --> A3[Settings Modal]
    A --> A4[Log Details]
    
    C --> C1[Camera Access]
    C --> C2[Frame Capture]
    C --> C3[Auto Focus]
    
    D --> D1[Sharpness Calculation]
    D --> D2[Image Resizing]
    D --> D3[Frame Selection]
    
    E --> E1[API Communication]
    E --> E2[Response Parsing]
    E --> E3[Error Handling]
```

## Application Flow

```mermaid
stateDiagram-v2
    [*] --> IDLE
    
    IDLE --> SETTINGS : Configure Agent
    IDLE --> ACTIVE : Start Scan
    
    SETTINGS --> IDLE : Save/Cancel
    SETTINGS --> IDLE : Close
    
    ACTIVE --> PROCESSING : Batch Ready
    ACTIVE --> STOPPED : Stop
    ACTIVE --> ERROR : Camera/API Error
    
    PROCESSING --> ACTIVE : Success
    PROCESSING --> ERROR : API Error
    PROCESSING --> STOPPED : Stop
    
    STOPPED --> ACTIVE : Resume
    STOPPED --> IDLE : Home
    
    ERROR --> IDLE : Reset
    ERROR --> SETTINGS : Reconfigure
```

## Core Scanning Process

```mermaid
sequenceDiagram
    participant U as User
    participant App as App Component
    participant Cam as Camera Service
    participant Sharp as Sharpness Detector
    participant OCR as Gemini Service
    participant Log as Log Manager
    
    U->>App: Start Infinity Scan
    App->>Cam: Initialize Camera
    Cam-->>App: Stream Ready
    
    loop Continuous Scanning
        Cam->>Sharp: Analyze Frame
        Sharp-->>Cam: Sharpness Score
        
        alt Sharpness > Threshold
            Cam->>App: Add to Batch
            App->>App: Check Batch Size
            App->>OCR: Process Batch
            OCR-->>Log: Store Results
        else Blur Detected
            Cam->>Cam: Trigger Auto Focus
        end
    end
```

## Component Architecture

```mermaid
graph TD
    A[App.tsx] --> B[ScanningView.tsx]
    A --> C[SettingsModal.tsx]
    A --> D[App State]
    
    B --> E[ScanLog.tsx]
    B --> F[LogDetailsModal.tsx]
    B --> G[ResultView.tsx]
    
    H[Services Layer]
    H --> I[geminiService.ts]
    H --> J[imageProcessing.ts]
    
    B --> H
    A --> H
    
    K[Utils Layer]
    K --> L[types.ts]
    K --> M[constants.ts]
    
    A --> K
    B --> K
    C --> K
```

## Data Flow

```mermaid
flowchart LR
    A[Camera Feed] --> B[Canvas Processing]
    B --> C[Sharpness Analysis]
    C --> D{Sharpness > Threshold?}
    
    D -->|Yes| E[Add to Batch]
    D -->|No| F[Discard Frame]
    
    E --> G{Batch Full?}
    G -->|No| A
    G -->|Yes| H[Gemini API Call]
    
    H --> I[Response Processing]
    I --> J[JSON Parsing]
    J --> K[Text Extraction]
    K --> L[Update Log]
    L --> M[Clear Batch]
    M --> A
    
    F --> A
```

## Sharpness Detection Algorithm

```mermaid
flowchart TD
    A[Image Data] --> B[Extract Center 60%]
    B --> C[Grayscale Conversion]
    C --> D[Calculate Gradients]
    
    D --> E[Horizontal Differences]
    D --> F[Vertical Differences]
    
    E --> G[Sum All Differences]
    F --> G
    
    G --> H[Normalize by Pixel Count]
    H --> I[Scale by 10x]
    I --> J[Return Score]
```

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **AI**: Google Gemini AI (@google/genai)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite

## Prerequisites

- Node.js (v16 or higher)
- A Google Gemini API key (get one from [Google AI Studio](https://aistudio.google.com/))

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd gemini-infinity-ocr-scanner
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API Key**:
   - Launch the app (`npm run dev`)
   - Click "Configure Agent" on the home screen
   - Enter your Gemini API key in the settings modal
   - The key is stored locally in your browser

## Usage

### Getting Started

1. **Open the app** in your browser after running `npm run dev`
2. **Grant camera permissions** when prompted
3. **Configure settings** (API key, model, prompt, batch size, capture speed)
4. **Start scanning** by clicking "Start Infinity Scan"

### Configuration Options

- **API Key**: Your Google Gemini API key
- **Model**: Choose from available Gemini models (2.5 Flash recommended for speed/cost)
- **System Prompt**: Select a preset or write custom instructions for text extraction
- **Batch Size**: Number of frames to send per OCR request (1-20)
- **Capture Speed**: Interval between frame captures (0.1s - 2.0s)

### Scanning Process

```mermaid
graph LR
    A[Camera Activated] --> B[Frame Analysis]
    B --> C[Sharpness Check]
    C --> D{Good Quality?}
    D -->|No| B
    D -->|Yes| E[Add to Queue]
    E --> F{Batch Ready?}
    F -->|No| B
    F -->|Yes| G[Send to Gemini]
    G --> H[Extract Text]
    H --> I[Update Logs]
    I --> J[Clear Batch]
    J --> B
```

### Viewing Results

- **Live Log**: See real-time scan results with thumbnails
- **Details Modal**: Click any log entry for full details, copy text, or download JSON
- **Status Indicators**: Green for success, red for errors, yellow for pending

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Project Structure

```
├── components/          # React components
│   ├── ScanningView.tsx
│   ├── SettingsModal.tsx
│   ├── ScanLog.tsx
│   ├── LogDetailsModal.tsx
│   └── ResultView.tsx
├── services/            # Business logic
│   ├── geminiService.ts
│   └── imageProcessing.ts
├── types.ts             # TypeScript type definitions
├── constants.ts         # App constants and presets
├── App.tsx              # Main app component
└── index.tsx            # React entry point
```

## Core Algorithms

### 1. Sharpness Detection

The app uses a simplified Laplacian variance calculation optimized for real-time performance:

```mermaid
flowchart TD
    A[Input: Canvas Context] --> B[Extract Center Region]
    B --> C[Grayscale Conversion]
    C --> D[Calculate Edges]
    
    D --> E[Sum of Gradients]
    E --> F[Normalize]
    F --> G[Scale x10]
    G --> H[Return Score]
```

### 2. Auto-Focus Logic

When blur is detected, the app attempts to trigger camera re-focus:

```mermaid
flowchart TD
    A[Low Sharpness Detected] --> B{Start Timer}
    B --> C{Still Blur > 2s?}
    C -->|No| A
    C -->|Yes| D{Cooling Period > 5s?}
    D -->|No| C
    D -->|Yes| E[Toggle Focus Mode]
    E --> F[Re-engage Continuous]
    F --> G[Reset Timers]
    G --> A
```

### 3. Batch Processing

The app optimizes OCR by collecting multiple high-quality frames:

```mermaid
flowchart LR
    A[Capture Frame] --> B[Calculate Sharpness]
    B --> C{Sharper than others?}
    C -->|Yes| D[Sort by Score]
    C -->|No| E[Add to End]
    D --> F{Size > Max?}
    E --> F
    F -->|No| A
    F -->|Yes| G[Send to Gemini]
    G --> H[Process Response]
    H --> I[Clear Batch]
    I --> A
```

## Browser Compatibility

- Modern browsers with camera API support (Chrome, Firefox, Safari, Edge)
- Requires HTTPS for camera access (except localhost)
- WebGL support for canvas operations

## Privacy & Security

- All processing happens client-side in your browser
- Images are not stored or transmitted except to Gemini AI API
- API key is stored locally in browser localStorage
- No data collection or tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Powered by [Google Gemini AI](https://ai.google.dev/)
- Built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- Icons by [Lucide](https://lucide.dev/)
