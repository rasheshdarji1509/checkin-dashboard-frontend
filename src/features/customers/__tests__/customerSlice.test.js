import { configureStore } from '@reduxjs/toolkit';
import customerReducer, { 
  fetchCustomers, 
  addCustomer, 
  editCustomer, 
  deleteCustomer, 
  clearCustomerErrors 
} from '../customerSlice';
import { customerApi } from '../../../api/customerApi';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../api/customerApi', () => ({
  customerApi: {
    getCustomers: vi.fn(),
    createCustomer: vi.fn(),
    updateCustomer: vi.fn(),
    deleteCustomer: vi.fn(),
  },
}));

describe('customerSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { customers: customerReducer },
    });
    vi.clearAllMocks();
  });

  it('should handle clearCustomerErrors', () => {
    store = configureStore({
      reducer: { customers: customerReducer },
      preloadedState: {
        customers: {
          error: 'Some error',
          actionError: 'Action error'
        }
      }
    });

    store.dispatch(clearCustomerErrors());
    const state = store.getState().customers;
    expect(state.error).toBeNull();
    expect(state.actionError).toBeNull();
  });

  it('should handle fetchCustomers.fulfilled', async () => {
    const mockCustomers = [{ _id: '1', name: 'John Doe' }];
    customerApi.getCustomers.mockResolvedValueOnce({ data: mockCustomers });

    await store.dispatch(fetchCustomers());

    const state = store.getState().customers;
    expect(state.loading).toBe(false);
    expect(state.list).toEqual(mockCustomers);
  });

  it('should handle addCustomer.fulfilled', async () => {
    const newCustomer = { _id: '2', name: 'Jane Doe' };
    customerApi.createCustomer.mockResolvedValueOnce({ data: newCustomer });

    await store.dispatch(addCustomer({ name: 'Jane Doe' }));

    const state = store.getState().customers;
    expect(state.actionLoading).toBe(false);
    expect(state.list[0]).toEqual(newCustomer);
  });

  it('should handle editCustomer.fulfilled', async () => {
    // Setup initial state with a customer
    store = configureStore({
      reducer: { customers: customerReducer },
      preloadedState: {
        customers: {
          list: [{ _id: '1', name: 'John Doe' }]
        }
      }
    });

    const updatedCustomer = { _id: '1', name: 'John Smith' };
    customerApi.updateCustomer.mockResolvedValueOnce({ data: updatedCustomer });

    await store.dispatch(editCustomer({ id: '1', data: { name: 'John Smith' } }));

    const state = store.getState().customers;
    expect(state.list[0].name).toBe('John Smith');
  });

  it('should handle deleteCustomer.fulfilled', async () => {
    // Setup initial state with a customer
    store = configureStore({
      reducer: { customers: customerReducer },
      preloadedState: {
        customers: {
          list: [{ _id: '1', name: 'John Doe' }]
        }
      }
    });

    customerApi.deleteCustomer.mockResolvedValueOnce({});

    await store.dispatch(deleteCustomer('1'));

    const state = store.getState().customers;
    expect(state.list.length).toBe(0);
  });
});
