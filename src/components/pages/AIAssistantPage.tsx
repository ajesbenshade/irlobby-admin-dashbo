import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PaperPlaneRight, Robot } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export function AIAssistantPage() {
  const [messages, setMessages] = useKV<Message[]>('ai-chat-messages', [])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((current) => [...(current || []), userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const prompt = `You are an AI assistant helping to manage the IRLobby app. The user says: ${input}`
      const response = await window.spark.llm(prompt, 'gpt-4o-mini')

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      }

      setMessages((current) => [...(current || []), assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages((current) => [...(current || []), errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
    setMessages([])
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground mt-1">
            Get help with administrative tasks and insights powered by AI.
          </p>
        </div>
        {(messages?.length || 0) > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearChat}>
            Clear Chat
          </Button>
        )}
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Robot className="h-5 w-5" />
            Chat
          </CardTitle>
          <CardDescription>
            Ask questions, request reports, or get administrative assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 p-0">
          <ScrollArea className="flex-1 px-6">
            {(messages?.length || 0) === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                  <Robot className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">Start a conversation</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try asking about user activity, content trends, or request data analysis
                    </p>
                  </div>
                  <div className="space-y-2 text-left">
                    <p className="text-xs font-medium text-muted-foreground">Example prompts:</p>
                    <button
                      className="block w-full text-left text-sm p-3 rounded-lg bg-muted hover:bg-accent transition-colors"
                      onClick={() => setInput('What are the top moderation issues this week?')}
                    >
                      What are the top moderation issues this week?
                    </button>
                    <button
                      className="block w-full text-left text-sm p-3 rounded-lg bg-muted hover:bg-accent transition-colors"
                      onClick={() => setInput('Show me user growth trends')}
                    >
                      Show me user growth trends
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {(messages || []).map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <Robot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 rounded-lg bg-muted p-3">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] max-h-[120px]"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="self-end"
              >
                <PaperPlaneRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-accent' : 'bg-primary'
        }`}
      >
        {isUser ? (
          <span className="text-xs font-medium text-accent-foreground">You</span>
        ) : (
          <Robot className="h-4 w-4 text-primary-foreground" />
        )}
      </div>
      <div
        className={`flex-1 rounded-lg p-3 ${
          isUser ? 'bg-accent text-accent-foreground' : 'bg-muted'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
