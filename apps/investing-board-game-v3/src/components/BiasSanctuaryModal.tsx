import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Brain, CaretDown, CheckCircle, XCircle, Lightbulb } from '@phosphor-icons/react'
import { BiasCaseStudy } from '@/lib/types'
import { CelebrationEffect } from '@/components/CelebrationEffect'

interface BiasSanctuaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseStudy: BiasCaseStudy | null
  onComplete: (correct: number, total: number) => void
}

export function BiasSanctuaryModal({
  open,
  onOpenChange,
  caseStudy,
  onComplete,
}: BiasSanctuaryModalProps) {
  const [showCard, setShowCard] = useState(true)
  const [contextExpanded, setContextExpanded] = useState<number[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({})
  const [quizComplete, setQuizComplete] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  if (!caseStudy) return null

  const currentQuestion = caseStudy.quiz[currentQuestionIndex]
  const totalQuestions = caseStudy.quiz.length
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerIndex }))
    setShowExplanation((prev) => ({ ...prev, [questionId]: true }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate score
      const correct = caseStudy.quiz.filter(
        (q) => selectedAnswers[q.id] === q.correctAnswer
      ).length
      setQuizComplete(true)
      setShowCelebration(true)
      onComplete(correct, totalQuestions)
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handleRestart = () => {
    setShowCard(true)
    setContextExpanded([])
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setShowExplanation({})
    setQuizComplete(false)
    setShowCelebration(false)
  }

  const toggleContext = (index: number) => {
    setContextExpanded((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const correctAnswers = caseStudy.quiz.filter(
    (q) => selectedAnswers[q.id] === q.correctAnswer
  ).length

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
        if (!isOpen) {
          // Reset state when modal closes
          setTimeout(handleRestart, 300)
        }
      }}
    >
      <CelebrationEffect show={showCelebration} onComplete={() => setShowCelebration(false)} />
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto bg-card border-2 border-accent/50 shadow-[0_0_60px_oklch(0.75_0.15_85_/_0.4)]">
        <AnimatePresence mode="wait">
          {showCard ? (
            <motion.div
              key="card"
              initial={{ scale: 0, rotate: 360, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 15,
                duration: 0.8,
              }}
            >
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-lg bg-accent/20">
                    <Brain size={32} className="text-accent" weight="fill" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold text-accent">
                      Bias Sanctuary
                    </DialogTitle>
                    <DialogDescription className="text-sm text-foreground/80">
                      Recognize cognitive biases to improve decision-making
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Card className="p-5 bg-background/50 border-2 border-accent/30 mt-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Lightbulb size={24} className="text-accent" weight="fill" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground mb-1">
                      {caseStudy.title}
                    </h3>
                    <p className="text-xs text-accent font-semibold uppercase tracking-wider">
                      {caseStudy.biasType}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {caseStudy.description}
                </p>

                <Separator className="my-4" />

                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-foreground mb-2">
                    Case Study Scenario
                  </h4>
                  <div className="p-3 bg-card/50 rounded-lg border border-accent/20">
                    <p className="text-sm text-foreground/90 italic">
                      {caseStudy.scenario}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground mb-2">
                    Learn More
                  </h4>
                  {caseStudy.context.map((ctx, index) => (
                    <Collapsible key={index} open={contextExpanded.includes(index)}>
                      <CollapsibleTrigger
                        onClick={() => toggleContext(index)}
                        className="flex items-center justify-between w-full p-3 bg-background/30 hover:bg-background/50 rounded-lg border border-border transition-colors text-left"
                      >
                        <span className="text-sm font-medium text-foreground">
                          Key Insight {index + 1}
                        </span>
                        <CaretDown
                          size={16}
                          className={`text-muted-foreground transition-transform ${
                            contextExpanded.includes(index) ? 'rotate-180' : ''
                          }`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2">
                        <p className="text-sm text-muted-foreground pl-3 pr-3 pb-2">
                          {ctx}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </Card>

              <Button
                onClick={() => setShowCard(false)}
                className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
              >
                Take the Quiz
              </Button>
            </motion.div>
          ) : quizComplete ? (
            <motion.div
              key="complete"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-accent text-center">
                  Quiz Complete!
                </DialogTitle>
              </DialogHeader>

              <Card className="p-6 bg-background/50 border-2 border-accent/30 mt-4 text-center">
                <div className="mb-4">
                  <div className="text-5xl font-bold text-accent mb-2">
                    {correctAnswers}/{totalQuestions}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {correctAnswers === totalQuestions
                      ? 'Perfect score! You understand this bias well.'
                      : correctAnswers >= totalQuestions / 2
                      ? 'Good job! Keep learning about cognitive biases.'
                      : 'Review the case study to deepen your understanding.'}
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
                  <p className="text-sm text-foreground/90 font-medium mb-2">
                    Remember: {caseStudy.biasType}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {caseStudy.description}
                  </p>
                </div>
              </Card>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="flex-1"
                >
                  Review Case Study
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Continue Game
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-accent">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4">
                <div className="mb-4">
                  <p className="text-base font-semibold text-foreground mb-4">
                    {currentQuestion.question}
                  </p>

                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedAnswers[currentQuestion.id] === index
                      const isCorrect = index === currentQuestion.correctAnswer
                      const showResult = showExplanation[currentQuestion.id]

                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                          disabled={showResult}
                          className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                            !showResult
                              ? 'border-border hover:border-accent/50 bg-background/30 hover:bg-background/50'
                              : isSelected && isCorrect
                              ? 'border-green-500 bg-green-500/10'
                              : isSelected && !isCorrect
                              ? 'border-red-500 bg-red-500/10'
                              : isCorrect
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-border bg-background/30 opacity-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex-1 text-sm text-foreground">
                              {option}
                            </span>
                            {showResult && isSelected && isCorrect && (
                              <CheckCircle size={20} className="text-green-500" weight="fill" />
                            )}
                            {showResult && isSelected && !isCorrect && (
                              <XCircle size={20} className="text-red-500" weight="fill" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {showExplanation[currentQuestion.id] && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-4 bg-accent/10 border-2 border-accent/30">
                      <div className="flex items-start gap-2">
                        <Lightbulb size={20} className="text-accent mt-0.5" weight="fill" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">
                            Explanation
                          </p>
                          <p className="text-sm text-foreground/90">
                            {currentQuestion.explanation}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => setShowCard(true)}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Case Study
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!showExplanation[currentQuestion.id]}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50"
                >
                  {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
