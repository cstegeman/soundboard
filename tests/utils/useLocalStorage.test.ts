import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocalStorage } from '../../src/utils/useLocalStorage';

beforeEach(() => localStorage.clear());

describe('useLocalStorage', () => {
  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('k', [1]));
    expect(result.current[0]).toEqual([1]);
  });

  it('reads a stored value', () => {
    localStorage.setItem('k', JSON.stringify(['x']));
    const { result } = renderHook(() => useLocalStorage<string[]>('k', []));
    expect(result.current[0]).toEqual(['x']);
  });

  it('falls back to initial on corrupt JSON', () => {
    localStorage.setItem('k', '{nope');
    const { result } = renderHook(() => useLocalStorage('k', 'init'));
    expect(result.current[0]).toBe('init');
  });

  it('persists updates', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('k', []));
    act(() => result.current[1](['a']));
    expect(result.current[0]).toEqual(['a']);
    expect(localStorage.getItem('k')).toBe('["a"]');
  });

  it('keeps working in memory when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    const { result } = renderHook(() => useLocalStorage('k', 0));
    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
  });
});
