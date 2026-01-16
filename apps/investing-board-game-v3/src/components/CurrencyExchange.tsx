import React, { useState } from 'react'
import { X, ArrowLeftRight } from 'lucide-react'
import { GameState } from '@/lib/types'
import { 
  CurrencyType, 
  CURRENCIES, 
  calculateExchange, 
  formatCurrency,
  EXCHANGE_FEE 
} from '@/lib/currencyConfig'

interface CurrencyExchangeProps {
  isOpen: boolean
  onClose: () => void
  gameState: GameState
  onExchange: (fromCurrency: CurrencyType, toCurrency: CurrencyType, fromAmount: number, toAmount: number) => void
}

export function CurrencyExchange({ isOpen, onClose, gameState, onExchange }: CurrencyExchangeProps) {
  const [fromCurrency, setFromCurrency] = useState<CurrencyType>('coins')
  const [toCurrency, setToCurrency] = useState<CurrencyType>('stars')
  const [amount, setAmount] = useState<string>('')

  if (!isOpen) return null

  const getBalance = (currency: CurrencyType): number => {
    switch (currency) {
      case 'cash': return gameState.cash
      case 'stars': return gameState.stars
      case 'coins': return gameState.coins
    }
  }

  const exchangeResult = calculateExchange(
    fromCurrency,
    toCurrency,
    Number(amount) || 0
  )

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    setAmount('')
  }

  const handleMaxAmount = () => {
    setAmount(getBalance(fromCurrency).toString())
  }

  const handleExchange = () => {
    if (!exchangeResult.isValid) return
    
    const fromAmount = Number(amount)
    const toAmount = exchangeResult.toAmount
    
    onExchange(fromCurrency, toCurrency, fromAmount, toAmount)
    setAmount('')
    onClose()
  }

  const CurrencyButton = ({ 
    currency, 
    isSelected, 
    onClick 
  }: { 
    currency: CurrencyType
    isSelected: boolean
    onClick: () => void 
  }) => {
    const config = CURRENCIES[currency]
    const balance = getBalance(currency)
    
    return (
      <button
        onClick={onClick}
        className={`
          w-full p-4 rounded-xl border-2 transition-all
          ${isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-white hover:border-gray-400'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{config.emoji}</span>
            <div className="text-left">
              <div className="font-semibold text-lg">{config.name}</div>
              <div className="text-sm text-gray-600">
                Balance: {formatCurrency(currency, balance)}
              </div>
            </div>
          </div>
          {isSelected && (
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          )}
        </div>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold">Currency Exchange</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* From Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="space-y-2">
              {(['coins', 'stars', 'cash'] as CurrencyType[]).map(currency => (
                <CurrencyButton
                  key={currency}
                  currency={currency}
                  isSelected={fromCurrency === currency}
                  onClick={() => setFromCurrency(currency)}
                />
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <button
                onClick={handleMaxAmount}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                MAX
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-4 text-2xl font-semibold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
            {amount && !exchangeResult.isValid && exchangeResult.error && (
              <p className="text-red-600 text-sm mt-2">{exchangeResult.error}</p>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="p-4 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              <ArrowLeftRight className="w-6 h-6 text-blue-600" />
            </button>
          </div>

          {/* To Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="space-y-2">
              {(['coins', 'stars', 'cash'] as CurrencyType[]).filter(c => c !== fromCurrency).map(currency => (
                <CurrencyButton
                  key={currency}
                  currency={currency}
                  isSelected={toCurrency === currency}
                  onClick={() => setToCurrency(currency)}
                />
              ))}
            </div>
          </div>

          {/* Exchange Info */}
          {amount && exchangeResult.isValid && (
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">You send:</span>
                <span className="font-semibold">
                  {formatCurrency(fromCurrency, Number(amount))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fee ({(EXCHANGE_FEE * 100).toFixed(0)}%):</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(toCurrency, exchangeResult.fee)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-blue-200 pt-2">
                <span>You receive:</span>
                <span className="text-green-600">
                  {formatCurrency(toCurrency, exchangeResult.toAmount)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Rate:</span>
                <span>1 {CURRENCIES[fromCurrency].name} = {exchangeResult.rate} {CURRENCIES[toCurrency].name}</span>
              </div>
            </div>
          )}

          {/* Exchange Button */}
          <button
            onClick={handleExchange}
            disabled={!amount || !exchangeResult.isValid || getBalance(fromCurrency) < Number(amount)}
            className={`
              w-full py-4 rounded-xl font-bold text-lg transition-all
              ${!amount || !exchangeResult.isValid || getBalance(fromCurrency) < Number(amount)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg'
              }
            `}
          >
            {getBalance(fromCurrency) < Number(amount) 
              ? 'Insufficient Balance'
              : 'Exchange Now'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
