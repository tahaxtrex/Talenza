import { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { questions } from '@/data/candidates';

interface Props {
  scenarioText: string;
  answers: string[];
  setAnswers: (v: string[]) => void;
  currentQuestion: number;
  setCurrentQuestion: (v: number) => void;
  onComplete: () => void;
}

interface Message {
  type: 'ai' | 'user';
  text: string;
}

export default function ClarifyingState({
  scenarioText, answers, setAnswers, currentQuestion, setCurrentQuestion, onComplete
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(true);
  const [structuredFields, setStructuredFields] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fieldKeys = ['role_title', 'urgency_weeks', 'internal_candidates', 'priority_capability', 'hard_constraints'];
  const progress = (currentQuestion / 5) * 100;

  useEffect(() => {
    // Show first AI question after thinking
    const timer = setTimeout(() => {
      setIsThinking(false);
      setMessages([{ type: 'ai', text: questions[0] }]);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const answer = inputValue.trim();
    setInputValue('');

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

    const newMessages = [...messages, { type: 'user' as const, text: answer }];
    setMessages(newMessages);

    // Update structured field
    const newFields = { ...structuredFields };
    newFields[fieldKeys[currentQuestion]] = answer.slice(0, 40);
    setStructuredFields(newFields);

    const nextQ = currentQuestion + 1;
    setCurrentQuestion(nextQ);

    if (nextQ >= 5) {
      setTimeout(onComplete, 1000);
      return;
    }

    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      setMessages(prev => [...prev, { type: 'ai', text: questions[nextQ] }]);
    }, 1200);
  };

  return (
    <div className="animate-page-enter min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Context Summary */}
      <div className="lg:w-[40%] bg-surface border-b lg:border-b-0 lg:border-r border-brd p-6 lg:p-12 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <p className="font-body text-[11px] text-t-tertiary tracking-[0.1em] uppercase">Your context</p>
        <div className="mt-4 pl-4 border-l-[3px] border-brand">
          <p className="font-body text-[15px] text-t-secondary leading-[1.7] lg:block hidden">
            {scenarioText.slice(0, 300)}{scenarioText.length > 300 ? '...' : ''}
          </p>
          <p className="font-body text-[13px] text-t-secondary leading-[1.6] lg:hidden">
            {scenarioText.slice(0, 100)}...
          </p>
        </div>

        <div className="mt-8 hidden lg:block">
          <p className="font-body text-[11px] text-t-tertiary tracking-[0.1em] uppercase">Emerging structure</p>
          <div className="mt-4 bg-surface-2 rounded-[12px] p-4 font-mono text-[13px]">
            <span className="text-t-tertiary">{'{'}</span>
            {fieldKeys.map((key) => (
              <div key={key} className="ml-4 mt-1">
                <span style={{ color: 'hsl(210, 88%, 40%)' }}>"{key}"</span>
                <span className="text-t-tertiary">: </span>
                <TypewriterValue value={structuredFields[key]} />
              </div>
            ))}
            <span className="text-t-tertiary">{'}'}</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Conversation */}
      <div className="lg:w-[60%] flex flex-col min-h-0 flex-1">
        <div className="p-6 lg:px-[40px] lg:pt-12">
          {/* Progress bar */}
          <div className="w-full h-1 bg-brd rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-[600ms]"
              style={{ width: `${progress}%`, transitionTimingFunction: 'var(--ease-out-expo)' }}
            />
          </div>
          <p className="font-body text-[12px] text-t-tertiary mt-2">
            {Math.min(currentQuestion, 5)} of 5 questions answered
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 lg:px-[40px] pb-[140px]">
          <div className="max-w-[560px]">
            {messages.map((msg, i) => (
              msg.type === 'ai' ? (
                <div
                  key={i}
                  className="mb-6 animate-fade-slide"
                  style={{ animationDelay: '0ms' }}
                >
                  <div className="bg-surface border border-brd rounded-[16px_16px_16px_4px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-brand" />
                      <span className="font-body text-[11px] text-brand font-semibold">Talenza</span>
                    </div>
                    <p className="font-body text-[16px] text-t-primary leading-[1.6] mt-2">{msg.text}</p>
                  </div>
                </div>
              ) : (
                <div
                  key={i}
                  className="mb-6 flex justify-end animate-fade-slide"
                >
                  <div className="bg-brand text-primary-foreground font-body text-[15px] rounded-[16px_16px_4px_16px] px-[18px] py-3 max-w-[80%]">
                    {msg.text}
                  </div>
                </div>
              )
            ))}

            {isThinking && (
              <div className="mb-6 flex items-center gap-[6px] py-4">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-[5px] h-[5px] rounded-full bg-t-tertiary animate-thinking-dot"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed input */}
        {currentQuestion < 5 && (
          <div className="fixed bottom-0 right-0 lg:w-[60%] w-full">
            <div className="h-[60px] bg-gradient-to-t from-[hsl(var(--color-bg))] to-transparent" />
            <div className="bg-[hsl(var(--color-bg))] px-6 lg:px-[40px] pb-6">
              <div className="flex items-center gap-3 max-w-[560px]">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your answer..."
                  className="flex-1 bg-surface border-[1.5px] border-brd rounded-full px-5 py-[14px] font-body text-[15px] text-t-primary outline-none focus:border-brand focus:shadow-[0_0_0_4px_rgba(10,102,194,0.12)] transition-all duration-200"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className={`w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0 transition-all duration-150 ${
                    inputValue.trim()
                      ? 'bg-brand hover:bg-brand-hover hover:scale-105'
                      : 'bg-surface-2'
                  }`}
                >
                  <ArrowUp size={20} className={inputValue.trim() ? 'text-primary-foreground' : 'text-t-tertiary'} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TypewriterValue({ value }: { value?: string }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!value) { setDisplayed(''); return; }
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      i++;
      setDisplayed(value.slice(0, i));
      if (i >= value.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [value]);

  if (!value) return <span className="text-t-tertiary">"___"</span>;
  return <span style={{ color: 'hsl(152, 65%, 30%)' }}>"{displayed}"</span>;
}
