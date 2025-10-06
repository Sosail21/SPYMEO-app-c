import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import ClientList from '@/components/patient/ClientList';
import { testClients } from '../../fixtures/data';
import { mockApiResponse, mockApiError, mockDelayedResponse } from '../../utils/api-test-utils';

/**
 * Component tests for ClientList
 *
 * Testing approach:
 * 1. Test initial render and loading state
 * 2. Test successful data fetching and display
 * 3. Test search functionality
 * 4. Test add client functionality
 * 5. Test error handling
 * 6. Test user interactions
 */

describe('ClientList Component', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render loading state initially', () => {
      mockDelayedResponse('get', '/api/clients', testClients, 1000);

      render(<ClientList />);

      expect(screen.getByText(/chargement/i)).toBeInTheDocument();
    });

    it('should render search input', async () => {
      render(<ClientList />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/rechercher un consultant/i);
        expect(searchInput).toBeInTheDocument();
      });
    });

    it('should render add button', async () => {
      render(<ClientList />);

      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /ajouter/i });
        expect(addButton).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    it('should display list of clients after loading', async () => {
      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });

      // Check that clients are displayed
      testClients.forEach((client) => {
        const fullName = `${client.firstName} ${client.lastName}`;
        expect(screen.getByText(fullName)).toBeInTheDocument();
      });
    });

    it('should display client email and phone', async () => {
      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });

      const firstClient = testClients[0];
      expect(screen.getByText(firstClient.email!)).toBeInTheDocument();
      expect(screen.getByText(firstClient.phone!)).toBeInTheDocument();
    });

    it('should display "Ouvrir la fiche" link for each client', async () => {
      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });

      const links = screen.getAllByText(/ouvrir la fiche/i);
      expect(links).toHaveLength(testClients.length);
    });

    it('should render links with correct href', async () => {
      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });

      const firstClient = testClients[0];
      const link = screen.getAllByText(/ouvrir la fiche/i)[0].closest('a');
      expect(link).toHaveAttribute('href', `/pro/fiches-clients/${firstClient.id}`);
    });

    it('should display placeholder when email is missing', async () => {
      const clientsWithoutEmail = [
        { ...testClients[0], email: undefined },
      ];
      mockApiResponse('get', '/api/clients', clientsWithoutEmail);

      render(<ClientList />);

      await waitFor(() => {
        expect(screen.getByText('—')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter clients by search query', async () => {
      const user = userEvent.setup();

      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/rechercher un consultant/i);

      // Type search query
      await user.type(searchInput, 'Sophie');

      // Should show only Sophie
      await waitFor(() => {
        expect(screen.getByText('Sophie Laurent')).toBeInTheDocument();
        expect(screen.queryByText('Marc Dupont')).not.toBeInTheDocument();
        expect(screen.queryByText('Julie Bernard')).not.toBeInTheDocument();
      });
    });

    it('should be case-insensitive', async () => {
      const user = userEvent.setup();

      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/rechercher un consultant/i);

      await user.type(searchInput, 'sophie');

      await waitFor(() => {
        expect(screen.getByText('Sophie Laurent')).toBeInTheDocument();
      });
    });

    it('should search in both first and last names', async () => {
      const user = userEvent.setup();

      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/rechercher un consultant/i);

      // Search by last name
      await user.type(searchInput, 'Dupont');

      await waitFor(() => {
        expect(screen.getByText('Marc Dupont')).toBeInTheDocument();
        expect(screen.queryByText('Sophie Laurent')).not.toBeInTheDocument();
      });
    });

    it('should show "Aucun résultat" when no matches', async () => {
      const user = userEvent.setup();

      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/rechercher un consultant/i);

      await user.type(searchInput, 'NonExistent');

      await waitFor(() => {
        expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument();
      });
    });

    it('should clear search and show all clients', async () => {
      const user = userEvent.setup();

      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/rechercher un consultant/i) as HTMLInputElement;

      // Type and then clear
      await user.type(searchInput, 'Sophie');
      await user.clear(searchInput);

      await waitFor(() => {
        // All clients should be visible again
        expect(screen.getByText('Sophie Laurent')).toBeInTheDocument();
        expect(screen.getByText('Marc Dupont')).toBeInTheDocument();
        expect(screen.getByText('Julie Bernard')).toBeInTheDocument();
      });
    });
  });

  describe('Add Client Functionality', () => {
    it('should add a new client when clicking add button', async () => {
      const user = userEvent.setup();

      const newClient = {
        id: 'client-new',
        firstName: 'Nouveau',
        lastName: 'Client',
        email: 'nouveau@example.com',
        phone: '0600000010',
        createdAt: new Date().toISOString(),
      };

      mockApiResponse('post', '/api/clients', newClient, 201);

      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /ajouter/i });
      await user.click(addButton);

      // Wait for the new client to appear
      await waitFor(() => {
        expect(screen.getByText('Nouveau Client')).toBeInTheDocument();
      });
    });

    it('should show new client at the top of the list', async () => {
      const user = userEvent.setup();

      const newClient = {
        id: 'client-new',
        firstName: 'Nouveau',
        lastName: 'Client',
        email: 'nouveau@example.com',
        phone: '0600000010',
        createdAt: new Date().toISOString(),
      };

      mockApiResponse('post', '/api/clients', newClient, 201);

      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /ajouter/i });
      await user.click(addButton);

      await waitFor(() => {
        const list = screen.getByRole('list');
        const items = within(list).getAllByRole('listitem');
        // New client should be first
        expect(items[0]).toHaveTextContent('Nouveau Client');
      });
    });

    it('should handle add client failure gracefully', async () => {
      const user = userEvent.setup();

      mockApiError('post', '/api/clients', 'Server error', 500);

      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });

      const initialClientCount = screen.getAllByText(/ouvrir la fiche/i).length;

      const addButton = screen.getByRole('button', { name: /ajouter/i });
      await user.click(addButton);

      // Client count should not change
      await waitFor(() => {
        const currentClientCount = screen.getAllByText(/ouvrir la fiche/i).length;
        expect(currentClientCount).toBe(initialClientCount);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on fetch failure', async () => {
      mockApiError('get', '/api/clients', 'Server error', 500);

      render(<ClientList />);

      await waitFor(() => {
        expect(screen.getByText(/erreur de chargement/i)).toBeInTheDocument();
      });
    });

    it('should not show loading state when error occurs', async () => {
      mockApiError('get', '/api/clients', 'Server error', 500);

      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty client list', async () => {
      mockApiResponse('get', '/api/clients', []);

      render(<ClientList />);

      await waitFor(() => {
        expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument();
      });
    });

    it('should handle null/undefined data gracefully', async () => {
      mockApiResponse('get', '/api/clients', null);

      render(<ClientList />);

      await waitFor(() => {
        // Should show "Aucun résultat" or handle gracefully
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });
    });

    it('should trim whitespace in search', async () => {
      const user = userEvent.setup();

      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/rechercher un consultant/i);

      await user.type(searchInput, '  Sophie  ');

      await waitFor(() => {
        expect(screen.getByText('Sophie Laurent')).toBeInTheDocument();
      });
    });

    it('should handle special characters in search', async () => {
      const user = userEvent.setup();

      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/rechercher un consultant/i);

      await user.type(searchInput, '@example.com');

      // Should not crash
      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible search input', async () => {
      render(<ClientList />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/rechercher un consultant/i);
        expect(searchInput).toHaveAttribute('type', 'text');
      });
    });

    it('should have accessible add button', async () => {
      render(<ClientList />);

      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /ajouter/i });
        expect(addButton).toBeEnabled();
      });
    });

    it('should render links as actual link elements', async () => {
      render(<ClientList />);

      await waitFor(() => {
        const links = screen.getAllByText(/ouvrir la fiche/i);
        links.forEach((link) => {
          expect(link.closest('a')).toBeInTheDocument();
        });
      });
    });
  });

  describe('Performance', () => {
    it('should render large lists efficiently', async () => {
      const largeClientList = Array.from({ length: 100 }, (_, i) => ({
        id: `client-${i}`,
        firstName: `First${i}`,
        lastName: `Last${i}`,
        email: `client${i}@example.com`,
        phone: `060000${String(i).padStart(4, '0')}`,
        createdAt: new Date().toISOString(),
      }));

      mockApiResponse('get', '/api/clients', largeClientList);

      const startTime = Date.now();
      render(<ClientList />);

      await waitFor(() => {
        expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
      });

      const renderTime = Date.now() - startTime;

      // Should render in reasonable time (under 2 seconds)
      expect(renderTime).toBeLessThan(2000);
    });
  });
});
