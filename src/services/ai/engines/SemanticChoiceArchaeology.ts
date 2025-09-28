/**
 * SEMANTIC CHOICE ARCHAEOLOGY
 * Deep psychological profiling that analyzes semantic meaning and subtext of choices
 * Goes beyond surface-level keywords to understand psychological motivations
 */

interface SemanticAnalysis {
  verbosity: number;
  complexity: number;
  emotionalTone: string;
  powerDynamics: string;
  timeOrientation: string;
  agencyLevel: string;
}

export class SemanticChoiceArchaeology {
  private semanticProfile: {
    dominancePatterns: string[];
    avoidancePatterns: string[];
    approachMotivations: string[];
    linguisticMarkers: Map<string, number>;
    subconciousReveals: string[];
  } = {
    dominancePatterns: [],
    avoidancePatterns: [],
    approachMotivations: [],
    linguisticMarkers: new Map(),
    subconciousReveals: [],
  };

  analyzeChoiceSemantics(choice: string, availableChoices: string[]): {
    psychProfile: string;
    hiddenMotivations: string[];
    semanticInsight: string;
  } {
    const analysis = this.performSemanticAnalysis(choice, availableChoices);
    this.updateSemanticProfile(analysis);

    return {
      psychProfile: this.generatePsychProfile(),
      hiddenMotivations: this.extractHiddenMotivations(choice),
      semanticInsight: this.generateSemanticInsight(analysis),
    };
  }

  private performSemanticAnalysis(choice: string, alternatives: string[]): SemanticAnalysis {
    const choiceLength = choice.length;
    const avgLength = alternatives.length > 0 ? alternatives.reduce((sum, alt) => sum + alt.length, 0) / alternatives.length : 1;

    return {
      verbosity: choiceLength / avgLength,
      complexity: (choice.match(/,/g) || []).length + 1, // Clause count
      emotionalTone: this.analyzeEmotionalTone(choice),
      powerDynamics: this.analyzePowerDynamics(choice),
      timeOrientation: this.analyzeTimeOrientation(choice),
      agencyLevel: this.analyzeAgency(choice),
    };
  }

  private analyzeEmotionalTone(choice: string): string {
    const fearWords = ['afraid', 'scared', 'worry', 'dangerous', 'risk'];
    const controlWords = ['control', 'manage', 'handle', 'deal', 'master', 'force'];
    const submitWords = ['accept', 'surrender', 'give', 'let', 'allow'];

    if (fearWords.some(word => choice.toLowerCase().includes(word))) return 'fear-based';
    if (controlWords.some(word => choice.toLowerCase().includes(word))) return 'control-seeking';
    if (submitWords.some(word => choice.toLowerCase().includes(word))) return 'submission-oriented';

    return 'neutral';
  }

  private analyzePowerDynamics(choice: string): string {
    const dominantWords = ['force', 'demand', 'insist', 'command', 'take'];
    const submissiveWords = ['please', 'ask', 'hope', 'maybe', 'try'];

    if (dominantWords.some(word => choice.toLowerCase().includes(word))) return 'dominant';
    if (submissiveWords.some(word => choice.toLowerCase().includes(word))) return 'submissive';

    return 'balanced';
  }

  private analyzeTimeOrientation(choice: string): string {
    const pastWords = ['was', 'were', 'had', 'did', 'before'];
    const futureWords = ['will', 'would', 'could', 'might', 'after'];

    if (pastWords.some(word => choice.toLowerCase().includes(word))) return 'past-focused';
    if (futureWords.some(word => choice.toLowerCase().includes(word))) return 'future-focused';

    return 'present-focused';
  }

  private analyzeAgency(choice: string): string {
    const highAgency = ['I will', 'I can', 'I must', 'I choose'];
    const lowAgency = ['I should', 'I might', 'I hope', 'I wish'];

    if (highAgency.some(phrase => choice.includes(phrase))) return 'high-agency';
    if (lowAgency.some(phrase => choice.includes(phrase))) return 'low-agency';

    return 'moderate-agency';
  }

  private updateSemanticProfile(analysis: SemanticAnalysis): void {
    this.semanticProfile.linguisticMarkers.set(analysis.emotionalTone,
      (this.semanticProfile.linguisticMarkers.get(analysis.emotionalTone) || 0) + 1);
  }

  private generatePsychProfile(): string {
    const dominantTone = Array.from(this.semanticProfile.linguisticMarkers.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

    return `Primary psychological pattern: ${dominantTone}`;
  }

  private extractHiddenMotivations(choice: string): string[] {
    const motivations: string[] = [];

    if (choice.toLowerCase().includes('safe')) motivations.push('security-seeking');
    if (choice.toLowerCase().includes('know')) motivations.push('knowledge-craving');
    if (choice.toLowerCase().includes('together')) motivations.push('connection-needing');

    return motivations;
  }

  private generateSemanticInsight(analysis: SemanticAnalysis): string {
    return `Choice reveals ${analysis.emotionalTone} tendencies with ${analysis.powerDynamics} power dynamics, ${analysis.agencyLevel} self-efficacy.`;
  }
}