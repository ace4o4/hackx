export {};

declare global {
  interface Window {
    ai?: {
      languageModel?: {
        create: (options: { systemPrompt: string }) => Promise<{
          prompt: (p: string) => Promise<string>;
          destroy: () => void;
        }>;
      };
    };
    webkitAudioContext?: typeof AudioContext;
  }
}
