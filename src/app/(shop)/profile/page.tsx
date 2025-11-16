import { getCurrentUser } from '@/lib/auth/server';
import { ProfileController } from '@/controllers/profile.controller';
import { UserModel } from '@/models/user.model';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/profile/profile-form';
import { AddressForm } from '@/components/profile/address-form';
import { NotificationPreferences } from '@/components/profile/notification-preferences';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

async function getUserData() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const [userData, addresses, userProfile] = await Promise.all([
    ProfileController.getUserProfile(user.id),
    ProfileController.getUserAddresses(user.id),
    UserModel.findById(user.id),
  ]);

  return {
    user: {
      ...userData,
      email: user.email || '',
    },
    addresses,
    notificationPreferences: {
      promotionsEnabled: userProfile?.promotionsEnabled ?? true,
      orderUpdatesEnabled: userProfile?.orderUpdatesEnabled ?? true,
    },
  };
}

export default async function ProfilePage() {
  const { user, addresses, notificationPreferences } = await getUserData();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold sm:text-4xl">Meu Perfil</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Atualize suas informações de perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endereços</CardTitle>
            <CardDescription>
              Gerencie seus endereços de entrega
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressForm addresses={addresses} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <NotificationPreferences
          userId={user.id}
          preferences={notificationPreferences}
        />
      </div>
    </div>
  );
}
