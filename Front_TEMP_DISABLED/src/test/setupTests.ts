import '@testing-library/jest-dom';

// Mock React Router
const mockNavigate = jest.fn();
let mockSearchParams = new URLSearchParams();
const mockSetSearchParams = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams = new URLSearchParams();
});

// Export for use in tests
export { mockNavigate, mockSearchParams, mockSetSearchParams };
