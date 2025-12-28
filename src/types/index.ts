import { PaymentSystem } from '@/utils/cardGenerator';

export type User = {
  phone: string;
  firstName: string;
  lastName: string;
  middleName: string;
};

export type CardType = {
  id: string;
  name: string;
  type: 'debit-child' | 'debit-youth' | 'credit' | 'sticker' | 'other';
  format: 'virtual' | 'plastic';
  balance: number;
  cardNumber: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
  paymentSystem: PaymentSystem;
  color: string;
  isBlocked?: boolean;
};

export type Page = 'home' | 'cards' | 'credits' | 'transfers' | 'assistant' | 'profile' | 'friends';

export type Friend = {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  isFamilyMember?: boolean;
};

export type Transaction = {
  id: string;
  type: 'transfer' | 'payment' | 'credit';
  amount: number;
  date: Date;
  description: string;
  fromCard?: string;
  toCard?: string;
};

export type ServiceProvider = {
  id: string;
  name: string;
  category: 'mobile' | 'internet' | 'tv' | 'utilities';
  icon: string;
};
