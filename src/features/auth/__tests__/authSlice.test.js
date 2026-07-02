import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginStart, loginSuccess, loginFailure, logout } from '../authSlice';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('authSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { auth: authReducer },
    });
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should return initial state', () => {
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle loginStart', () => {
    store.dispatch(loginStart());
    const state = store.getState().auth;
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle loginSuccess and save to localStorage', () => {
    const mockUser = { name: 'Admin' };
    const mockToken = 'dummy-token-123';

    store.dispatch(loginSuccess({ user: mockUser, token: mockToken }));
    
    const state = store.getState().auth;
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);

    // Verify localStorage was updated
    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser);
  });

  it('should handle loginFailure and clear localStorage', () => {
    localStorage.setItem('token', 'old-token');
    
    store.dispatch(loginFailure('Invalid credentials'));
    
    const state = store.getState().auth;
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.error).toBe('Invalid credentials');

    // Verify localStorage was cleared
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should handle logout and clear state/localStorage', () => {
    // Set up logged-in state first
    store.dispatch(loginSuccess({ user: { name: 'Admin' }, token: '123' }));
    
    store.dispatch(logout());
    
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    
    expect(localStorage.getItem('token')).toBeNull();
  });
});
