"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import API_BASE_URL from "@/config/api";
import "./ChatBot.css";
import {
  LuBot,
  LuSend,
  LuX,
  LuMessageCircle,
  LuSparkles,
  LuExternalLink,
  LuChevronDown,
  LuMinus,
  LuTrash2,
} from "react-icons/lu";

// Helper: get auth token
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

// Helper: build auth headers
const authHeaders = () => {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { language } = useLanguage();

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Load chat history from DB for logged-in users
  const loadHistory = useCallback(async () => {
    if (historyLoaded) return;
    const token = getToken();
    if (!token) {
      setHistoryLoaded(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/chatbot/history`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success && data.data.messages?.length > 0) {
        const loadedMsgs = data.data.messages.map((m) => ({
          role: m.role,
          content: m.content,
          quickReplies: [],
          links: [],
          timestamp: new Date(m.timestamp),
        }));
        setMessages(loadedMsgs);
        setHistoryLoaded(true);
        return true; // history found
      }
    } catch {}
    setHistoryLoaded(true);
    return false;
  }, [historyLoaded]);

  // Clear chat history
  const clearHistory = async () => {
    const token = getToken();
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/chatbot/history`, {
          method: "DELETE",
          headers: authHeaders(),
        });
      } catch {}
    }
    setMessages([]);
    setHistoryLoaded(false);
  };

  // Load welcome message when chat first opens
  const loadWelcome = useCallback(async () => {
    // First try to load history for logged-in users
    const hasHistory = await loadHistory();
    if (hasHistory) return; // history loaded, don't show welcome
    if (messages.length > 0) return;

    setIsTyping(true);
    try {
      const res = await fetch(`${API_BASE_URL}/chatbot/welcome?lang=${language}`);
      const data = await res.json();
      if (data.success) {
        setTimeout(() => {
          setMessages([
            {
              role: "bot",
              content: data.data.message,
              quickReplies: data.data.quickReplies || [],
              links: data.data.links || [],
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
        }, 600);
      } else {
        setIsTyping(false);
      }
    } catch {
      setTimeout(() => {
        setMessages([
          {
            role: "bot",
            content:
              language === "bn"
                ? "আসসালামু আলাইকুম! 👋\nআমি ব্রেভটক বাংলাদেশ-এর AI সহকারী।\n\nআমি আপনাকে কোর্স, ভর্তি, ফি, সেমিনার এবং আরও অনেক বিষয়ে সাহায্য করতে পারি!"
                : "Hello! 👋\nI'm BraveTalk Bangladesh's AI Assistant.\n\nI can help you with courses, admission, fees, seminars, and much more!",
            quickReplies:
              language === "bn"
                ? ["কোর্স দেখুন", "ভর্তি প্রক্রিয়া", "কোর্সের ফি", "ফ্রি সেমিনার", "যোগাযোগ"]
                : ["View Courses", "Admission Process", "Course Fees", "Free Seminars", "Contact Us"],
            links: [],
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 600);
    }
  }, [language, messages.length, loadHistory]);

  // Send message
  const sendMessage = async (text) => {
    const userMessage = text || inputValue.trim();
    if (!userMessage) return;

    // Add user message
    const newUserMsg = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Build conversation history for AI context
      const history = [...messages, newUserMsg]
        .filter((m) => m.content)
        .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content }));

      const res = await fetch(`${API_BASE_URL}/chatbot/message`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ message: userMessage, history }),
      });
      const data = await res.json();

      // Simulate typing delay for natural feel
      const delay = Math.min(Math.max(data.data?.message?.length * 8, 500), 2000);
      setTimeout(() => {
        if (data.success) {
          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              content: data.data.message,
              quickReplies: data.data.quickReplies || [],
              links: data.data.links || [],
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              content:
                language === "bn"
                  ? "দুঃখিত, কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।"
                  : "Sorry, something went wrong. Please try again.",
              quickReplies: [],
              links: [],
              timestamp: new Date(),
            },
          ]);
        }
        setIsTyping(false);
      }, delay);
    } catch {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content:
              language === "bn"
                ? "⚠️ সংযোগ সমস্যা হচ্ছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন বা কল করুন: +8801323878569"
                : "⚠️ Connection issue. Please try again later or call: +8801323878569",
            quickReplies: [],
            links: [],
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 800);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleQuickReply = (reply) => {
    sendMessage(reply);
  };


  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      setHasNewMessage(false);
      loadWelcome();
    } else {
      setIsOpen(false);
    }
  };

  // Render message with markdown-like formatting
  const renderMessage = (content) => {
    if (!content) return null;

    return content.split("\n").map((line, i) => {
      // Bold text
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Strikethrough
      processed = processed.replace(/~~(.*?)~~/g, '<del>$1</del>');
      // Bullet points
      if (processed.startsWith("• ") || processed.startsWith("- ")) {
        processed = `<span class="chatbot-bullet">›</span> ${processed.substring(2)}`;
      }
      // Numbered items
      const numMatch = processed.match(/^(\d+)\.\s/);
      if (numMatch) {
        processed = `<span class="chatbot-num">${numMatch[1]}.</span> ${processed.substring(numMatch[0].length)}`;
      }

      return (
        <span
          key={i}
          className="chatbot-line"
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      );
    });
  };

  // Show notification dot after some time
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setHasNewMessage(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
      {/* ─── Chat Window ─────────────────────────── */}
      <div
        className={`chatbot-window ${isOpen ? "chatbot-window-open" : ""} ${isMinimized ? "chatbot-window-minimized" : ""}`}
      >
        {/* Header */}
        <div className="chatbot-header" onClick={() => isMinimized && setIsMinimized(false)}>
          <div className="chatbot-header-left">
            <div className="chatbot-avatar">
              <LuBot size={20} />
              <span className="chatbot-online-dot"></span>
            </div>
            <div className="chatbot-header-info">
              <h3 className="chatbot-header-title">
                {language === "bn" ? "ব্রেভটক বাংলাদেশ" : "BraveTalk Bangladesh"}
              </h3>
              <p className="chatbot-header-status">
                <span className="chatbot-status-dot"></span>
                {language === "bn" ? "অনলাইন • AI সহকারী" : "Online • AI Assistant"}
              </p>
            </div>
          </div>
          <div className="chatbot-header-actions">
            {messages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); clearHistory(); }}
                className="chatbot-header-btn"
                title={language === "bn" ? "হিস্ট্রি মুছুন" : "Clear History"}
              >
                <LuTrash2 size={14} />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
              className="chatbot-header-btn"
              title="Minimize"
            >
              {isMinimized ? <LuChevronDown size={16} /> : <LuMinus size={16} />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              className="chatbot-header-btn"
              title="Close"
            >
              <LuX size={16} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        {!isMinimized && (
          <>
            <div className="chatbot-messages" ref={chatContainerRef}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`chatbot-msg ${msg.role === "user" ? "chatbot-msg-user" : "chatbot-msg-bot"}`}>
                  {msg.role === "bot" && (
                    <div className="chatbot-msg-avatar-sm">
                      <LuBot size={14} />
                    </div>
                  )}
                  <div className={`chatbot-bubble ${msg.role === "user" ? "chatbot-bubble-user" : "chatbot-bubble-bot"}`}>
                    <div className="chatbot-bubble-content">
                      {renderMessage(msg.content)}
                    </div>

                    {/* Links */}
                    {msg.links && msg.links.length > 0 && (
                      <div className="chatbot-links">
                        {msg.links.map((link, li) => (
                          <a key={li} href={link.url} className="chatbot-link-btn" target="_blank" rel="noopener noreferrer">
                            <LuExternalLink size={12} />
                            {link.text}
                          </a>
                        ))}
                      </div>
                    )}

                    <span className="chatbot-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Quick Replies (show only on last bot message) */}
              {messages.length > 0 &&
                messages[messages.length - 1].role === "bot" &&
                messages[messages.length - 1].quickReplies?.length > 0 && !isTyping && (
                  <div className="chatbot-quick-replies">
                    {messages[messages.length - 1].quickReplies.map((reply, ri) => (
                      <button key={ri} onClick={() => handleQuickReply(reply)} className="chatbot-quick-btn">
                        {reply}
                      </button>
                    ))}
                  </div>
                )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="chatbot-msg chatbot-msg-bot">
                  <div className="chatbot-msg-avatar-sm">
                    <LuBot size={14} />
                  </div>
                  <div className="chatbot-bubble chatbot-bubble-bot chatbot-typing-bubble">
                    <div className="chatbot-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ─── Permanent Quick Suggestions ──────── */}
            <div className="chatbot-suggestions">
              {(language === "bn"
                ? [
                    { label: "📚 কোর্স দেখুন", msg: "আপনাদের কোর্সগুলো দেখতে চাই" },
                    { label: "💰 কোর্স ফি", msg: "কোর্সের ফি কত?" },
                    { label: "📋 ভর্তি প্রক্রিয়া", msg: "কিভাবে ভর্তি হতে পারি?" },
                    { label: "👨‍🏫 মেন্টর", msg: "মেন্টরদের সম্পর্কে বলুন" },
                    { label: "🎓 সার্টিফিকেট", msg: "সার্টিফিকেট কি পাওয়া যায়?" },
                    { label: "💼 জব প্লেসমেন্ট", msg: "জব প্লেসমেন্ট সাপোর্ট আছে?" },
                    { label: "📅 ফ্রি সেমিনার", msg: "ফ্রি সেমিনার কবে হবে?" },
                    { label: "📞 যোগাযোগ", msg: "যোগাযোগের তথ্য দিন" },
                    { label: "🤖 তুমি কে?", msg: "তুমি কে?" },
                    { label: "😂 মজা করো", msg: "আমাকে একটু মজা দাও" },
                  ]
                : [
                    { label: "📚 Courses", msg: "Show me your courses" },
                    { label: "💰 Fees", msg: "What are the course fees?" },
                    { label: "📋 Admission", msg: "How to get admitted?" },
                    { label: "👨‍🏫 Mentors", msg: "Tell me about mentors" },
                    { label: "🎓 Certificate", msg: "Do you provide certificates?" },
                    { label: "💼 Job Support", msg: "Do you offer job placement?" },
                    { label: "📅 Seminars", msg: "When is the next free seminar?" },
                    { label: "📞 Contact", msg: "Give me contact info" },
                    { label: "🤖 Who are you?", msg: "Who are you?" },
                    { label: "😂 Fun", msg: "Tell me a joke" },
                  ]
              ).map((item, i) => (
                <button
                  key={i}
                  type="button"
                  className="chatbot-suggestion-chip"
                  onClick={() => sendMessage(item.msg)}
                  disabled={isTyping}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="chatbot-input-area">
              <div className="chatbot-input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={language === "bn" ? "আপনার প্রশ্ন লিখুন..." : "Type your message..."}
                  className="chatbot-input"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="chatbot-send-btn"
                >
                  <LuSend size={16} />
                </button>
              </div>
              <p className="chatbot-powered">
                <LuSparkles size={10} />
                {language === "bn" ? "AI দ্বারা পরিচালিত" : "Powered by AI"}
              </p>
            </form>
          </>
        )}
      </div>

      {/* ─── Floating Chat Button (hidden when chat is open) ── */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="chatbot-fab"
          id="chatbot-toggle"
          aria-label="Chat with us"
        >
          {/* Pulse ring */}
          <span className="chatbot-fab-pulse"></span>

          {/* Notification dot */}
          {hasNewMessage && (
            <span className="chatbot-fab-badge">1</span>
          )}

          {/* Icon */}
          <span className="chatbot-fab-icon">
            <LuMessageCircle size={24} />
          </span>

          {/* Tooltip */}
          <span className="chatbot-fab-tooltip">
            {language === "bn" ? "আমাদের সাথে চ্যাট করুন!" : "Chat with us!"}
          </span>
        </button>
      )}
    </>
  );
};

export default ChatBot;
