export default () => ({
  PORT: parseInt(process.env.PORT || '3000'),
  GEMINI: {
    KEY: process.env.GEMINI_API_KEY || '',
    MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  },
});
