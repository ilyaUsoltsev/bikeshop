import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import prisma from '@/db/db';
import { formatCurrencyCHF, formatNumber } from '@/lib/formatter';
import React from 'react';

async function getSalesData() {
  const data = await prisma.order.aggregate({
    _sum: {
      pricePaidInCents: true,
    },
    _count: true,
  });

  return {
    amount: (data._sum.pricePaidInCents ?? 0) / 100,
    count: data._count,
  };
}

async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    prisma.user.count(),
    prisma.order.aggregate({
      _sum: {
        pricePaidInCents: true,
      },
    }),
  ]);

  return {
    userCount,
    averageValuePerUser:
      userCount === 0
        ? 0
        : (orderData._sum.pricePaidInCents ?? 0) / 100 / userCount,
  };
}

// async function getProductData() {
//   const data = await prisma.product.count({
//     where: {
//       isAvailable: true,
//     },
//   });

//   return {
//     count: data,
//   };
// }

const AdminDashboard = async () => {
  const [salesData, userData] = await Promise.all([
    getSalesData(),
    getUserData(),
  ]);
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg-grid-cols-3 gap-4'>
      <DashboardCard
        title='Total Sales'
        subtitle={`Orders ${formatNumber(salesData.count)}`}
        body={formatCurrencyCHF(salesData.amount)}
      />
      <DashboardCard
        title='Customers'
        subtitle={`${formatCurrencyCHF(
          userData.averageValuePerUser
        )} Average Value`}
        body={`${userData.userCount} Customers in Total`}
      />
      <DashboardCard
        title='Active Products'
        subtitle={`${formatCurrencyCHF(
          userData.averageValuePerUser
        )} Average Value`}
        body={`${userData.userCount} Customers in Total`}
      />
    </div>
  );
};

export default AdminDashboard;

interface DashboardCardProps {
  title: string;
  subtitle: string;
  body: string;
}

const DashboardCard = ({ title, subtitle, body }: DashboardCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
    </Card>
  );
};
