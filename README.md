# Kafè Restaurant Reservation System

A modern, responsive Angular application for managing online reservations at Kafè, a popular Andorran restaurant in Manhattan's Lower East Side.

## 🍽️ Overview

This single-page application (SPA) allows customers to reserve tables at Kafè between July 24-31, 2024. The system features real-time availability checking, dynamic form validation, and a user-friendly step-by-step reservation process.

## ✨ Features

### Core Functionality
- **Step-by-step reservation form** with 4 intuitive steps
- **Real-time availability checking** with live updates every 30 seconds
- **Dynamic time slot selection** with capacity indicators
- **Alternative time suggestions** when requested slots are unavailable
- **Comprehensive form validation** with real-time feedback
- **Mobile-responsive design** optimized for all devices

### Reservation Details
- **Date selection**: July 24-31, 2024 only
- **Time slots**: 30-minute intervals from 6:00 PM to 10:00 PM
- **Party size**: 1-12 guests maximum
- **Seating areas**: Main Dining, Bar Area, Outdoor Patio, Private Room
- **Special requests**: Children in party, smoking area preference

### User Experience
- **Material Design** components for modern UI
- **Smooth animations** and transitions
- **Accessibility features** with proper ARIA labels
- **Error handling** with user-friendly messages
- **Confirmation system** with unique reservation codes

## 🛠️ Technology Stack

- **Frontend**: Angular 20 (Standalone Components)
- **UI Framework**: Angular Material
- **Forms**: Reactive Forms with Custom Validators
- **State Management**: RxJS Observables
- **Testing**: Jasmine/Karma (Unit) + Playwright (E2E)
- **Styling**: Modern CSS3 with CSS Grid, Flexbox, and Mobile-First Responsive Design

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v18 or higher)
- **yarn**
- **Angular CLI** (v20 or higher)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd kafee-app
```

### 2. Install Dependencies
```bash
yarn install
```

### 3. Install Angular Material (if not already installed)
```bash
ng add @angular/material
```

### 4. Start the Development Server
```bash
yarn start
```

The application will be available at `http://localhost:4200`

## 🧪 Testing

### Unit Tests
```bash
# Run unit tests
yarn test

# Run unit tests with coverage
yarn test:coverage
```

### E2E Tests
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
yarn e2e

# Run E2E tests with UI
yarn e2e:ui
```

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── reservation-form/
│   │       ├── reservation-form.component.ts
│   │       ├── reservation-form.component.html
│   │       ├── reservation-form.component.css
│   │       └── reservation-form.component.spec.ts
│   ├── models/
│   │   └── reservation.model.ts
│   ├── services/
│   │   ├── validation.service.ts
│   │   ├── validation.service.spec.ts
│   │   ├── reservation.service.ts
│   │   └── reservation.service.spec.ts
│   ├── app.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── e2e/
│   └── reservation-flow.spec.ts
└── styles.css
```

## 🎯 Key Components

### ReservationFormComponent
The main component handling the reservation form with:
- Step-by-step navigation
- Real-time validation
- Availability checking
- Alternative suggestions
- Mobile responsiveness

### ValidationService
Comprehensive validation service providing:
- Custom validators for all form fields
- Real-time validation feedback
- Business rule enforcement
- Error message generation

### ReservationService
Service managing reservation operations:
- Availability checking
- Reservation creation
- Real-time updates
- Alternative suggestions
- Mock data management

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience with side-by-side layouts
- **Tablet**: Adapted layouts with touch-friendly interactions
- **Mobile**: Stacked layouts with optimized touch targets

### Modern CSS Layout Techniques
- **CSS Grid**: For responsive form layouts and time slot grids
- **Flexbox**: For component alignment and navigation
- **CSS Custom Properties**: For consistent theming
- **Mobile-First**: Progressive enhancement approach

### Breakpoints
- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## 🔧 Configuration

### Available Dates
Reservations are limited to July 24-31, 2025. Update the constants in `reservation.model.ts`:

```typescript
AVAILABLE_DATES: {
  START_DATE: new Date('2025-07-24'),
  END_DATE: new Date('2025-07-31')
}
```

### Time Slots
30-minute intervals from 6:00 PM to 10:00 PM. Modify `TimeSlot` enum in `reservation.model.ts`.

### Party Size Limits
- **Minimum**: 1 guest
- **Maximum**: 12 guests

### Seating Areas
- Main Dining Room
- Bar Area
- Outdoor Patio
- Private Room

## 🎨 Customization

### Styling
The application uses CSS custom properties for easy theming. Key variables in `styles.css`:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #4caf50;
  --error-color: #f44336;
  --warning-color: #ff9800;
}
```

### Material Theme
Customize Angular Material theme in `angular.json`:

```json
{
  "styles": [
    "src/styles.css",
    "@angular/material/prebuilt-themes/indigo-pink.css"
  ]
}
```

### CSS Grid Layouts
The application uses modern CSS Grid for responsive layouts:

```css
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
```

## 🚀 Deployment

### Build for Production
```bash
yarn build
```


### Deploy to Static Hosting
The built application can be deployed to:
- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your repository
- **Firebase Hosting**: Use Firebase CLI
- **AWS S3**: Upload to S3 bucket

## 🔍 Code Quality

### Linting
```bash
# Run ESLint
yarn lint

# Fix linting issues
yarn lint:fix
```

### Type Checking
```bash
# Run TypeScript compiler
npx tsc --noEmit
```

## 📊 Performance

### Bundle Analysis
```bash
# Analyze bundle size
yarn build -- --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

### Lighthouse Score
The application is optimized for:
- **Performance**: 90+ (Mobile & Desktop)
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Guidelines

### Code Style
- Follow Angular style guide
- Use TypeScript strict mode
- Implement proper error handling
- Write comprehensive tests
- Add JSDoc comments for public APIs

### Component Architecture
- Use standalone components
- Implement OnPush change detection
- Follow single responsibility principle
- Use dependency injection properly

### CSS Best Practices
- Use CSS Grid for layout
- Use Flexbox for alignment
- Implement mobile-first responsive design
- Use CSS custom properties for theming
- Avoid deprecated libraries like flex-layout

### Testing Strategy
- **Unit Tests**: 90%+ coverage
- **Integration Tests**: Service interactions
- **E2E Tests**: Complete user journeys
- **Accessibility Tests**: Screen reader compatibility

## 🐛 Troubleshooting

### Common Issues

#### Angular Material Not Loading
```bash
yarn add @angular/material @angular/cdk @angular/animations
```

#### Playwright Tests Failing
```bash
npx playwright install
yarn e2e
```

#### Build Errors
```bash
yarn cache clean --force
rm -rf node_modules package-lock.json
yarn install
```

#### CSS Layout Issues
The application uses modern CSS Grid and Flexbox. Ensure your browser supports:
- CSS Grid (IE11+ with polyfill)
- Flexbox (IE10+)
- CSS Custom Properties (IE11+ with polyfill)


## 👥 Team

- **Developer**: John Dequito


---

**Kafè Restaurant** - Bringing Andorran cuisine to Manhattan since 2025
