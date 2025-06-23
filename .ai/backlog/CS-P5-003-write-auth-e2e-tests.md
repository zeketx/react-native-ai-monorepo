# Task: Write Authentication E2E Tests

**ID:** CS-P5-003  
**Phase:** Testing & Deployment  
**Dependencies:** CS-P5-001, CS-P5-002

## Objective
Create comprehensive end-to-end tests for all authentication flows in both web and mobile applications, covering login, logout, session management, role verification, and error scenarios.

## Context
Authentication is the critical entry point to the application. E2E tests must verify that authentication works correctly across different scenarios, including success paths, failure cases, and edge conditions. Tests should cover both platforms with appropriate platform-specific considerations.

## Requirements
- Login flow testing
- Logout flow testing
- Session persistence
- Role-based access
- Error handling
- Password reset flow

## Technical Guidance
- Test both platforms
- Mock authentication backend
- Handle tokens properly
- Test edge cases
- Verify redirects
- Check security headers

## Web Dashboard Tests (Cypress)
```typescript
// cypress/e2e/auth/login.cy.ts
describe('Authentication - Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });
  
  describe('Successful Login', () => {
    it('should login with valid organizer credentials', () => {
      // Arrange
      const validUser = {
        email: 'organizer@clientsync.com',
        password: 'SecurePass123!'
      };
      
      // Act
      cy.get('[data-testid="email-input"]').type(validUser.email);
      cy.get('[data-testid="password-input"]').type(validUser.password);
      cy.get('[data-testid="login-button"]').click();
      
      // Assert
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="user-menu"]').should('contain', validUser.email);
      
      // Verify auth token stored
      cy.window().then((win) => {
        const token = win.localStorage.getItem('sb-auth-token');
        expect(token).to.not.be.null;
      });
    });
    
    it('should redirect to intended page after login', () => {
      // Visit protected page first
      cy.visit('/dashboard/clients/123');
      
      // Should redirect to login with return URL
      cy.url().should('include', '/login');
      cy.url().should('include', 'from=%2Fdashboard%2Fclients%2F123');
      
      // Login
      cy.login();
      
      // Should redirect back to intended page
      cy.url().should('include', '/dashboard/clients/123');
    });
    
    it('should persist session across page refreshes', () => {
      cy.login();
      cy.visit('/dashboard');
      
      // Refresh page
      cy.reload();
      
      // Should still be logged in
      cy.get('[data-testid="user-menu"]').should('be.visible');
      cy.url().should('not.include', '/login');
    });
  });
  
  describe('Failed Login', () => {
    it('should show error for invalid credentials', () => {
      cy.get('[data-testid="email-input"]').type('wrong@email.com');
      cy.get('[data-testid="password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Invalid email or password');
      
      // Should not navigate away
      cy.url().should('include', '/login');
    });
    
    it('should show error for non-organizer account', () => {
      // User exists but not an organizer
      cy.get('[data-testid="email-input"]').type('client@example.com');
      cy.get('[data-testid="password-input"]').type('ClientPass123!');
      cy.get('[data-testid="login-button"]').click();
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Unauthorized: Organizer access required');
    });
    
    it('should validate email format', () => {
      cy.get('[data-testid="email-input"]').type('invalidemail');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();
      
      cy.get('[data-testid="email-error"]')
        .should('be.visible')
        .and('contain', 'Invalid email address');
    });
    
    it('should handle network errors gracefully', () => {
      // Simulate network failure
      cy.intercept('POST', '**/auth/v1/token', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      });
      
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'An error occurred. Please try again.');
    });
  });
  
  describe('Security Features', () => {
    it('should rate limit login attempts', () => {
      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="email-input"]').clear().type('test@example.com');
        cy.get('[data-testid="password-input"]').clear().type(`wrong${i}`);
        cy.get('[data-testid="login-button"]').click();
        cy.wait(100);
      }
      
      // 6th attempt should be rate limited
      cy.get('[data-testid="login-button"]').click();
      cy.get('[data-testid="error-message"]')
        .should('contain', 'Too many attempts. Please try again later.');
    });
    
    it('should not expose whether email exists', () => {
      // Test with non-existent email
      cy.get('[data-testid="email-input"]').type('nonexistent@example.com');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();
      
      const errorMessage1 = cy.get('[data-testid="error-message"]').invoke('text');
      
      // Test with existing email but wrong password
      cy.get('[data-testid="email-input"]').clear().type('existing@example.com');
      cy.get('[data-testid="password-input"]').clear().type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();
      
      const errorMessage2 = cy.get('[data-testid="error-message"]').invoke('text');
      
      // Both should show same generic error
      expect(errorMessage1).to.equal(errorMessage2);
    });
  });
});
```

## Logout Tests
```typescript
// cypress/e2e/auth/logout.cy.ts
describe('Authentication - Logout', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard');
  });
  
  it('should logout successfully', () => {
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Should redirect to login
    cy.url().should('include', '/login');
    
    // Should clear auth token
    cy.window().then((win) => {
      const token = win.localStorage.getItem('sb-auth-token');
      expect(token).to.be.null;
    });
    
    // Should not be able to access protected routes
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });
  
  it('should logout from all tabs', () => {
    // Open second tab (simulated)
    cy.window().then((win) => {
      win.localStorage.setItem('auth-logout', Date.now().toString());
    });
    
    // Listen for storage event
    cy.window().its('localStorage').invoke('getItem', 'auth-logout').should('exist');
    
    // Verify redirect happens
    cy.url().should('include', '/login');
  });
  
  it('should handle logout errors gracefully', () => {
    // Simulate logout failure
    cy.intercept('POST', '**/auth/v1/logout', {
      statusCode: 500
    });
    
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Should still clear local session
    cy.url().should('include', '/login');
  });
});
```

## Mobile App Tests (Detox)
```javascript
// e2e/tests/auth.test.js
describe('Authentication', () => {
  describe('Login Flow', () => {
    beforeEach(async () => {
      await device.launchApp({ newInstance: true });
    });
    
    it('should login with allowlisted email', async () => {
      // Enter email
      await element(by.id('email-input')).typeText('client@example.com');
      await element(by.id('continue-button')).tap();
      
      // Wait for allowlist check
      await waitFor(element(by.id('verification-success')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Should navigate to onboarding or main app
      await expect(
        element(by.id('onboarding-welcome')).or(element(by.id('trip-list-screen')))
      ).toBeVisible();
    });
    
    it('should reject non-allowlisted email', async () => {
      await element(by.id('email-input')).typeText('unauthorized@example.com');
      await element(by.id('continue-button')).tap();
      
      // Should show error
      await expect(element(by.id('allowlist-error')))
        .toBeVisible();
      await expect(element(by.text('Email not authorized')))
        .toBeVisible();
      
      // Should not proceed
      await expect(element(by.id('continue-button')))
        .toBeVisible();
    });
    
    it('should validate email format', async () => {
      await element(by.id('email-input')).typeText('invalidemail');
      await element(by.id('continue-button')).tap();
      
      await expect(element(by.text('Please enter a valid email')))
        .toBeVisible();
    });
    
    it('should handle offline mode', async () => {
      // Disable network
      await device.setURLBlacklist(['.*']);
      
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('continue-button')).tap();
      
      // Should show offline message
      await expect(element(by.id('offline-message')))
        .toBeVisible();
      
      // Re-enable network
      await device.clearURLBlacklist();
    });
  });
  
  describe('Session Management', () => {
    beforeEach(async () => {
      await device.launchApp({
        newInstance: true,
        permissions: { notifications: 'YES' },
        launchArgs: { isAuthenticated: true }
      });
    });
    
    it('should maintain session on app background/foreground', async () => {
      // Verify logged in
      await expect(element(by.id('trip-list-screen'))).toBeVisible();
      
      // Background app
      await device.sendToHome();
      await device.launchApp({ newInstance: false });
      
      // Should still be logged in
      await expect(element(by.id('trip-list-screen'))).toBeVisible();
    });
    
    it('should refresh token when expired', async () => {
      // Mock expired token
      await device.launchApp({
        launchArgs: { 
          mockExpiredToken: true,
          tokenExpiresIn: 1 // 1 second
        }
      });
      
      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Make authenticated request
      await element(by.id('refresh-trips-button')).tap();
      
      // Should refresh token automatically
      await expect(element(by.id('trip-list'))).toBeVisible();
      
      // Should not redirect to login
      await expect(element(by.id('login-screen'))).not.toBeVisible();
    });
    
    it('should handle logout correctly', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('logout-button')).tap();
      
      // Confirm logout
      await element(by.text('Logout')).tap();
      
      // Should return to login
      await expect(element(by.id('login-screen'))).toBeVisible();
      
      // Should clear stored credentials
      await device.launchApp({ newInstance: true });
      await expect(element(by.id('login-screen'))).toBeVisible();
    });
  });
  
  describe('Biometric Authentication', () => {
    it('should setup biometric authentication after first login', async () => {
      // Complete login
      await element(by.id('email-input')).typeText('client@example.com');
      await element(by.id('continue-button')).tap();
      
      // Should prompt for biometric setup
      await expect(element(by.id('biometric-setup-modal'))).toBeVisible();
      
      // Enable biometrics
      await element(by.id('enable-biometric-button')).tap();
      
      if (device.getPlatform() === 'ios') {
        // iOS Face ID / Touch ID
        await expect(element(by.text('Face ID'))).toBeVisible();
      } else {
        // Android fingerprint
        await expect(element(by.text('Fingerprint'))).toBeVisible();
      }
    });
    
    it('should login with biometrics on subsequent launches', async () => {
      // Launch with biometrics enabled
      await device.launchApp({
        launchArgs: { biometricsEnabled: true }
      });
      
      // Should show biometric prompt
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      
      // Simulate successful biometric auth
      if (device.getPlatform() === 'ios') {
        await device.matchFace();
      } else {
        await device.matchFinger();
      }
      
      // Should navigate to main app
      await expect(element(by.id('trip-list-screen'))).toBeVisible();
    });
  });
});
```

## Shared Test Utilities
```typescript
// cypress/support/auth-utils.ts
export const createMockAuthResponse = (overrides = {}) => ({
  access_token: 'mock-jwt-token',
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'mock-refresh-token',
  user: {
    id: 'user-123',
    email: 'test@example.com',
    role: 'organizer',
    ...overrides.user
  },
  ...overrides
});

export const setupAuthMocks = () => {
  cy.intercept('POST', '**/auth/v1/token', (req) => {
    const { email, password } = req.body;
    
    if (email === 'organizer@clientsync.com' && password === 'SecurePass123!') {
      req.reply(createMockAuthResponse({
        user: { email, role: 'organizer' }
      }));
    } else if (email === 'client@example.com') {
      req.reply({
        statusCode: 403,
        body: { error: 'Unauthorized: Organizer access required' }
      });
    } else {
      req.reply({
        statusCode: 401,
        body: { error: 'Invalid email or password' }
      });
    }
  }).as('login');
  
  cy.intercept('POST', '**/auth/v1/logout', {
    statusCode: 204
  }).as('logout');
  
  cy.intercept('POST', '**/auth/v1/token?grant_type=refresh_token', {
    body: createMockAuthResponse()
  }).as('refreshToken');
};
```

## Test Data Management
```javascript
// e2e/helpers/authTestData.js
module.exports = {
  validUsers: {
    organizer: {
      email: 'organizer@clientsync.com',
      password: 'SecurePass123!',
      role: 'organizer'
    },
    admin: {
      email: 'admin@clientsync.com',
      password: 'AdminPass123!',
      role: 'admin'
    }
  },
  
  invalidUsers: {
    wrongPassword: {
      email: 'organizer@clientsync.com',
      password: 'wrongpassword'
    },
    nonExistent: {
      email: 'nonexistent@example.com',
      password: 'password123'
    },
    clientUser: {
      email: 'client@example.com',
      password: 'ClientPass123!'
    }
  },
  
  allowlistedEmails: [
    'client1@example.com',
    'client2@example.com',
    'vip@company.com'
  ],
  
  nonAllowlistedEmails: [
    'random@example.com',
    'unauthorized@test.com'
  ]
};
```

## Acceptance Criteria
- [ ] Login tests pass on both platforms
- [ ] Logout tests clear sessions
- [ ] Role verification works
- [ ] Error scenarios handled
- [ ] Session persistence tested
- [ ] Security features verified

## Where to Create
- Web: `packages/web-dashboard/cypress/e2e/auth/`
- Mobile: `packages/mobile-app/e2e/tests/auth.test.js`
- Shared utilities in respective support directories

## Test Coverage Requirements
- Happy path flows: 100%
- Error scenarios: 90%
- Edge cases: 80%
- Security features: 100%
- Platform-specific: 100%

## Estimated Effort
2.5 hours