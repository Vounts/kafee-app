/**
 * Main App Component
 * 
 * This is the root component of the Kafè reservation application.
 * It provides the main layout and includes the reservation form component.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ReservationFormComponent } from './components/reservation-form/reservation-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    ReservationFormComponent
  ],
  template: `
    <!-- Main App Container -->
    <div class="app-container">
      <!-- App Header -->
      <header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <h1 class="app-title">Kafè</h1>
            <p class="app-subtitle">Reservation System</p>
          </div>
          <div class="header-info">
            <p class="availability-info">
              <span class="status-indicator online"></span>
              Live Availability
            </p>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <app-reservation-form></app-reservation-form>
      </main>

      <!-- App Footer -->
      <footer class="app-footer">
        <div class="footer-content">
          <p>&copy; 2025 Kafè Restaurant. All rights reserved.</p>
          <p>Lower East Side, Manhattan • (555) 123-4567</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    /* App Container */
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    /* App Header */
    .app-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo-section {
      display: flex;
      flex-direction: column;
    }

    .app-title {
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .app-subtitle {
      font-size: 0.9rem;
      margin: 0;
      opacity: 0.9;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .availability-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      margin: 0;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .status-indicator.online {
      background: #4caf50;
    }

    @keyframes pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
      100% {
        opacity: 1;
      }
    }

    /* Main Content */
    .main-content {
      flex: 1;
      padding: 20px 0;

    }

    /* App Footer */
    .app-footer {
      background: rgba(0, 0, 0, 0.1);
      color: #666;
      padding: 20px 0;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      text-align: center;
    }

    .footer-content p {
      margin: 4px 0;
      font-size: 0.9rem;
    }

    /* Mobile Responsiveness */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }

      .app-title {
        font-size: 1.5rem;
      }

      .main-content {
        padding: 10px 0;
      }
    }

    @media (max-width: 480px) {
      .header-content {
        padding: 0 15px;
      }

      .app-title {
        font-size: 1.3rem;
      }

      .footer-content {
        padding: 0 15px;
      }
    }
  `]
})
export class AppComponent {
  title = 'Kafè Reservation System';
}
