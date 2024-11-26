import React from 'react';
import { PieChart, Wallet, Target, TrendingUp, Receipt, ArrowUpRight, ArrowDownRight, CreditCard, Landmark, PiggyBank } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';

const getAccountIcon = (type: string) => {
  switch (type) {
    case 'checking':
      return Landmark;
    case 'savings':
      return PiggyBank;
    case 'credit':
      return CreditCard;
    default:
      return Wallet;
  }
};

export default function Dashboard() {
  const { state } = useApp();
  const { accounts, transactions } = state;

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const monthlyExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const monthlyIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    return {
      name: format(month, 'MMM'),
      expenses: 0,
      income: 0
    };
  }).reverse();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-gray-500">{format(new Date(), 'MMMM yyyy')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Solde Total"
          amount={totalBalance}
          icon={Wallet}
          color="indigo"
        />
        <DashboardCard
          title="Dépenses"
          amount={monthlyExpenses}
          icon={Receipt}
          color="red"
        />
        <DashboardCard
          title="Revenus"
          amount={monthlyIncome}
          icon={TrendingUp}
          color="green"
        />
        <DashboardCard
          title="Épargne"
          amount={totalBalance > 0 ? totalBalance : 0}
          icon={Target}
          color="amber"
        />
      </div>

      {/* Nouvelle section des comptes */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes Comptes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const AccountIcon = getAccountIcon(account.type);
            const transactions = state.transactions
              .filter(tx => tx.accountId === account.id)
              .slice(0, 3);

            return (
              <div key={account.id} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <AccountIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{account.name}</h3>
                    <p className="text-2xl font-semibold text-gray-900">
                      {account.balance.toLocaleString()}€
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {transactions.map((tx, index) => (
                    <div key={tx.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-gray-600 truncate max-w-[150px]">
                          {tx.description}
                        </span>
                      </div>
                      <span className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}€
                      </span>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-2">
                      Aucune transaction récente
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Aperçu Mensuel</h2>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#10B981" name="Revenus" />
                <Bar dataKey="expenses" fill="#EF4444" name="Dépenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transactions Récentes</h2>
          <div className="space-y-4">
            {transactions.slice(0, 4).map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{tx.description}</p>
                  <p className="text-sm text-gray-500">{format(new Date(tx.date), 'dd MMM yyyy')}</p>
                </div>
                <span className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}€
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-gray-500 py-4">Aucune transaction récente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, amount, icon: Icon, color }: any) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className={`p-2 rounded-lg ${colors[color as keyof typeof colors]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-semibold mt-1">{amount.toLocaleString()}€</p>
    </div>
  );
}