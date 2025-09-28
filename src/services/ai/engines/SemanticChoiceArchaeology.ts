/**
 * Semantic analysis result interface for type safety
 */
export interface SemanticAnalysisResult {
  verbosity: number;
  complexity: number;
  emotionalTone: string;
  powerDynamics: string;
  timeOrientation: string;
  agencyLevel: string;
}

/**
 * SEMANTIC CHOICE ARCHAEOLOGY
 * Deep psychological profiling that analyzes semantic meaning and subtext of choices
 * Goes beyond surface-level keywords to understand psychological motivations
 * 
 * FIXED: Critical Issue #2 - Case-Insensitive Agency Detection
 * All input is normalized to lowercase before pattern matching
 */
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

  private performSemanticAnalysis(choice: string, alternatives: string[]): SemanticAnalysisResult {
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
    // FIXED: Critical Issue #2 - Case-insensitive analysis
    const choiceLower = choice.toLowerCase();
    
    const fearWords = ['afraid', 'scared', 'worry', 'dangerous', 'risk'];
    const controlWords = ['control', 'manage', 'handle', 'deal', 'master', 'force'];
    const submitWords = ['accept', 'surrender', 'give', 'let', 'allow'];

    if (fearWords.some(word => choiceLower.includes(word))) return 'fear-based';
    if (controlWords.some(word => choiceLower.includes(word))) return 'control-seeking';
    if (submitWords.some(word => choiceLower.includes(word))) return 'submission-oriented';

    return 'neutral';
  }

  private analyzePowerDynamics(choice: string): string {
    // FIXED: Critical Issue #2 - Case-insensitive analysis
    const choiceLower = choice.toLowerCase();
    
    const dominantWords = ['force', 'demand', 'insist', 'command', 'take'];
    const submissiveWords = ['please', 'ask', 'hope', 'maybe', 'try'];

    if (dominantWords.some(word => choiceLower.includes(word))) return 'dominant';
    if (submissiveWords.some(word => choiceLower.includes(word))) return 'submissive';

    return 'balanced';
  }

  private analyzeTimeOrientation(choice: string): string {
    // FIXED: Critical Issue #2 - Case-insensitive analysis
    const choiceLower = choice.toLowerCase();
    
    const pastWords = ['was', 'were', 'had', 'did', 'before'];
    const futureWords = ['will', 'would', 'could', 'might', 'after'];

    if (pastWords.some(word => choiceLower.includes(word))) return 'past-focused';
    if (futureWords.some(word => choiceLower.includes(word))) return 'future-focused';

    return 'present-focused';
  }

  /**
   * FIXED: Critical Issue #2 - Case-Insensitive Agency Detection
   * Normalizes input to lowercase before pattern matching to catch phrases like "i WILL comply"
   */
  private analyzeAgency(choice: string): string {
    // Normalize to lowercase for case-insensitive matching
    const choiceLower = choice.toLowerCase();
    
    // Define patterns in lowercase for consistent matching
    const highAgencyPatterns = ['i will', 'i can', 'i must', 'i choose'];
    const lowAgencyPatterns = ['i should', 'i might', 'i hope', 'i wish'];

    // Check for high agency patterns (catches "i WILL comply", "I Will fight", etc.)
    if (highAgencyPatterns.some(pattern => choiceLower.includes(pattern))) return 'high-agency';
    
    // Check for low agency patterns  
    if (lowAgencyPatterns.some(pattern => choiceLower.includes(pattern))) return 'low-agency';

    return 'moderate-agency';
  }

  private updateSemanticProfile(analysis: SemanticAnalysisResult): void {
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
    
    // FIXED: Critical Issue #2 - Case-insensitive motivation detection
    const choiceLower = choice.toLowerCase();

    if (choiceLower.includes('safe')) motivations.push('security-seeking');
    if (choiceLower.includes('know')) motivations.push('knowledge-craving');
    if (choiceLower.includes('together')) motivations.push('connection-needing');

    return motivations;
  }

  private generateSemanticInsight(analysis: SemanticAnalysisResult): string {
    return `Choice reveals ${analysis.emotionalTone} tendencies with ${analysis.powerDynamics} power dynamics, ${analysis.agencyLevel} self-efficacy.`;
  }
}