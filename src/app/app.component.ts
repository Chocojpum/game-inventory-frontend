import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header>
        <h1>🎮 My Game Inventory</h1>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Library</a>
          <a routerLink="/add-game" routerLinkActive="active">Add Game</a>
          <a routerLink="/categories" routerLinkActive="active">Categories</a>
          <a routerLink="/attributes" routerLinkActive="active">Attributes</a>
        </nav>
      </header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    header {
      background: rgba(255, 255, 255, 0.95);
      padding: 1.5rem 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 2rem;
    }
    nav {
      display: flex;
      gap: 1rem;
    }
    nav a {
      padding: 0.5rem 1rem;
      text-decoration: none;
      color: #667eea;
      border-radius: 5px;
      transition: all 0.3s;
      font-weight: 500;
    }
    nav a:hover {
      background: #667eea;
      color: white;
    }
    nav a.active {
      background: #667eea;
      color: white;
    }
    main {
      padding: 2rem;
    }
  `]
})
export class AppComponent { }