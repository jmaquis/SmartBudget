import React, { useState } from 'react';
import { format } from 'date-fns';
import { Receipt, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import TransactionForm from './TransactionForm';
import TransactionActions from './TransactionActions';
import AccountSelector from './AccountSelector';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';

export default function Transactions() {
  const { state } = useApp();
  const { transactions, selectedAccount } = state;
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(
    tx => tx.accountId === selectedAccount
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500">Gérez vos revenus et dépenses</p>
      </div>

      <AccountSelector />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Historique</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Filter className="w-4 h-4" />
                  Filtrer
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {tx.amount > 0 ? (
                        <ArrowUpRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{format(new Date(tx.date), 'dd MMM yyyy')}</span>
                        <span>•</span>
                        <span>{tx.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${
                      tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}€
                    </span>
                    <TransactionActions
                      transaction={tx}
                      onEdit={setEditingTransaction}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <TransactionForm
            editingTransaction={editingTransaction}
            onCancel={() => setEditingTransaction(null)}
          />
        </div>
      </div>
    </div>
  );
}