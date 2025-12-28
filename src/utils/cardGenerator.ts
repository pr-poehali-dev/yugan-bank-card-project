export type PaymentSystem = 'visa' | 'mastercard' | 'mir' | 'mir-2' | 'unionpay' | 'visa-plus';

export interface CardData {
  number: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
  paymentSystem: PaymentSystem;
  bin: string;
}

const paymentSystems: PaymentSystem[] = ['visa', 'mastercard', 'mir', 'mir-2', 'unionpay', 'visa-plus'];

const paymentSystemBins: Record<PaymentSystem, string[]> = {
  'visa': ['4'],
  'mastercard': ['51', '52', '53', '54', '55', '22'],
  'mir': ['220'],
  'mir-2': ['220'],
  'unionpay': ['62'],
  'visa-plus': ['4']
};

const paymentSystemLogos: Record<PaymentSystem, string> = {
  'visa': '💳 Visa',
  'mastercard': '💳 MasterCard',
  'mir': '💳 МИР',
  'mir-2': '💳 МИР-2',
  'unionpay': '💳 UnionPay',
  'visa-plus': '💳 Visa Plus'
};

function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

function generateLuhnCheckDigit(partial: string): string {
  let sum = 0;
  let isEven = true;

  for (let i = partial.length - 1; i >= 0; i--) {
    let digit = parseInt(partial[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

function generateCardNumber(paymentSystem: PaymentSystem): string {
  const bins = paymentSystemBins[paymentSystem];
  const bin = bins[Math.floor(Math.random() * bins.length)];
  
  const length = 16;
  const remainingLength = length - bin.length - 1;
  
  let cardNumber = bin;
  for (let i = 0; i < remainingLength; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  
  const checkDigit = generateLuhnCheckDigit(cardNumber);
  cardNumber += checkDigit;
  
  return cardNumber;
}

function formatCardNumber(number: string): string {
  return number.match(/.{1,4}/g)?.join(' ') || number;
}

function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

function generateExpiry(): { month: string; year: string } {
  const currentYear = new Date().getFullYear();
  const year = currentYear + Math.floor(Math.random() * 5) + 1;
  const month = Math.floor(Math.random() * 12) + 1;
  
  return {
    month: month.toString().padStart(2, '0'),
    year: year.toString().slice(-2)
  };
}

export function generateCard(): CardData {
  const paymentSystem = paymentSystems[Math.floor(Math.random() * paymentSystems.length)];
  const number = generateCardNumber(paymentSystem);
  const cvv = generateCVV();
  const expiry = generateExpiry();
  
  return {
    number,
    cvv,
    expiryMonth: expiry.month,
    expiryYear: expiry.year,
    paymentSystem,
    bin: number.slice(0, 6)
  };
}

export function getPaymentSystemName(system: PaymentSystem): string {
  return paymentSystemLogos[system];
}

export function formatCardNumberDisplay(number: string): string {
  return formatCardNumber(number);
}
