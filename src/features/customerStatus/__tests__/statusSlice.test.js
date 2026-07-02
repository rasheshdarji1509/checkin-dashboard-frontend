import { configureStore } from '@reduxjs/toolkit';
import statusReducer, {
  fetchStatusHistory,
  updateCustomerStatus,
  clearStatusErrors,
  clearStatusHistoryState
} from '../statusSlice';
import { statusApi } from '../../../api/statusApi';
import { customerApi } from '../../../api/customerApi';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../api/statusApi', () => ({
  statusApi: {
    getStatusHistory: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

vi.mock('../../../api/customerApi', () => ({
  customerApi: {
    getCustomers: vi.fn(),
  },
}));

describe('statusSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { status: statusReducer },
    });
    vi.clearAllMocks();
  });

  it('should handle clearStatusErrors and clearStatusHistoryState', () => {
    store = configureStore({
      reducer: { status: statusReducer },
      preloadedState: {
        status: {
          history: [{ status: 'Waiting' }],
          error: 'Some error',
          actionError: 'Action error'
        }
      }
    });

    store.dispatch(clearStatusErrors());
    let state = store.getState().status;
    expect(state.error).toBeNull();
    expect(state.actionError).toBeNull();
    expect(state.history.length).toBe(1); // Not cleared yet

    store.dispatch(clearStatusHistoryState());
    state = store.getState().status;
    expect(state.history.length).toBe(0);
    expect(state.error).toBeNull();
  });

  it('should handle fetchStatusHistory.fulfilled', async () => {
    const mockHistory = [{ status: 'Waiting' }, { status: 'Checked-In' }];
    statusApi.getStatusHistory.mockResolvedValueOnce({ data: mockHistory });

    await store.dispatch(fetchStatusHistory('cust123'));

    const state = store.getState().status;
    expect(state.loading).toBe(false);
    expect(state.history).toEqual(mockHistory);
  });

  it('should handle updateCustomerStatus.fulfilled', async () => {
    statusApi.updateStatus.mockResolvedValueOnce({ data: { success: true } });
    statusApi.getStatusHistory.mockResolvedValueOnce({ data: [] });
    customerApi.getCustomers.mockResolvedValueOnce({ data: [] });

    await store.dispatch(updateCustomerStatus({ customerId: 'cust123', status: 'Assigned' }));

    const state = store.getState().status;
    expect(state.actionLoading).toBe(false);
    expect(state.actionError).toBeNull();
  });
});
