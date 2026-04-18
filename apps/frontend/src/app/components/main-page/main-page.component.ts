import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [MatButtonModule, RouterLink],
  template: `
    <div class="hero-section">
      <h1>Welcome to ServiceStation 🛠️</h1>
      <p>The ultimate platform for KPI students and developers.</p>
      <div class="card-footer">
        <button mat-flat-button color="primary" routerLink="/register">
          Get Started
        </button>
        <button mat-stroked-button routerLink="/login">Sign In</button>
      </div>
    </div>
  `,
  styles: [
    `
        .hero-section {
            height: 80vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
        }

        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .card-footer {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
    `,
  ],
})
export class MainPageComponent {}
