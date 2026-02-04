import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Brain, CaretDown, CheckCircle, XCircle, Lightbulb, SpeakerSlash, SpeakerHigh } from '@phosphor-icons/react'
import { BiasCaseStudy } from '@/lib/types'
import { CelebrationEffect } from '@/components/CelebrationEffect'
import { useSound } from '@/hooks/useSound'

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
  const dialogClass = useResponsiveDialogClass('large')
  const [mode, setMode] = useState<'intro' | 'story' | 'quiz' | 'complete'>('intro')
  const [contextExpanded, setContextExpanded] = useState<number[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({})
  const [storyIndex, setStoryIndex] = useState(0)
  const [storyCompleted, setStoryCompleted] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [ambientPlayed, setAmbientPlayed] = useState(false)
  const { play: playSound, muted, toggleMute } = useSound()

  if (!caseStudy) return null

  const currentQuestion = caseStudy.quiz[currentQuestionIndex]
  const totalQuestions = caseStudy.quiz.length
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const story = caseStudy.story
  const storyPanels = story?.panels ?? []
  const hasStory = storyPanels.length > 0
  const storyPanelCount = storyPanels.length
  const isTakeawayPanel = storyIndex >= storyPanelCount
  const resolvedStoryMedia = useMemo(() => {
    if (!story?.assetManifest?.media) return {}
    return story.assetManifest.media
  }, [story])
  const storyBasePath = story?.assetManifest?.basePath ?? ''
  const storyAmbientAudio = story?.ambientAudio

  const currentStoryPanel = storyPanels[Math.min(storyIndex, Math.max(storyPanelCount - 1, 0))]
  const currentMedia = currentStoryPanel?.mediaKey
    ? resolvedStoryMedia[currentStoryPanel.mediaKey]
    : undefined
  const currentMediaSrc = currentMedia?.src ? `${storyBasePath}${currentMedia.src}` : undefined

  useEffect(() => {
    if (mode !== 'story' || !currentStoryPanel?.audioCue || muted) return
    playSound(currentStoryPanel.audioCue.sound)
  }, [currentStoryPanel, mode, muted, playSound])

  useEffect(() => {
    if (mode !== 'story') {
      if (ambientPlayed) setAmbientPlayed(false)
      return
    }
    if (!storyAmbientAudio || muted || ambientPlayed) return
    playSound(storyAmbientAudio.sound)
    setAmbientPlayed(true)
  }, [ambientPlayed, mode, muted, playSound, storyAmbientAudio])

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
      setMode('complete')
      setShowCelebration(true)
      onComplete(correct, totalQuestions)
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handleRestart = () => {
    setMode('intro')
    setContextExpanded([])
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setShowExplanation({})
    setStoryIndex(0)
    setStoryCompleted(false)
    setShowCelebration(false)
    setAmbientPlayed(false)
  }

  const toggleContext = (index: number) => {
    setContextExpanded((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const correctAnswers = caseStudy.quiz.filter(
    (q) => selectedAnswers[q.id] === q.correctAnswer
  ).length

  const storyToneClass = currentStoryPanel?.mood === 'warm'
    ? 'bg-amber-500/10 border-amber-500/30'
    : currentStoryPanel?.mood === 'cool'
    ? 'bg-sky-500/10 border-sky-500/30'
    : 'bg-background/40 border-border'

  const handleStartStory = () => {
    setMode('story')
  }

  const handleSkipStory = () => {
    setMode('quiz')
  }

  const handleStoryNext = () => {
    if (isTakeawayPanel) {
      setStoryCompleted(true)
      setMode('quiz')
    } else {
      setStoryIndex((prev) => Math.min(prev + 1, storyPanelCount))
    }
  }

  const handleStoryPrev = () => {
    setStoryIndex((prev) => Math.max(prev - 1, 0))
  }

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
      <DialogContent className={`${dialogClass} max-h-[85vh] overflow-y-auto bg-card border-2 border-accent/50 shadow-[0_0_60px_oklch(0.75_0.15_85_/_0.4)]`}>
        <AnimatePresence mode="wait">
          {mode === 'intro' ? (
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

              <div className="flex flex-col gap-3 mt-4">
                {hasStory ? (
                  <>
                    <Button
                      onClick={handleStartStory}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      size="lg"
                    >
                      Begin Story Mode
                    </Button>
                    <Button
                      onClick={handleSkipStory}
                      variant="outline"
                      className="w-full"
                    >
                      Skip Story, Take the Quiz
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setMode('quiz')}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    size="lg"
                  >
                    Take the Quiz
                  </Button>
                )}
              </div>
            </motion.div>
          ) : mode === 'story' ? (
            <motion.div
              key="story"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="text-xl font-bold text-accent">
                      {caseStudy.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-foreground/80">
                      Scroll through the story beats before the quiz.
                    </DialogDescription>
                    {storyAmbientAudio?.caption && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Ambient: {storyAmbientAudio.caption}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={toggleMute}
                    variant="ghost"
                    className="gap-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {muted ? <SpeakerSlash size={16} /> : <SpeakerHigh size={16} />}
                    {muted ? 'Audio muted' : 'Audio on'}
                  </Button>
                </div>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {isTakeawayPanel
                      ? 'Takeaway'
                      : `Panel ${storyIndex + 1} of ${storyPanelCount}`}
                  </span>
                  <span className="uppercase tracking-wider">{caseStudy.biasType}</span>
                </div>

                <div className="flex items-center gap-2">
                  {storyPanels.map((panel, index) => (
                    <span
                      key={panel.id}
                      className={`h-1 flex-1 rounded-full ${
                        index <= storyIndex ? 'bg-accent' : 'bg-border'
                      }`}
                    />
                  ))}
                  <span className={`h-1 w-6 rounded-full ${isTakeawayPanel ? 'bg-accent' : 'bg-border'}`} />
                </div>

                <motion.div
                  key={isTakeawayPanel ? 'takeaway' : currentStoryPanel?.id}
                  drag={isTakeawayPanel ? false : 'x'}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (isTakeawayPanel) return
                    if (info.offset.x < -80) handleStoryNext()
                    if (info.offset.x > 80) handleStoryPrev()
                  }}
                  className={`rounded-2xl border-2 p-4 ${storyToneClass}`}
                >
                  {isTakeawayPanel ? (
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                        {story?.badgeLabel ?? 'Story Complete'}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Takeaway</h3>
                      <p className="text-sm text-muted-foreground">{story?.takeaway}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {currentStoryPanel?.title}
                          </h3>
                          {currentStoryPanel?.decisionCue && (
                            <p className="text-xs font-semibold text-accent uppercase tracking-wider mt-1">
                              Decision Moment: {currentStoryPanel.decisionCue}
                            </p>
                          )}
                        </div>
                        {currentStoryPanel?.audioCue && (
                          <span className="text-[10px] text-muted-foreground">
                            {currentStoryPanel.audioCue.caption}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-3">
                        {currentMediaSrc ? (
                          currentMedia?.type === 'video' ? (
                            <video
                              className="w-full rounded-xl border border-border"
                              muted
                              playsInline
                              controls
                            >
                              <source src={currentMediaSrc} />
                            </video>
                          ) : (
                            <img
                              src={currentMediaSrc}
                              alt={currentMedia?.alt ?? 'Story panel'}
                              className="w-full rounded-xl border border-border object-cover"
                            />
                          )
                        ) : (
                          <div className="w-full rounded-xl border border-border bg-background/60 p-4 text-center text-xs text-muted-foreground">
                            Visual panel placeholder
                          </div>
                        )}
                        <p className="text-sm text-foreground/90">{currentStoryPanel?.text}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <div className="flex gap-3">
                  <Button
                    onClick={handleStoryPrev}
                    variant="outline"
                    className="flex-1"
                    disabled={storyIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleStoryNext}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {isTakeawayPanel ? 'Start Quiz' : storyIndex === storyPanelCount - 1 ? 'Takeaway' : 'Next'}
                  </Button>
                </div>
                <Button
                  onClick={handleSkipStory}
                  variant="ghost"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Skip story for now
                </Button>
              </div>
            </motion.div>
          ) : mode === 'complete' ? (
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
                {hasStory && !storyCompleted && (
                  <Button
                    onClick={() => setMode('story')}
                    variant="outline"
                    className="flex-1"
                  >
                    Resume Story
                  </Button>
                )}
                <Button
                  onClick={() => setMode('intro')}
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
