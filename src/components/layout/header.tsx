import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/server';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Bell } from 'lucide-react';
import { NotificationModel } from '@/models/notification.model';
import { CartController } from '@/controllers/cart.controller';
import { getSessionCartWithDetails } from '@/lib/utils/cart-session';
import { UserMenu } from './user-menu';

export async function Header() {
  const user = await getCurrentUser();

  let unreadCount = 0;
  let cartItemCount = 0;

  if (user) {
    const [unreadNotifications, cartItems] = await Promise.all([
      NotificationModel.findUnreadByUserId(user.id),
      CartController.getCartItems(user.id),
    ]);
    unreadCount = unreadNotifications.length;
    cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  } else {
    const sessionCartItems = await getSessionCartWithDetails();
    cartItemCount = sessionCartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🧁</span>
          <span className="text-xl font-semibold text-gray-900">Cupcakes</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Button>
          </Link>
          {user && (
            <>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
              <UserMenu userEmail={user.email || undefined} />
            </>
          )}
          {!user && (
            <Link href="/login">
              <Button>Entrar</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
