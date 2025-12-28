import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { User, CardType, Page, Friend, ServiceProvider } from '@/types';
import { generateCard, formatCardNumberDisplay, getPaymentSystemName } from '@/utils/cardGenerator';
import CardDetailDialog from '@/components/CardDetailDialog';

const serviceProviders: ServiceProvider[] = [
  { id: 'mts', name: 'МТС', category: 'mobile', icon: '📱' },
  { id: 'beeline', name: 'Билайн', category: 'mobile', icon: '📱' },
  { id: 'megafon', name: 'Мегафон', category: 'mobile', icon: '📱' },
  { id: 'tele2', name: 'Теле2', category: 'mobile', icon: '📱' },
  { id: 'domru', name: 'Дом.ру', category: 'internet', icon: '🌐' },
  { id: 'rostelecom', name: 'Ростелеком', category: 'internet', icon: '🌐' },
  { id: 'mgts', name: 'МГТС', category: 'tv', icon: '📺' },
];

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [cards, setCards] = useState<CardType[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  
  const [showNewCardDialog, setShowNewCardDialog] = useState(false);
  const [showCardActionsDialog, setShowCardActionsDialog] = useState(false);
  const [showCardDetailDialog, setShowCardDetailDialog] = useState(false);
  const [showCardLimitsDialog, setShowCardLimitsDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showFriendDialog, setShowFriendDialog] = useState(false);
  const [showAssistantDialog, setShowAssistantDialog] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'chat' | 'call'>('chat');

  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');

  const [newCardType, setNewCardType] = useState<CardType['type']>('debit-child');
  const [newCardFormat, setNewCardFormat] = useState<CardType['format']>('virtual');
  const [newCardName, setNewCardName] = useState('');

  const [creditAmount, setCreditAmount] = useState('');
  const [creditCard, setCreditCard] = useState('');

  const [transferType, setTransferType] = useState<'own' | 'phone' | 'card'>('own');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferFromCard, setTransferFromCard] = useState('');
  const [transferToCard, setTransferToCard] = useState('');
  const [transferPhone, setTransferPhone] = useState('');
  const [transferCardNumber, setTransferCardNumber] = useState('');

  const [paymentService, setPaymentService] = useState('');
  const [paymentAccount, setPaymentAccount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentCard, setPaymentCard] = useState('');

  const [friendPhone, setFriendPhone] = useState('');
  const [friendFirstName, setFriendFirstName] = useState('');
  const [friendLastName, setFriendLastName] = useState('');
  const [friendIsFamily, setFriendIsFamily] = useState(false);

  const [cardDailyLimit, setCardDailyLimit] = useState('');
  const [cardMonthlyLimit, setCardMonthlyLimit] = useState('');

  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Привет! Я Банк-Бонг, ваш виртуальный помощник. Чем могу помочь?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const createPremiumCard = () => {
    const cardData = generateCard();
    const premiumCard: CardType = {
      id: 'premium-' + Date.now().toString(),
      name: '💎 Премиум Юган',
      type: 'premium',
      format: 'plastic',
      balance: 1000,
      cardNumber: cardData.number,
      cvv: cardData.cvv,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      paymentSystem: cardData.paymentSystem,
      color: 'from-yellow-400 via-amber-500 to-yellow-600',
      isBlocked: false,
      dailyLimit: 100000,
      monthlyLimit: 1000000,
    };
    return premiumCard;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !firstName || !lastName) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    
    const newUser: User = { 
      phone, 
      firstName, 
      lastName, 
      middleName,
      isPremium: false
    };
    
    setUser(newUser);
    
    const welcomeCard = createPremiumCard();
    setCards([welcomeCard]);
    
    setIsAuthenticated(true);
    toast.success('🎉 Добро пожаловать в Юган Банк! Вам начислено 1000₽ на приветственную карту!');
  };

  const maxCards = user?.isPremium ? 10 : 3;
  const maxCreditAmount = user?.isPremium ? Infinity : 100000;

  const handleCreateCard = () => {
    if (!newCardName) {
      toast.error('Введите название карты');
      return;
    }

    if (cards.length >= maxCards) {
      toast.error(user?.isPremium 
        ? 'Достигнут лимит карт (10)' 
        : 'Достигнут лимит карт. Оформите Премиум Юган для создания до 10 карт!'
      );
      return;
    }

    const colors: Record<CardType['type'], string> = {
      'debit-child': 'from-pink-400 to-purple-400',
      'debit-youth': 'from-blue-400 to-cyan-400',
      'credit': 'from-amber-400 to-orange-400',
      'sticker': 'from-green-400 to-emerald-400',
      'other': 'from-gray-400 to-slate-400',
      'premium': 'from-yellow-400 via-amber-500 to-yellow-600',
    };

    const cardData = generateCard();
    const newCard: CardType = {
      id: Date.now().toString(),
      name: newCardName,
      type: newCardType,
      format: newCardFormat,
      balance: 0,
      cardNumber: cardData.number,
      cvv: cardData.cvv,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      paymentSystem: cardData.paymentSystem,
      color: colors[newCardType],
      isBlocked: false,
      dailyLimit: 50000,
      monthlyLimit: 300000,
    };

    setCards([...cards, newCard]);
    setShowNewCardDialog(false);
    setNewCardName('');
    toast.success(`Карта "${newCardName}" успешно создана!`);
  };

  const handleDeleteCard = (cardId: string) => {
    setCards(cards.filter(c => c.id !== cardId));
    setShowCardActionsDialog(false);
    toast.success('Карта удалена');
  };

  const handleBlockCard = () => {
    if (selectedCard) {
      setCards(cards.map(c => 
        c.id === selectedCard.id ? { ...c, isBlocked: !c.isBlocked } : c
      ));
      toast.success(selectedCard.isBlocked ? 'Карта разблокирована' : 'Карта заблокирована');
      setShowCardActionsDialog(false);
    }
  };

  const handleRenameCard = () => {
    const newName = prompt('Введите новое название карты:');
    if (newName && selectedCard) {
      setCards(cards.map(c => c.id === selectedCard.id ? { ...c, name: newName } : c));
      toast.success('Карта переименована');
      setShowCardActionsDialog(false);
    }
  };

  const handleSetCardLimits = () => {
    if (!selectedCard) return;

    const dailyLimit = parseFloat(cardDailyLimit) || selectedCard.dailyLimit || 0;
    const monthlyLimit = parseFloat(cardMonthlyLimit) || selectedCard.monthlyLimit || 0;

    setCards(cards.map(c => 
      c.id === selectedCard.id 
        ? { ...c, dailyLimit, monthlyLimit } 
        : c
    ));

    setShowCardLimitsDialog(false);
    toast.success('Лимиты установлены');
  };

  const handleCreditRequest = () => {
    if (!creditAmount || !creditCard) {
      toast.error('Заполните все поля');
      return;
    }

    const amount = parseFloat(creditAmount);

    if (!user?.isPremium && amount > maxCreditAmount) {
      toast.error(`Максимальная сумма кредита ${maxCreditAmount.toLocaleString('ru-RU')}₽. Оформите Премиум Юган для безлимитных кредитов!`);
      return;
    }

    setCards(cards.map(c => 
      c.id === creditCard 
        ? { ...c, balance: c.balance + amount }
        : c
    ));

    setShowCreditDialog(false);
    setCreditAmount('');
    toast.success(`Кредит ${amount.toLocaleString('ru-RU')} ₽ одобрен и зачислен!`);
  };

  const handleTransfer = () => {
    if (!transferAmount || !transferFromCard) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    const amount = parseFloat(transferAmount);
    const fromCard = cards.find(c => c.id === transferFromCard);

    if (!fromCard || fromCard.balance < amount) {
      toast.error('Недостаточно средств на карте');
      return;
    }

    if (transferType === 'own' && !transferToCard) {
      toast.error('Выберите карту для зачисления');
      return;
    }

    if (transferType === 'phone' && !transferPhone) {
      toast.error('Введите номер телефона получателя');
      return;
    }

    if (transferType === 'card' && !transferCardNumber) {
      toast.error('Введите номер карты получателя');
      return;
    }

    if (transferType === 'own') {
      setCards(cards.map(c => {
        if (c.id === transferFromCard) return { ...c, balance: c.balance - amount };
        if (c.id === transferToCard) return { ...c, balance: c.balance + amount };
        return c;
      }));
      toast.success(`Переведено ${amount.toLocaleString('ru-RU')} ₽ между вашими картами`);
    } else {
      setCards(cards.map(c => 
        c.id === transferFromCard ? { ...c, balance: c.balance - amount } : c
      ));
      const recipient = transferType === 'phone' ? transferPhone : `карту ${transferCardNumber}`;
      toast.success(`Переведено ${amount.toLocaleString('ru-RU')} ₽ на ${recipient}`);
    }

    setShowTransferDialog(false);
    setTransferAmount('');
    setTransferPhone('');
    setTransferCardNumber('');
  };

  const handlePayment = () => {
    if (!paymentService || !paymentAccount || !paymentAmount || !paymentCard) {
      toast.error('Заполните все поля');
      return;
    }

    const amount = parseFloat(paymentAmount);
    const card = cards.find(c => c.id === paymentCard);

    if (!card || card.balance < amount) {
      toast.error('Недостаточно средств на карте');
      return;
    }

    setCards(cards.map(c => 
      c.id === paymentCard ? { ...c, balance: c.balance - amount } : c
    ));

    const service = serviceProviders.find(s => s.id === paymentService);
    toast.success(`Оплачено ${amount.toLocaleString('ru-RU')} ₽ для ${service?.name}`);
    setShowPaymentDialog(false);
    setPaymentAmount('');
    setPaymentAccount('');
  };

  const handleAddFriend = () => {
    if (!friendPhone || !friendFirstName || !friendLastName) {
      toast.error('Заполните все поля');
      return;
    }

    const newFriend: Friend = {
      id: Date.now().toString(),
      phone: friendPhone,
      firstName: friendFirstName,
      lastName: friendLastName,
      isFamilyMember: friendIsFamily,
    };

    setFriends([...friends, newFriend]);
    setShowFriendDialog(false);
    setFriendPhone('');
    setFriendFirstName('');
    setFriendLastName('');
    setFriendIsFamily(false);
    toast.success(`${friendFirstName} ${friendLastName} добавлен${friendIsFamily ? ' в семью' : ' в друзья'}`);
  };

  const handleActivatePremium = () => {
    if (!user) return;
    
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    
    setUser({ ...user, isPremium: true, premiumExpiresAt: expiresAt });
    setShowPremiumDialog(false);
    toast.success('🎉 Премиум Юган активирован на 1 месяц!');
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    setChatMessages([...chatMessages, { role: 'user', text: chatInput }]);
    
    setTimeout(() => {
      const responses = [
        'Понял вас! Чем ещё могу помочь?',
        'Сейчас выполню вашу операцию.',
        'Отличный вопрос! Я могу помочь с переводами, платежами и кредитами.',
        'Всё готово! Что-то ещё?',
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages(prev => [...prev, { role: 'bot', text: response }]);
    }, 1000);

    setChatInput('');
  };

  const handleStartCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
    toast.success('Соединение с Банк-Бонг установлено');
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    toast.success('Звонок завершён');
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCards([]);
    setFriends([]);
    setCurrentPage('home');
    toast.success('Вы вышли из аккаунта');
  };

  const handleResetAccount = () => {
    if (confirm('Вы уверены, что хотите сбросить аккаунт? Все карты будут удалены.')) {
      setCards([createPremiumCard()]);
      setFriends([]);
      toast.success('Аккаунт сброшен');
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Icon name="Building2" className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-primary mb-2">Юган Банк</h1>
              <p className="text-muted-foreground">Регистрация в системе</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="phone">Номер телефона *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (999) 999-99-99"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="lastName">Фамилия *</Label>
                <Input
                  id="lastName"
                  placeholder="Иванов"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="firstName">Имя *</Label>
                <Input
                  id="firstName"
                  placeholder="Иван"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="middleName">Отчество</Label>
                <Input
                  id="middleName"
                  placeholder="Иванович"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>

              <div className="bg-accent/10 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-1">🎁 Приветственный бонус</p>
                <p className="text-xs text-muted-foreground">При регистрации вы получите премиум-карту с 1000₽!</p>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Зарегистрироваться
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderHome = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white relative overflow-hidden">
        {user?.isPremium && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-yellow-400 text-yellow-900 border-0">
              <Icon name="Crown" size={14} className="mr-1" />
              Premium
            </Badge>
          </div>
        )}
        <p className="text-sm opacity-90 mb-1">Добро пожаловать</p>
        <h2 className="text-2xl font-bold mb-4">{user?.firstName} {user?.lastName}</h2>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <p className="text-sm opacity-90 mb-1">Общий баланс</p>
          <p className="text-3xl font-bold">
            {cards.reduce((sum, card) => sum + card.balance, 0).toLocaleString('ru-RU')} ₽
          </p>
        </div>
      </div>

      {!user?.isPremium && (
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowPremiumDialog(true)}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
              <Icon name="Crown" size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Премиум Юган</p>
              <p className="text-sm text-muted-foreground">До 10 карт, безлимитные кредиты и больше возможностей</p>
            </div>
            <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
          </div>
        </Card>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Быстрые действия</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setShowTransferDialog(true)}>
            <Icon name="ArrowRightLeft" size={24} />
            <span className="text-sm">Перевод</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setShowPaymentDialog(true)}>
            <Icon name="Receipt" size={24} />
            <span className="text-sm">Оплата</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setShowCreditDialog(true)}>
            <Icon name="Wallet" size={24} />
            <span className="text-sm">Кредит</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => {
            setShowAssistantDialog(true);
            setAssistantMode('chat');
          }}>
            <Icon name="Bot" size={24} />
            <span className="text-sm">Банк-Бонг</span>
          </Button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Мои карты</h3>
          <Button onClick={() => setShowNewCardDialog(true)} size="sm">
            <Icon name="Plus" size={16} className="mr-1" />
            Создать
          </Button>
        </div>

        <div className="space-y-3">
          {cards.slice(0, 3).map((card) => (
            <Card 
              key={card.id} 
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setSelectedCard(card);
                setShowCardActionsDialog(true);
              }}
            >
              <div className={`h-2 bg-gradient-to-r ${card.color}`} />
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{card.name}</p>
                      {card.isBlocked && (
                        <Badge variant="destructive" className="text-xs">Заблокирована</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{formatCardNumberDisplay(card.cardNumber).slice(0, 19)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{getPaymentSystemName(card.paymentSystem)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{card.balance.toLocaleString('ru-RU')} ₽</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {card.format === 'virtual' ? 'Виртуальная' : 'Пластиковая'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {cards.length > 3 && (
            <Button variant="ghost" className="w-full" onClick={() => setCurrentPage('cards')}>
              Показать все карты ({cards.length})
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Мои карты</h2>
        <Button onClick={() => setShowNewCardDialog(true)}>
          <Icon name="Plus" size={20} className="mr-2" />
          Создать
        </Button>
      </div>

      {cards.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="CreditCard" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Нет карт</h3>
          <p className="text-muted-foreground mb-6">Создайте свою первую карту для начала работы</p>
          <Button onClick={() => setShowNewCardDialog(true)} size="lg">
            Создать карту
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {cards.map((card) => (
            <Card 
              key={card.id}
              className="overflow-hidden cursor-pointer hover:shadow-xl transition-all"
              onClick={() => {
                setSelectedCard(card);
                setShowCardDetailDialog(true);
              }}
            >
              <div className={`h-48 bg-gradient-to-br ${card.color} p-6 text-white relative`}>
                {card.isBlocked && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                      <Icon name="Lock" size={48} className="mx-auto mb-2" />
                      <p className="font-semibold">Карта заблокирована</p>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-sm opacity-90">Юган Банк</p>
                    <p className="font-semibold mt-1">{card.name}</p>
                  </div>
                  <Badge className="bg-white/20 text-white border-0">
                    {getPaymentSystemName(card.paymentSystem)}
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-mono mb-2 tracking-wider">{formatCardNumberDisplay(card.cardNumber)}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs opacity-75">Срок</p>
                      <p className="font-mono">{card.expiryMonth}/{card.expiryYear}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-75">Баланс</p>
                      <p className="text-xl font-bold">{card.balance.toLocaleString('ru-RU')} ₽</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderTransfers = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Переводы</h2>

      <div className="grid gap-3">
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowTransferDialog(true)}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="ArrowRightLeft" size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold">Между своими счетами</p>
              <p className="text-sm text-muted-foreground">Перевод между вашими картами</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
          setTransferType('phone');
          setShowTransferDialog(true);
        }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <Icon name="Phone" size={24} className="text-accent" />
            </div>
            <div>
              <p className="font-semibold">По номеру телефона</p>
              <p className="text-sm text-muted-foreground">Перевод на номер получателя</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
          setTransferType('card');
          setShowTransferDialog(true);
        }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <Icon name="CreditCard" size={24} className="text-green-600" />
            </div>
            <div>
              <p className="font-semibold">По номеру карты</p>
              <p className="text-sm text-muted-foreground">Перевод в другой банк</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowPaymentDialog(true)}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Icon name="Receipt" size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">Оплата услуг</p>
              <p className="text-sm text-muted-foreground">МТС, Билайн, Дом.ру и другие</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAssistant = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Умный ассистент Банк-Бонг</h2>
      
      <div className="grid gap-3">
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
          setAssistantMode('chat');
          setShowAssistantDialog(true);
        }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="MessageCircle" size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold">Написать в чат</p>
              <p className="text-sm text-muted-foreground">Задайте вопрос Банк-Бонгу</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
          setAssistantMode('call');
          setShowAssistantDialog(true);
        }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <Icon name="Phone" size={24} className="text-green-600" />
            </div>
            <div>
              <p className="font-semibold">Позвонить</p>
              <p className="text-sm text-muted-foreground">Голосовая поддержка 24/7</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="text-center">
          <Icon name="Bot" size={64} className="mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Банк-Бонг</h3>
          <p className="text-muted-foreground">
            Ваш персональный помощник готов помочь с переводами, платежами, кредитами и любыми вопросами по банковским операциям.
          </p>
        </div>
      </Card>
    </div>
  );

  const renderFriends = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Друзья и семья</h2>
        <Button onClick={() => setShowFriendDialog(true)}>
          <Icon name="UserPlus" size={20} className="mr-2" />
          Добавить
        </Button>
      </div>

      {friends.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="Users" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Нет друзей</h3>
          <p className="text-muted-foreground mb-6">Добавьте друзей и членов семьи для быстрых переводов</p>
          <Button onClick={() => setShowFriendDialog(true)} size="lg">
            Добавить друга
          </Button>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Семья</h3>
            {friends.filter(f => f.isFamilyMember).length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Нет членов семьи</p>
            ) : (
              friends.filter(f => f.isFamilyMember).map((friend) => (
                <Card key={friend.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold">
                        {friend.firstName[0]}{friend.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{friend.firstName} {friend.lastName}</p>
                        <p className="text-sm text-muted-foreground">{friend.phone}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => {
                      setTransferType('phone');
                      setTransferPhone(friend.phone);
                      setShowTransferDialog(true);
                    }}>
                      Перевести
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Друзья</h3>
            {friends.filter(f => !f.isFamilyMember).length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Нет друзей</p>
            ) : (
              friends.filter(f => !f.isFamilyMember).map((friend) => (
                <Card key={friend.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {friend.firstName[0]}{friend.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{friend.firstName} {friend.lastName}</p>
                        <p className="text-sm text-muted-foreground">{friend.phone}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => {
                      setTransferType('phone');
                      setTransferPhone(friend.phone);
                      setShowTransferDialog(true);
                    }}>
                      Перевести
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderMore = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Ещё</h2>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Управление</h3>
        
        {!user?.isPremium && (
          <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200" onClick={() => setShowPremiumDialog(true)}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                <Icon name="Crown" size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Премиум Юган</p>
                <p className="text-sm text-muted-foreground">Получить больше возможностей</p>
              </div>
              <Icon name="ChevronRight" size={20} />
            </div>
          </Card>
        )}

        {user?.isPremium && (
          <Card className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                <Icon name="Crown" size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Премиум активен</p>
                <p className="text-sm text-muted-foreground">
                  До {user.premiumExpiresAt?.toLocaleDateString('ru-RU')}
                </p>
              </div>
              <Badge className="bg-yellow-400 text-yellow-900">Активен</Badge>
            </div>
          </Card>
        )}

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowCreditDialog(true)}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Icon name="Wallet" size={24} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Кредиты</p>
              <p className="text-sm text-muted-foreground">
                {user?.isPremium ? 'Безлимитные кредиты' : 'До 100,000₽'}
              </p>
            </div>
            <Icon name="ChevronRight" size={20} />
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentPage('friends')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Icon name="Users" size={24} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Семья и друзья</p>
              <p className="text-sm text-muted-foreground">Управление контактами</p>
            </div>
            <Icon name="ChevronRight" size={20} />
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
          setAssistantMode('chat');
          setShowAssistantDialog(true);
        }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <Icon name="Settings" size={24} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Настройки ассистента</p>
              <p className="text-sm text-muted-foreground">Персонализация Банк-Бонг</p>
            </div>
            <Icon name="ChevronRight" size={20} />
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={handleResetAccount}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
              <Icon name="RotateCcw" size={24} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Сброс аккаунта</p>
              <p className="text-sm text-muted-foreground">Удалить все карты и данные</p>
            </div>
            <Icon name="ChevronRight" size={20} />
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={handleLogout}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
              <Icon name="LogOut" size={24} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Выход</p>
              <p className="text-sm text-muted-foreground">Выйти из аккаунта</p>
            </div>
            <Icon name="ChevronRight" size={20} />
          </div>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'home': return renderHome();
      case 'cards': return renderCards();
      case 'transfers': return renderTransfers();
      case 'assistant': return renderAssistant();
      case 'friends': return renderFriends();
      case 'more': return renderMore();
      default: return renderHome();
    }
  };

  const navItems = [
    { id: 'home' as Page, icon: 'Home', label: 'Главная' },
    { id: 'cards' as Page, icon: 'CreditCard', label: 'Карты' },
    { id: 'transfers' as Page, icon: 'ArrowRightLeft', label: 'Переводы' },
    { id: 'assistant' as Page, icon: 'Bot', label: 'Ассистент' },
    { id: 'more' as Page, icon: 'Menu', label: 'Ещё' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-r from-primary to-primary/90 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon name="Building2" size={24} />
            </div>
            <h1 className="text-xl font-bold">Юган Банк</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Icon name="Bell" size={20} />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {renderContent()}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                currentPage === item.id 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Icon name={item.icon as any} size={20} />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={showNewCardDialog} onOpenChange={setShowNewCardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новую карту</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название карты</Label>
              <Input
                placeholder="Моя карта"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
              />
            </div>
            <div>
              <Label>Тип карты</Label>
              <Select value={newCardType} onValueChange={(v) => setNewCardType(v as CardType['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit-child">Детская дебетовая</SelectItem>
                  <SelectItem value="debit-youth">Молодёжная дебетовая</SelectItem>
                  <SelectItem value="credit">Кредитная</SelectItem>
                  <SelectItem value="sticker">Стикер</SelectItem>
                  <SelectItem value="other">Другая</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Формат карты</Label>
              <Select value={newCardFormat} onValueChange={(v) => setNewCardFormat(v as CardType['format'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virtual">Виртуальная</SelectItem>
                  <SelectItem value="plastic">Пластиковая</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg text-sm">
              <p className="text-muted-foreground">
                Платёжная система выбирается автоматически. {user?.isPremium ? `Осталось ${maxCards - cards.length} карт` : `Лимит: ${cards.length}/${maxCards} карт`}
              </p>
            </div>
            <Button onClick={handleCreateCard} className="w-full">
              Создать карту
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCardActionsDialog} onOpenChange={setShowCardActionsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCard?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => {
                setShowCardActionsDialog(false);
                setTimeout(() => setShowCardDetailDialog(true), 100);
              }}
            >
              <Icon name="Eye" size={20} className="mr-2" />
              Посмотреть детали карты
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleBlockCard}>
              <Icon name={selectedCard?.isBlocked ? "Unlock" : "Lock"} size={20} className="mr-2" />
              {selectedCard?.isBlocked ? 'Разблокировать карту' : 'Заблокировать карту'}
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleRenameCard}>
              <Icon name="Edit" size={20} className="mr-2" />
              Переименовать
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => {
              setCardDailyLimit(selectedCard?.dailyLimit?.toString() || '50000');
              setCardMonthlyLimit(selectedCard?.monthlyLimit?.toString() || '300000');
              setShowCardActionsDialog(false);
              setShowCardLimitsDialog(true);
            }}>
              <Icon name="Shield" size={20} className="mr-2" />
              Настроить лимиты
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Icon name="Settings" size={20} className="mr-2" />
              Настройки карты
            </Button>
            <Button 
              variant="destructive" 
              className="w-full justify-start" 
              onClick={() => selectedCard && handleDeleteCard(selectedCard.id)}
            >
              <Icon name="Trash2" size={20} className="mr-2" />
              Удалить карту
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CardDetailDialog 
        card={selectedCard}
        open={showCardDetailDialog}
        onClose={() => setShowCardDetailDialog(false)}
      />

      <Dialog open={showCardLimitsDialog} onOpenChange={setShowCardLimitsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настройка лимитов</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Дневной лимит (₽)</Label>
              <Input
                type="number"
                placeholder="50000"
                value={cardDailyLimit}
                onChange={(e) => setCardDailyLimit(e.target.value)}
              />
            </div>
            <div>
              <Label>Месячный лимит (₽)</Label>
              <Input
                type="number"
                placeholder="300000"
                value={cardMonthlyLimit}
                onChange={(e) => setCardMonthlyLimit(e.target.value)}
              />
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Установите лимиты для контроля расходов. Операции сверх лимита будут отклонены.
              </p>
            </div>
            <Button onClick={handleSetCardLimits} className="w-full">
              Сохранить лимиты
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Оформление кредита</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Сумма кредита (₽)</Label>
              <Input
                type="number"
                placeholder="50000"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Карта для зачисления</Label>
              <Select value={creditCard} onValueChange={setCreditCard}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите карту" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name} ({formatCardNumberDisplay(card.cardNumber).slice(0, 19)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {user?.isPremium 
                  ? '🎉 Премиум: Безлимитные кредиты без ограничений!' 
                  : `Максимальная сумма: ${maxCreditAmount.toLocaleString('ru-RU')}₽`}
              </p>
            </div>
            <Button onClick={handleCreditRequest} className="w-full">
              Получить кредит
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Crown" className="text-yellow-500" />
              Премиум Юган
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Icon name="Crown" size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Откройте больше возможностей</h3>
              <p className="text-muted-foreground">Получите эксклюзивные привилегии</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="Check" size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">До 10 карт</p>
                  <p className="text-sm text-muted-foreground">Создавайте до 10 карт одновременно</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="Check" size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Безлимитные кредиты</p>
                  <p className="text-sm text-muted-foreground">Получайте любую сумму без ограничений</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="Check" size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Расширенные настройки</p>
                  <p className="text-sm text-muted-foreground">Персональные лимиты и дополнительные опции</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="Check" size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Приоритетная поддержка</p>
                  <p className="text-sm text-muted-foreground">Быстрый ответ от Банк-Бонг</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-center text-sm mb-2">
                <span className="font-bold text-2xl">БЕСПЛАТНО</span>
              </p>
              <p className="text-center text-xs text-muted-foreground">Пробная версия на 1 месяц</p>
            </div>

            <Button onClick={handleActivatePremium} className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white" size="lg">
              Активировать Премиум
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Перевод средств</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs value={transferType} onValueChange={(v) => setTransferType(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="own">Между своими</TabsTrigger>
                <TabsTrigger value="phone">По телефону</TabsTrigger>
                <TabsTrigger value="card">По карте</TabsTrigger>
              </TabsList>

              <TabsContent value="own" className="space-y-4 mt-4">
                <div>
                  <Label>С карты</Label>
                  <Select value={transferFromCard} onValueChange={setTransferFromCard}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите карту" />
                    </SelectTrigger>
                    <SelectContent>
                      {cards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.name} - {card.balance.toLocaleString('ru-RU')} ₽
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>На карту</Label>
                  <Select value={transferToCard} onValueChange={setTransferToCard}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите карту" />
                    </SelectTrigger>
                    <SelectContent>
                      {cards.filter(c => c.id !== transferFromCard).map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4 mt-4">
                <div>
                  <Label>С карты</Label>
                  <Select value={transferFromCard} onValueChange={setTransferFromCard}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите карту" />
                    </SelectTrigger>
                    <SelectContent>
                      {cards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.name} - {card.balance.toLocaleString('ru-RU')} ₽
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Номер телефона получателя</Label>
                  <Input
                    type="tel"
                    placeholder="+7 (999) 999-99-99"
                    value={transferPhone}
                    onChange={(e) => setTransferPhone(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="card" className="space-y-4 mt-4">
                <div>
                  <Label>С карты</Label>
                  <Select value={transferFromCard} onValueChange={setTransferFromCard}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите карту" />
                    </SelectTrigger>
                    <SelectContent>
                      {cards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.name} - {card.balance.toLocaleString('ru-RU')} ₽
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Номер карты получателя</Label>
                  <Input
                    placeholder="0000 0000 0000 0000"
                    value={transferCardNumber}
                    onChange={(e) => setTransferCardNumber(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div>
              <Label>Сумма перевода (₽)</Label>
              <Input
                type="number"
                placeholder="1000"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
            </div>

            <Button onClick={handleTransfer} className="w-full">
              Перевести
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Оплата услуг</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Выберите услугу</Label>
              <Select value={paymentService} onValueChange={setPaymentService}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите провайдера" />
                </SelectTrigger>
                <SelectContent>
                  {serviceProviders.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.icon} {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Номер счета / телефон</Label>
              <Input
                placeholder="9991234567"
                value={paymentAccount}
                onChange={(e) => setPaymentAccount(e.target.value)}
              />
            </div>
            <div>
              <Label>Сумма (₽)</Label>
              <Input
                type="number"
                placeholder="500"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Карта для оплаты</Label>
              <Select value={paymentCard} onValueChange={setPaymentCard}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите карту" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name} - {card.balance.toLocaleString('ru-RU')} ₽
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handlePayment} className="w-full">
              Оплатить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFriendDialog} onOpenChange={setShowFriendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить друга</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Номер телефона</Label>
              <Input
                type="tel"
                placeholder="+7 (999) 999-99-99"
                value={friendPhone}
                onChange={(e) => setFriendPhone(e.target.value)}
              />
            </div>
            <div>
              <Label>Имя</Label>
              <Input
                placeholder="Иван"
                value={friendFirstName}
                onChange={(e) => setFriendFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label>Фамилия</Label>
              <Input
                placeholder="Иванов"
                value={friendLastName}
                onChange={(e) => setFriendLastName(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="family"
                checked={friendIsFamily}
                onCheckedChange={setFriendIsFamily}
              />
              <Label htmlFor="family" className="cursor-pointer">
                Добавить в семью (полный доступ)
              </Label>
            </div>
            <Button onClick={handleAddFriend} className="w-full">
              Добавить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssistantDialog} onOpenChange={setShowAssistantDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Банк-Бонг - Ваш помощник</DialogTitle>
          </DialogHeader>

          <Tabs value={assistantMode} onValueChange={(v) => setAssistantMode(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">
                <Icon name="MessageCircle" size={16} className="mr-2" />
                Чат
              </TabsTrigger>
              <TabsTrigger value="call">
                <Icon name="Phone" size={16} className="mr-2" />
                Звонок
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <ScrollArea className="h-96 border rounded-lg p-4">
                <div className="space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-muted'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder="Напишите сообщение..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="call" className="space-y-4">
              <div className="flex flex-col items-center justify-center py-12">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
                  isCallActive ? 'bg-green-500 animate-pulse' : 'bg-muted'
                }`}>
                  <Icon name="Bot" size={64} className={isCallActive ? 'text-white' : 'text-muted-foreground'} />
                </div>

                <h3 className="text-2xl font-bold mb-2">Банк-Бонг</h3>
                <p className="text-muted-foreground mb-6">
                  {isCallActive ? `Звонок идёт: ${formatCallDuration(callDuration)}` : 'Голосовой помощник'}
                </p>

                {!isCallActive ? (
                  <Button size="lg" onClick={handleStartCall} className="w-48">
                    <Icon name="Phone" size={20} className="mr-2" />
                    Позвонить
                  </Button>
                ) : (
                  <Button size="lg" variant="destructive" onClick={handleEndCall} className="w-48">
                    <Icon name="PhoneOff" size={20} className="mr-2" />
                    Завершить
                  </Button>
                )}

                {isCallActive && (
                  <div className="mt-8 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Банк-Бонг слушает вас...</p>
                    <div className="flex gap-2 justify-center">
                      <div className="w-2 h-8 bg-primary rounded animate-pulse" style={{animationDelay: '0s'}} />
                      <div className="w-2 h-12 bg-primary rounded animate-pulse" style={{animationDelay: '0.1s'}} />
                      <div className="w-2 h-6 bg-primary rounded animate-pulse" style={{animationDelay: '0.2s'}} />
                      <div className="w-2 h-10 bg-primary rounded animate-pulse" style={{animationDelay: '0.3s'}} />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
