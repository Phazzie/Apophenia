/**
 * Mock Unified AI Service for Testing
 */

export const generateConceptWithSelectedModel = jest.fn().mockResolvedValue({
  protagonist: 'Mock protagonist from unified service',
  setting: 'Mock setting from unified service', 
  dilemma: 'Mock dilemma from unified service'
});

export const generateNextStepWithSelectedModel = jest.fn().mockResolvedValue([
  {
    type: 'displayText',
    payload: {
      content: 'Mock next step content',
      segmentId: 'mock-segment-id'
    }
  },
  {
    type: 'displayChoices',
    payload: {
      choices: [
        { text: 'Mock choice 1', isIntrusive: false },
        { text: 'Mock choice 2', isIntrusive: false },
        { text: 'Mock intrusive choice', isIntrusive: true }
      ]
    }
  }
]);

export const generateWithSelectedModel = jest.fn().mockResolvedValue([
    {
        type: 'displayText',
        payload: {
            content: 'Mocked AI response'
        }
    }
]);