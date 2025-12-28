import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type User = {
  phone: string;
  firstName: string;
  lastName: string;
  middleName: string;
};

type CardType = {
  id: string;
  name: string;
  type: 'debit-child' | 'debit-youth' | 'credit' | 'sticker' | 'other';
  format: 'virtual' | 'plastic';
  balance: number;
  cardNumber: string;
  color: string;
};

type Page = 'home' | 'cards' | 'credits' | 'transfers' | 'assistant' | 'profile';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [cards, setCards] = useState<CardType[]>([]);
  const [showNewCardDialog, setShowNewCardDialog] = useState(false);
  const [showCardActionsDialog, setShowCardActionsDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [showCreditDialog, setShowCreditDialog] = useState(false);

  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');

  const [newCardType, setNewCardType] = useState<CardType['type']>('debit-child');
  const [newCardFormat, setNewCardFormat] = useState<CardType['format']>('virtual');
  const [newCardName, setNewCardName] = useState('');

  const [creditAmount, setCreditAmount] = useState('');
  const [creditCard, setCreditCard] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !firstName || !lastName) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    setUser({ phone, firstName, lastName, middleName });
    setIsAuthenticated(true);
    toast.success('Добро пожаловать в Юган Банк!');
  };

  const handleCreateCard = () => {
    if (!newCardName) {
      toast.error('Введите название карты');
      return;
    }

    const colors = {
      'debit-child': 'from-pink-400 to-purple-400',
      'debit-youth': 'from-blue-400 to-cyan-400',
      'credit': 'from-amber-400 to-orange-400',
      'sticker': 'from-green-400 to-emerald-400',
      'other': 'from-gray-400 to-slate-400',
    };

    const newCard: CardType = {
      id: Date.now().toString(),
      name: newCardName,
      type: newCardType,
      format: newCardFormat,
      balance: 0,
      cardNumber: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
      color: colors[newCardType],
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
    toast.success('Карта заблокирована');
    setShowCardActionsDialog(false);
  };

  const handleRenameCard = () => {
    const newName = prompt('Введите новое название карты:');
    if (newName && selectedCard) {
      setCards(cards.map(c => c.id === selectedCard.id ? { ...c, name: newName } : c));
      toast.success('Карта переименована');
      setShowCardActionsDialog(false);
    }
  };

  const handleCreditRequest = () => {
    if (!creditAmount || !creditCard) {
      toast.error('Заполните все поля');
      return;
    }

    const amount = parseFloat(creditAmount);
    setCards(cards.map(c => 
      c.id === creditCard 
        ? { ...c, balance: c.balance + amount }
        : c
    ));

    setShowCreditDialog(false);
    setCreditAmount('');
    toast.success(`Кредит ${amount.toLocaleString('ru-RU')} ₽ одобрен и зачислен!`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCards([]);
    setCurrentPage('home');
    toast.success('Вы вышли из аккаунта');
  };

  const handleResetAccount = () => {
    if (confirm('Вы уверены, что хотите сбросить аккаунт? Все карты будут удалены.')) {
      setCards([]);
      toast.success('Аккаунт сброшен');
    }
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
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white">
        <p className="text-sm opacity-90 mb-1">Добро пожаловать</p>
        <h2 className="text-2xl font-bold mb-4">{user?.firstName} {user?.lastName}</h2>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <p className="text-sm opacity-90 mb-1">Общий баланс</p>
          <p className="text-3xl font-bold">
            {cards.reduce((sum, card) => sum + card.balance, 0).toLocaleString('ru-RU')} ₽
          </p>
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

        {cards.length === 0 ? (
          <Card className="p-8 text-center">
            <Icon name="CreditCard" size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">У вас пока нет карт</p>
            <Button onClick={() => setShowNewCardDialog(true)} className="mt-4">
              Создать первую карту
            </Button>
          </Card>
        ) : (
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
                    <div>
                      <p className="font-semibold">{card.name}</p>
                      <p className="text-sm text-muted-foreground">{card.cardNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{card.balance.toLocaleString('ru-RU')} ₽</p>
                      <Badge variant="secondary" className="mt-1">
                        {card.format === 'virtual' ? 'Виртуальная' : 'Пластиковая'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-20 flex-col" onClick={() => setCurrentPage('transfers')}>
          <Icon name="Send" size={24} className="mb-2" />
          <span className="text-sm">Переводы</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col" onClick={() => setCurrentPage('credits')}>
          <Icon name="Wallet" size={24} className="mb-2" />
          <span className="text-sm">Кредиты</span>
        </Button>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Мои карты</h2>
        <Button onClick={() => setShowNewCardDialog(true)}>
          <Icon name="Plus" size={20} className="mr-2" />
          Создать карту
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
                setShowCardActionsDialog(true);
              }}
            >
              <div className={`h-40 bg-gradient-to-br ${card.color} p-6 text-white`}>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-sm opacity-90">Юган Банк</p>
                    <p className="font-semibold mt-1">{card.name}</p>
                  </div>
                  <Badge className="bg-white/20 text-white border-0">
                    {card.format === 'virtual' ? 'Виртуальная' : 'Пластиковая'}
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-mono mb-2">{card.cardNumber}</p>
                  <p className="text-sm opacity-90">Баланс: {card.balance.toLocaleString('ru-RU')} ₽</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCredits = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Кредиты</h2>
      
      <Card className="p-6">
        <div className="text-center mb-6">
          <Icon name="TrendingUp" size={48} className="mx-auto mb-3 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Оформить кредит</h3>
          <p className="text-muted-foreground">Получите средства моментально без процентов</p>
        </div>

        <Button 
          onClick={() => setShowCreditDialog(true)} 
          className="w-full" 
          size="lg"
          disabled={cards.length === 0}
        >
          {cards.length === 0 ? 'Создайте карту для получения кредита' : 'Оформить кредит'}
        </Button>
      </Card>
    </div>
  );

  const renderTransfers = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Переводы</h2>
      
      <Card className="p-8 text-center">
        <Icon name="Send" size={48} className="mx-auto mb-3 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Переводы средств</h3>
        <p className="text-muted-foreground">Функционал в разработке</p>
      </Card>
    </div>
  );

  const renderAssistant = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Умный ассистент</h2>
      
      <Card className="p-8 text-center">
        <Icon name="Bot" size={48} className="mx-auto mb-3 text-primary" />
        <h3 className="text-xl font-semibold mb-2">Ваш помощник</h3>
        <p className="text-muted-foreground mb-4">Задайте вопрос или получите помощь по переводам и другим операциям</p>
        <Button>Начать диалог</Button>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Профиль</h2>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.firstName[0]}{user?.lastName[0]}
          </div>
          <div>
            <p className="font-semibold text-lg">{user?.lastName} {user?.firstName} {user?.middleName}</p>
            <p className="text-muted-foreground">{user?.phone}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={handleResetAccount}>
            <Icon name="RotateCcw" size={20} className="mr-2" />
            Сброс аккаунта
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Icon name="Settings" size={20} className="mr-2" />
            Настройки ассистента
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Icon name="Baby" size={20} className="mr-2" />
            Детский режим
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Icon name="HelpCircle" size={20} className="mr-2" />
            Поддержка
          </Button>
          <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
            <Icon name="LogOut" size={20} className="mr-2" />
            Выход из аккаунта
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'home': return renderHome();
      case 'cards': return renderCards();
      case 'credits': return renderCredits();
      case 'transfers': return renderTransfers();
      case 'assistant': return renderAssistant();
      case 'profile': return renderProfile();
      default: return renderHome();
    }
  };

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
          {[
            { id: 'home', icon: 'Home', label: 'Главная' },
            { id: 'cards', icon: 'CreditCard', label: 'Карты' },
            { id: 'credits', icon: 'Wallet', label: 'Кредиты' },
            { id: 'transfers', icon: 'Send', label: 'Переводы' },
            { id: 'assistant', icon: 'Bot', label: 'Ассистент' },
            { id: 'profile', icon: 'User', label: 'Профиль' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id as Page)}
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
            <Button variant="outline" className="w-full justify-start" onClick={handleBlockCard}>
              <Icon name="Lock" size={20} className="mr-2" />
              Заблокировать карту
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleRenameCard}>
              <Icon name="Edit" size={20} className="mr-2" />
              Переименовать
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
                      {card.name} ({card.cardNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Кредит будет зачислен моментально. Без процентов и обязательных платежей.
              </p>
            </div>
            <Button onClick={handleCreditRequest} className="w-full">
              Получить кредит
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
