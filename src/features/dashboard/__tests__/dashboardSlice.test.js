import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer, { fetchDashboardSummary, clearDashboardError } from '../dashboardSlice';
import { dashboardApi } from '../../../api/dashboardApi';
import { vi } from 'vitest';

// Mock the API
vi.mock('../../../api/dashboardApi', () => ({
  dashboardApi: {
    getSummary: vi.fn(),
  },
}));

describe('dashboardSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { dashboard: dashboardReducer },
    });
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const state = store.getState().dashboard;
    expect(state.summary.totalCustomers).toBe(0);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle clearDashboardError', () => {
    // Manually push an error into the state for testing
    store = configureStore({
      reducer: { dashboard: dashboardReducer },
      preloadedState: {
        dashboard: {
          error: 'Some previous error',
        },
      },
    });

    store.dispatch(clearDashboardError());
    expect(store.getState().dashboard.error).toBeNull();
  });

  it('should handle fetchDashboardSummary.pending', () => {
    store.dispatch({ type: fetchDashboardSummary.pending.type });
    const state = store.getState().dashboard;
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchDashboardSummary.fulfilled', async () => {
    const mockData = {
      totalCustomers: 50,
      checkedInCustomers: 20,
    };
    
    dashboardApi.getSummary.mockResolvedValueOnce({ data: mockData });
    
    await store.dispatch(fetchDashboardSummary());
    
    const state = store.getState().dashboard;
    expect(state.loading).toBe(false);
    expect(state.summary.totalCustomers).toBe(50);
    expect(state.summary.checkedInCustomers).toBe(20);
    expect(state.error).toBeNull();
  });

  it('should handle fetchDashboardSummary.rejected', async () => {
    const errorMessage = 'Network Error';
    dashboardApi.getSummary.mockRejectedValueOnce({
      response: { data: { message: errorMessage } }
    });

    await store.dispatch(fetchDashboardSummary());
    
    const state = store.getState().dashboard;
    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });
});
