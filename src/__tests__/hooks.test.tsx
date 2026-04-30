import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('uses correct delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    rerender({ value: 'updated', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe('updated');
  });
});

describe('useLocalStorage', () => {
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      ...originalLocalStorage,
      getItem: vi.fn(),
      setItem: vi.fn(),
    });
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockClear();
    (window.localStorage.setItem as ReturnType<typeof vi.fn>).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns default value when key not found', () => {
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('returns parsed value from localStorage', () => {
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('"stored-value"');
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('sets value in localStorage', () => {
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const { result } = renderHook(() => useLocalStorage<string>('test-key', 'default'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith('test-key', '"new-value"');
  });

  it('handles object values', () => {
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const { result } = renderHook(() => useLocalStorage<{ name: string }>('test-key', { name: 'default' }));

    act(() => {
      result.current[1]({ name: 'updated' });
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith('test-key', '{"name":"updated"}');
  });

  it('handles function updates', () => {
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('"initial"');
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1]((prev) => `${prev}-updated`);
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith('test-key', '"initial-updated"');
  });
});
