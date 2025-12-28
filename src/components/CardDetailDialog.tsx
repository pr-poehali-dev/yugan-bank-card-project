import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { CardType } from '@/types';
import { formatCardNumberDisplay, getPaymentSystemName } from '@/utils/cardGenerator';
import { toast } from 'sonner';

interface CardDetailDialogProps {
  card: CardType | null;
  open: boolean;
  onClose: () => void;
}

const CardDetailDialog = ({ card, open, onClose }: CardDetailDialogProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!card) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} скопирован`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Детали карты</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div 
            className="relative h-56 cursor-pointer perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div 
              className={`w-full h-full transition-transform duration-500 transform-style-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              <div className={`absolute w-full h-full bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-2xl backface-hidden`}>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-sm opacity-90">Юган Банк</p>
                    <p className="font-semibold mt-1">{card.name}</p>
                  </div>
                  <Badge className="bg-white/20 text-white border-0">
                    {getPaymentSystemName(card.paymentSystem)}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <p className="text-2xl font-mono tracking-wider mb-2">
                    {formatCardNumberDisplay(card.cardNumber)}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-75 mb-1">Срок действия</p>
                    <p className="font-mono">{card.expiryMonth}/{card.expiryYear}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-75 mb-1">Баланс</p>
                    <p className="text-xl font-bold">{card.balance.toLocaleString('ru-RU')} ₽</p>
                  </div>
                </div>
              </div>

              <div className={`absolute w-full h-full bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-2xl backface-hidden rotate-y-180`}>
                <div className="h-12 bg-black/40 -mx-6 mt-4 mb-8"></div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm opacity-75 mb-1">CVV код</p>
                    <p className="text-2xl font-mono bg-white/20 px-4 py-2 rounded inline-block">{card.cvv}</p>
                  </div>
                  
                  <div className="text-xs opacity-75">
                    <p>Для безопасности не сообщайте CVV код третьим лицам</p>
                  </div>
                </div>

                <div className="absolute bottom-6 right-6">
                  <Icon name="CreditCard" size={48} className="opacity-20" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg text-sm text-center">
            <Icon name="MousePointerClick" size={16} className="inline mr-2" />
            Нажмите на карту, чтобы перевернуть
          </div>

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => copyToClipboard(card.cardNumber, 'Номер карты')}
            >
              <Icon name="Copy" size={20} className="mr-2" />
              Скопировать номер карты
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => copyToClipboard(card.cvv, 'CVV код')}
            >
              <Icon name="Shield" size={20} className="mr-2" />
              Скопировать CVV
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => copyToClipboard(`${card.expiryMonth}/${card.expiryYear}`, 'Срок действия')}
            >
              <Icon name="Calendar" size={20} className="mr-2" />
              Скопировать срок действия
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailDialog;
