// Mock payment processing controller
export class PaymentController {
  static async processPayment(_orderId: string, _amount: number) {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock: 90% success rate
    const success = Math.random() > 0.1;
    const methods: ('card' | 'pix')[] = ['card', 'pix'];
    const method = methods[Math.floor(Math.random() * methods.length)];

    if (success) {
      return {
        success: true,
        method,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message: 'Pagamento processado com sucesso',
      };
    } else {
      throw new Error('Falha no processamento do pagamento. Tente novamente.');
    }
  }
}
