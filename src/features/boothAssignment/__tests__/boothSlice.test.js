import { configureStore } from '@reduxjs/toolkit';
import boothReducer, {
  fetchBoothData,
  fetchAvailableCustomers,
  assignBooth,
  reassignBooth,
  cancelAssignment,
  clearBoothErrors
} from '../boothSlice';
import { boothApi } from '../../../api/boothApi';
import { customerApi } from '../../../api/customerApi';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../api/boothApi', () => ({
  boothApi: {
    getAssignments: vi.fn(),
    createAssignment: vi.fn(),
    updateAssignment: vi.fn(),
    deleteAssignment: vi.fn(),
  },
}));

vi.mock('../../../api/customerApi', () => ({
  customerApi: {
    getCustomers: vi.fn(),
  },
}));

describe('boothSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { booth: boothReducer },
    });
    vi.clearAllMocks();
  });

  it('should handle fetchBoothData.fulfilled', async () => {
    const mockData = {
      booths: [{ _id: 'b1', boothNumber: 'A1' }],
      boothAssignments: [{ _id: 'a1', status: 'Assigned' }]
    };
    boothApi.getAssignments.mockResolvedValueOnce({ data: mockData });

    await store.dispatch(fetchBoothData());

    const state = store.getState().booth;
    expect(state.loading).toBe(false);
    expect(state.booths).toEqual(mockData.booths);
    expect(state.assignments).toEqual(mockData.boothAssignments);
  });

  it('should handle fetchAvailableCustomers.fulfilled', async () => {
    const mockCustomers = [{ _id: 'c1', name: 'John Doe', eventStatus: 'Checked-In' }];
    customerApi.getCustomers.mockResolvedValueOnce({ data: mockCustomers });

    await store.dispatch(fetchAvailableCustomers());

    const state = store.getState().booth;
    expect(state.availableCustomers).toEqual(mockCustomers);
  });

  it('should handle assignBooth.fulfilled', async () => {
    boothApi.createAssignment.mockResolvedValueOnce({ data: { success: true } });
    boothApi.getAssignments.mockResolvedValueOnce({ data: { booths: [], boothAssignments: [] } });
    customerApi.getCustomers.mockResolvedValueOnce({ data: [] });

    await store.dispatch(assignBooth({ boothId: 'b1', customerId: 'c1' }));

    const state = store.getState().booth;
    expect(state.actionLoading).toBe(false);
    // It should have dispatched fetchBoothData and fetchAvailableCustomers, 
    // but we mainly test the state here.
    expect(state.actionError).toBeNull();
  });

  it('should handle cancelAssignment.fulfilled', async () => {
    boothApi.deleteAssignment.mockResolvedValueOnce({});
    boothApi.getAssignments.mockResolvedValueOnce({ data: { booths: [], boothAssignments: [] } });
    customerApi.getCustomers.mockResolvedValueOnce({ data: [] });

    await store.dispatch(cancelAssignment('a1'));

    const state = store.getState().booth;
    expect(state.actionLoading).toBe(false);
    expect(state.actionError).toBeNull();
  });
});
