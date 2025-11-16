import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PaymentController } from '@/controllers/payment.controller';

describe('PaymentController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      // Mock Math.random to return a value > 0.1 (success case)
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const promise = PaymentController.processPayment('order-1', 100);

      // Fast-forward time to resolve the delay
      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.method).toBeDefined();
      expect(result.transactionId).toBeDefined();
      expect(result.message).toBe('Pagamento processado com sucesso');

      mockRandom.mockRestore();
    });

    it('should fail payment when random value is low', async () => {
      // Mock Math.random to return a value < 0.1 (failure case)
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.05);

      const promise = PaymentController.processPayment('order-1', 100);

      // Fast-forward time to resolve the delay
      vi.advanceTimersByTime(1000);

      await expect(promise).rejects.toThrow(
        'Falha no processamento do pagamento. Tente novamente.'
      );

      mockRandom.mockRestore();
    });

    it('should simulate processing delay', async () => {
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const promise = PaymentController.processPayment('order-1', 100);

      // Check that promise hasn't resolved immediately
      expect(vi.getTimerCount()).toBeGreaterThan(0);

      await vi.advanceTimersByTimeAsync(1000);
      await promise;

      mockRandom.mockRestore();
    });
  });
});
