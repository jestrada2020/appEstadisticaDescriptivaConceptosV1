# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive Spanish-language statistical analysis web application (`appEstadisticaDescriptivaConceptosV1Modificado`) designed for educational purposes. The application provides interactive statistical calculations, visualizations, and step-by-step tutorials for descriptive statistics concepts.

## Application Architecture

### Frontend Structure
- **Single Page Application (SPA)**: Built with vanilla HTML/CSS/JavaScript
- **Responsive Design**: Uses Tailwind CSS for styling and responsive layouts
- **Interactive Visualizations**: Plotly.js for dynamic charts and graphs
- **Modular UI**: Sidebar navigation with section-based content organization

### Core Components

#### Main Files:
- `index.html`: Main application structure with comprehensive statistical sections
- `js/script.js`: All JavaScript functionality (~1440 lines)
- `css/style.css`: Custom styles for sidebar navigation and responsive design

#### Key JavaScript Modules:
1. **Data Processing** (`calculateStatistics()`): Core statistical calculations
2. **Visualization Engine**: Multiple chart types using Plotly.js
3. **Educational Tutorials**: Step-by-step quartile calculations and pie chart construction
4. **UI Management**: Section navigation and responsive sidebar

### Statistical Features

#### Core Statistical Analysis:
- Basic descriptive statistics (mean, median, mode, variance, standard deviation)
- Quartile calculations with detailed methodology
- Frequency distribution tables (simple and grouped)
- Outlier detection using IQR method
- Coefficient of variation analysis

#### Visualization Types:
- Histograms with frequency distributions
- Box plots with outlier identification
- Combined charts (histogram + box plot)
- Overlapping visualizations
- Cumulative frequency polygons (Ojivas)
- Interactive pie charts with angle calculations
- River depth simulation for practical applications

#### Educational Components:
- Step-by-step quartile calculation tutorial (section 2.7.5)
- Pie chart construction methodology (section 2.2.1) 
- Dispersion theory with coefficient of variation interpretation
- Frequency table comparisons (simple vs grouped)
- Real-world river crossing simulation

### Data Flow

1. **Input**: User enters comma/space/newline separated numerical data
2. **Processing**: Data validation, sorting, and statistical calculations
3. **Distribution**: Automatic frequency distribution creation using Sturges' rule
4. **Visualization**: Multiple chart types generated simultaneously
5. **Education**: Interactive tutorials with current data integration

### Key Functions

#### Statistical Calculations:
- `calculateBasicStats()`: Core descriptive statistics
- `calculateQuartiles()`: Percentile-based quartile calculation
- `createFrequencyDistribution()`: Automated class interval generation

#### Visualization:
- `createHistogram()`: Frequency distribution visualization
- `createBoxplot()`: Box and whisker plots with outlier detection
- `createCombinedChart()`: Multi-axis combined visualizations
- `createPolygonCharts()`: Cumulative frequency polygons

#### Educational:
- `updateQuartileTutorial()`: Step-by-step quartile calculation display
- `updatePieChartTutorial()`: Angle calculation methodology
- `analyzeRiverData()`: Practical dispersion analysis simulation

### UI Navigation System

The application uses a comprehensive sidebar navigation system with the following sections:

1. **Data Input** (`input-section`)
2. **Frequency Tables** (`frequency-comparison-section`) 
3. **Basic Statistics** (`stats-section`)
4. **Quartiles & Outliers** (`quartiles-section`)
5. **Frequency Distribution Table** (`frequency-section`)
6. **Histogram** (`histogram-section`)
7. **Box Plot** (`boxplot-section`)
8. **Combined Chart** (`combined-section`)
9. **Overlapping Chart** (`overlapping-section`)
10. **Frequency Polygons** (`polygon-section`)
11. **Quartile Tutorial** (`quartile-tutorial-section`)
12. **Pie Chart Tutorial** (`pie-chart-section`)
13. **Dispersion Theory** (`dispersion-theory-section`)
14. **River Simulation** (`river-simulation-section`)
15. **View All** (`all-sections`)

### Development Commands

Since this is a client-side web application with no build process:

#### Running the Application:
```bash
# Open index.html directly in a web browser
open index.html
# or serve using a simple HTTP server
python -m http.server 8000
# then visit http://localhost:8000
```

#### Development Server Options:
```bash
# Using Node.js http-server (if installed)
npx http-server . -p 8000

# Using Python 3
python -m http.server 8000

# Using PHP (if available)
php -S localhost:8000
```

### Dependencies

#### External Libraries (CDN):
- **Tailwind CSS 2.2.19**: Utility-first CSS framework
- **Font Awesome 6.4.0**: Icon library
- **Plotly.js (latest)**: Interactive visualization library

#### No Build Process Required:
- Pure HTML/CSS/JavaScript
- No package.json or build configuration
- No compilation or bundling needed

### Key Implementation Notes

1. **Statistical Accuracy**: Uses proper percentile calculation methods for quartiles
2. **Educational Focus**: Extensive step-by-step explanations with mathematical formulas
3. **Responsive Design**: Mobile-first approach with collapsible sidebar
4. **Data Validation**: Robust input parsing handling various delimiter formats
5. **Bilingual**: Comprehensive Spanish-language interface with statistical terminology
6. **Real-world Applications**: River depth simulation demonstrates practical dispersion analysis

### Code Organization Patterns

- **Modular Functions**: Each statistical concept has dedicated calculation and display functions
- **Event-Driven Updates**: All UI sections update automatically when new data is processed
- **Chart Cloning**: Advanced Plotly.js integration for "View All" section functionality
- **Educational Integration**: Tutorial sections integrate with actual calculated data

### Testing the Application

1. **Input Validation**: Test with various data formats (comma, space, newline separated)
2. **Statistical Accuracy**: Verify calculations against known statistical datasets
3. **Responsive Design**: Test sidebar functionality across device sizes
4. **Educational Content**: Ensure tutorial sections update with user data
5. **Visualization**: Confirm all chart types render correctly with different data sizes

This application serves as a comprehensive educational tool for descriptive statistics, combining theoretical explanations with practical interactive calculations and visualizations.