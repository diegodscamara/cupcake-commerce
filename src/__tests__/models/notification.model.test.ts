import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationModel } from '@/models/notification.model';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

describe('NotificationModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should return notifications for user', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          userId: 'user-1',
          title: 'New Promotion',
          message: 'Check out our new cupcakes!',
          type: 'promotion' as const,
          isRead: false,
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockNotifications),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await NotificationModel.findByUserId('user-1');

      expect(result).toEqual(mockNotifications);
    });
  });

  describe('findUnreadByUserId', () => {
    it('should return only unread notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          userId: 'user-1',
          title: 'New Promotion',
          message: 'Check out our new cupcakes!',
          type: 'promotion' as const,
          isRead: false,
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockNotifications),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await NotificationModel.findUnreadByUserId('user-1');

      expect(result).toEqual(mockNotifications);
    });
  });

  describe('create', () => {
    it('should create a new notification', async () => {
      const newNotification = {
        userId: 'user-1',
        title: 'Order Shipped',
        message: 'Your order has been shipped',
        type: 'order' as const,
      };

      const createdNotification = {
        id: 'notif-1',
        ...newNotification,
        isRead: false,
        createdAt: new Date(),
      };

      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([createdNotification]),
      };

      vi.mocked(db.insert).mockReturnValue(mockInsert as any);

      const result = await NotificationModel.create(newNotification);

      expect(result).toEqual(createdNotification);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(db.update).mockReturnValue(mockUpdate as any);

      await NotificationModel.markAsRead('notif-1');

      expect(db.update).toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for user', async () => {
      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(db.update).mockReturnValue(mockUpdate as any);

      await NotificationModel.markAllAsRead('user-1');

      expect(db.update).toHaveBeenCalled();
    });
  });
});
