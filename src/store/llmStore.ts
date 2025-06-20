import { create } from 'zustand';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PatientReportService, PatientReportData } from '@/services/patientReportService';
import { Patient } from '@/components/dashboard/Dashboard';

export interface LLMMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string; // Date string instead of Date object for SSR compatibility
}

interface LLMState {
  // State
  isOpen: boolean;
  isLoading: boolean;
  isGeneratingReport: boolean;
  messages: LLMMessage[];
  genAI: GoogleGenerativeAI | null;

  // Actions
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  sendMessage: (content: string) => Promise<void>;
  generatePatientReport: (patient: Patient) => Promise<void>;
  clearMessages: () => void;
  initialize: () => void;
}

export const useLLMStore = create<LLMState>((set, get) => ({
  // Initial state
  isOpen: false,
  isLoading: false,
  isGeneratingReport: false,
  messages: [],
  genAI: null,

  // Toggle sidebar visibility
  toggleSidebar: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  // Open sidebar
  openSidebar: () => {
    set({ isOpen: true });
  },

  // Close sidebar
  closeSidebar: () => {
    set({ isOpen: false });
  },

  // Send message to Gemini
  sendMessage: async (content: string) => {
    const { genAI, messages } = get();

    if (!genAI) {
      console.error('Google Generative AI not initialized');
      return;
    }

    // Add user message
    const userMessage: LLMMessage = {
      id: `user-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    try {
      // Get Gemini model (güncel model adı)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      // Create conversation context for medical assistant
      const context = `Sen bir sağlık asistanısın. Doktorlara yardımcı olacak şekilde tıbbi sorularını yanıtla.
      Hasta bilgileri, tedavi önerileri, ilaç etkileşimleri ve genel tıbbi konularda rehberlik et.
      Her zaman profesyonel bir dil kullan ve kesin tanı koymaktan kaçın - sadece rehberlik et.`;

      // Prepare conversation history
      const conversationHistory = messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const prompt = `${context}\n\nKonuşma geçmişi:\n${conversationHistory}\n\nUser: ${content}\n\nAssistant:`;

      // Generate response
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Add assistant message
      const assistantMessage: LLMMessage = {
        id: `assistant-${Date.now()}`,
        content: text,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error sending message to Gemini:', error);

      // Add error message
      const errorMessage: LLMMessage = {
        id: `error-${Date.now()}`,
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false,
      }));
    }
  },

    // Generate patient report
  generatePatientReport: async (patient: Patient) => {
    const { genAI } = get();

    if (!genAI) {
      console.error('Google Generative AI not initialized');
      return;
    }

    set({ isGeneratingReport: true, isOpen: true });

    try {
      // Hasta verilerini topla
      const patientData = await PatientReportService.gatherPatientData(patient);

      // Prompt oluştur
      const prompt = PatientReportService.generatePatientReportPrompt(patientData);

      // Kullanıcı mesajı ekle
      const userMessage: LLMMessage = {
        id: `report-request-${Date.now()}`,
        content: `${patient.name} ${patient.surname} hastası için tıbbi rapor oluşturulması talep edildi.`,
        role: 'user',
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, userMessage],
      }));

      // Get Gemini model
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      // Generate response
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Add assistant message
      const assistantMessage: LLMMessage = {
        id: `report-${Date.now()}`,
        content: text,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isGeneratingReport: false,
      }));

    } catch (error) {
      console.error('Error generating patient report:', error);

      // Add error message
      const errorMessage: LLMMessage = {
        id: `report-error-${Date.now()}`,
        content: 'Hasta raporu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isGeneratingReport: false,
      }));
    }
  },

  // Clear all messages
  clearMessages: () => {
    set({ messages: [] });
  },

  // Initialize Google Generative AI
  initialize: () => {
    try {
      // Google Gemini API key - Buraya kendi API key'inizi yazın
      const GEMINI_API_KEY = 'AIzaSyCeaLMDGB4oyi9wtB30xwm2pLx3smAf7DY';

      if (!GEMINI_API_KEY) {
        console.error('❌ Gemini API key not configured. Please update GEMINI_API_KEY in llmStore.ts');
        return;
      }

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      set({ genAI });

      console.log('✅ Google Generative AI initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Google Generative AI:', error);
    }
  },
}));