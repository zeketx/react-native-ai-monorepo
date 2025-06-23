# Task: Setup Cypress E2E Testing Framework

**ID:** CS-P5-001  
**Phase:** Testing & Deployment  
**Dependencies:** CS-P4-001

## Objective
Configure Cypress for end-to-end testing of the web dashboard, including test infrastructure, CI/CD integration, and foundational test utilities for comprehensive automated testing.

## Context
E2E testing ensures critical user journeys work correctly across the entire application stack. Cypress provides reliable browser automation with excellent debugging capabilities. The setup must support both local development and CI/CD environments while maintaining test stability and performance.

## Requirements
- Cypress installation and configuration
- TypeScript support
- Custom commands and utilities
- Test data management
- CI/CD integration
- Visual regression testing setup

## Technical Guidance
- Install Cypress with TypeScript
- Configure for monorepo structure
- Create page object models
- Set up test fixtures
- Implement test helpers
- Configure parallel execution

## Project Structure
```
packages/web-dashboard/
├── cypress/
│   ├── downloads/
│   ├── fixtures/
│   │   ├── clients.json
│   │   ├── trips.json
│   │   └── users.json
│   ├── e2e/
│   │   ├── auth/
│   │   │   ├── login.cy.ts
│   │   │   └── logout.cy.ts
│   │   ├── clients/
│   │   │   ├── client-list.cy.ts
│   │   │   └── client-detail.cy.ts
│   │   └── smoke/
│   │       └── critical-path.cy.ts
│   ├── support/
│   │   ├── commands.ts
│   │   ├── e2e.ts
│   │   └── index.ts
│   └── tsconfig.json
├── cypress.config.ts
└── package.json
```

## Cypress Configuration
```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';
import { config as dotenvConfig } from 'dotenv';

// Load test environment variables
dotenvConfig({ path: '.env.test' });

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    
    env: {
      SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
      TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD,
    },
    
    setupNodeEvents(on, config) {
      // Task for seeding test database
      on('task', {
        async seedDatabase() {
          await testDbSeeder.seed();
          return null;
        },
        
        async cleanDatabase() {
          await testDbSeeder.clean();
          return null;
        },
        
        async createTestUser(userData) {
          const user = await testUserFactory.create(userData);
          return user;
        },
      });
      
      // Code coverage
      require('@cypress/code-coverage/task')(on, config);
      
      // Visual regression
      on('after:screenshot', (details) => {
        // Process screenshots for visual regression
      });
      
      return config;
    },
    
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    experimentalStudio: true,
    experimentalWebKitSupport: true,
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{ts,tsx}',
  },
});
```

## Custom Commands
```typescript
// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      seedDatabase(scenario?: string): Chainable<void>;
      interceptSupabase(): Chainable<void>;
      waitForLoading(): Chainable<void>;
      selectTier(tier: ClientTier): Chainable<void>;
      uploadFile(fileName: string, selector: string): Chainable<void>;
      checkAccessibility(): Chainable<void>;
    }
  }
}

// Authentication commands
Cypress.Commands.add('login', (
  email = Cypress.env('TEST_USER_EMAIL'),
  password = Cypress.env('TEST_USER_PASSWORD')
) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-button"]').click();
    
    // Wait for redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Verify auth token is stored
    cy.window().its('localStorage.sb-auth-token').should('exist');
  });
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Database commands
Cypress.Commands.add('seedDatabase', (scenario = 'default') => {
  cy.task('cleanDatabase');
  cy.task('seedDatabase', { scenario });
});

// API interception
Cypress.Commands.add('interceptSupabase', () => {
  // Intercept auth endpoints
  cy.intercept('POST', '**/auth/v1/token*', { fixture: 'auth/token.json' }).as('auth');
  
  // Intercept data endpoints
  cy.intercept('GET', '**/rest/v1/clients*', { fixture: 'clients.json' }).as('getClients');
  cy.intercept('GET', '**/rest/v1/trips*', { fixture: 'trips.json' }).as('getTrips');
  
  // Intercept realtime WebSocket
  cy.intercept('GET', '**/realtime/v1/websocket*', (req) => {
    req.reply({
      statusCode: 101,
      headers: { 'upgrade': 'websocket' },
    });
  }).as('websocket');
});

// UI helpers
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
  cy.get('[data-testid="skeleton-loader"]').should('not.exist');
});

// Accessibility testing
Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y(null, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa'],
    },
  });
});
```

## Page Object Models
```typescript
// cypress/support/pages/ClientListPage.ts
export class ClientListPage {
  visit() {
    cy.visit('/dashboard/clients');
    return this;
  }
  
  searchFor(query: string) {
    cy.get('[data-testid="client-search"]').type(query);
    return this;
  }
  
  filterByTier(tier: ClientTier) {
    cy.get('[data-testid="tier-filter"]').click();
    cy.get(`[data-testid="tier-option-${tier}"]`).click();
    return this;
  }
  
  selectClient(name: string) {
    cy.contains('[data-testid="client-row"]', name).click();
    return this;
  }
  
  bulkSelect(count: number) {
    cy.get('[data-testid="client-checkbox"]')
      .slice(0, count)
      .click({ multiple: true });
    return this;
  }
  
  performBulkAction(action: string) {
    cy.get('[data-testid="bulk-actions"]').click();
    cy.get(`[data-testid="bulk-action-${action}"]`).click();
    return this;
  }
  
  verifyClientCount(count: number) {
    cy.get('[data-testid="client-count"]')
      .should('contain', `${count} clients`);
    return this;
  }
  
  verifyClientInList(name: string) {
    cy.get('[data-testid="client-list"]')
      .should('contain', name);
    return this;
  }
}
```

## Test Utilities
```typescript
// cypress/support/utils/testDataFactory.ts
export class TestDataFactory {
  static createClient(overrides?: Partial<Client>): Client {
    return {
      id: faker.datatype.uuid(),
      name: faker.name.fullName(),
      email: faker.internet.email(),
      tier: faker.helpers.arrayElement(['silver', 'gold', 'platinum']),
      status: 'active',
      createdAt: faker.date.past(),
      ...overrides,
    };
  }
  
  static createTrip(overrides?: Partial<Trip>): Trip {
    const startDate = faker.date.future();
    const endDate = addDays(startDate, faker.datatype.number({ min: 3, max: 14 }));
    
    return {
      id: faker.datatype.uuid(),
      title: `Trip to ${faker.address.city()}`,
      startDate,
      endDate,
      status: 'confirmed',
      ...overrides,
    };
  }
  
  static async seedScenario(scenario: TestScenario) {
    const { clients, trips, relationships } = scenario;
    
    // Create clients
    const createdClients = await Promise.all(
      clients.map(client => supabase.from('clients').insert(client))
    );
    
    // Create trips
    const createdTrips = await Promise.all(
      trips.map(trip => supabase.from('trips').insert(trip))
    );
    
    // Create relationships
    await Promise.all(
      relationships.map(rel => 
        supabase.from('client_trips').insert(rel)
      )
    );
    
    return { clients: createdClients, trips: createdTrips };
  }
}
```

## Example E2E Test
```typescript
// cypress/e2e/clients/client-list.cy.ts
import { ClientListPage } from '../../support/pages/ClientListPage';

describe('Client List', () => {
  const clientListPage = new ClientListPage();
  
  beforeEach(() => {
    cy.seedDatabase('client-list');
    cy.login();
    clientListPage.visit();
  });
  
  it('should display all clients by default', () => {
    cy.waitForLoading();
    
    clientListPage.verifyClientCount(50);
    
    // Verify key elements
    cy.get('[data-testid="client-search"]').should('be.visible');
    cy.get('[data-testid="filter-button"]').should('be.visible');
    cy.get('[data-testid="export-button"]').should('be.visible');
  });
  
  it('should filter clients by tier', () => {
    clientListPage
      .filterByTier('platinum')
      .verifyClientCount(10);
    
    // Verify only platinum clients shown
    cy.get('[data-testid="tier-badge"]')
      .should('have.length', 10)
      .each(($badge) => {
        expect($badge.text()).to.equal('Platinum');
      });
  });
  
  it('should search clients by name', () => {
    const searchQuery = 'John';
    
    clientListPage
      .searchFor(searchQuery)
      .waitForLoading();
    
    // Verify search results
    cy.get('[data-testid="client-row"]').each(($row) => {
      cy.wrap($row).should('contain.text', searchQuery);
    });
  });
  
  it('should perform bulk tier update', () => {
    clientListPage
      .bulkSelect(5)
      .performBulkAction('update-tier');
    
    // Complete tier update modal
    cy.get('[data-testid="tier-select"]').select('gold');
    cy.get('[data-testid="update-reason"]').type('Promotional upgrade');
    cy.get('[data-testid="confirm-update"]').click();
    
    // Verify success
    cy.get('[data-testid="toast-success"]')
      .should('contain', '5 clients updated');
  });
  
  it('should handle real-time updates', () => {
    // Simulate another user adding a client
    cy.task('createTestClient', {
      name: 'New Real-time Client',
      tier: 'silver',
    });
    
    // Verify client appears without refresh
    cy.get('[data-testid="client-list"]')
      .should('contain', 'New Real-time Client');
    
    // Verify notification
    cy.get('[data-testid="update-notification"]')
      .should('contain', 'New client added');
  });
});
```

## CI/CD Configuration
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  cypress:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chrome, firefox, edge]
        
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Start test environment
        run: |
          docker-compose -f docker-compose.test.yml up -d
          pnpm run dev:test &
          
      - name: Wait for services
        run: pnpm run wait-on http://localhost:3000
        
      - name: Run Cypress tests
        uses: cypress-io/github-action@v5
        with:
          working-directory: packages/web-dashboard
          browser: ${{ matrix.browser }}
          record: true
          parallel: true
          group: 'E2E - ${{ matrix.browser }}'
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-screenshots
          path: packages/web-dashboard/cypress/screenshots
          
      - name: Upload videos
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-videos
          path: packages/web-dashboard/cypress/videos
```

## Acceptance Criteria
- [ ] Cypress installs and runs
- [ ] TypeScript support works
- [ ] Custom commands function
- [ ] Tests run in CI/CD
- [ ] Parallel execution works
- [ ] Reports generate properly

## Where to Create
- `packages/web-dashboard/cypress/`
- `packages/web-dashboard/cypress.config.ts`
- Update `package.json` with test scripts

## Test Coverage Goals
- Authentication flows: 100%
- Critical paths: 100%
- Data operations: 80%
- Error scenarios: 70%
- Accessibility: WCAG 2.1 AA

## Estimated Effort
3 hours