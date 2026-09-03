export interface PremiumReportV2 {
  executive_summary: {
    headline: string;
    body: string;
    key_points: string[];
  };

  attachment_profile: {
    primary_interpretation: string;
    secondary_interpretation?: string;
    dimension_interpretation: string;
  };

  behavior_patterns: Array<{
    signal_id: string;
    title: string;
    score: number;
    strength_label: string; // e.g. "명확", "약함"
    observation: string;
    interpretation: string;
    relationship_effect: string;
    counterpoint?: string;
  }>;

  evidence_deep_dive: Array<{
    title: string;
    situation: string;
    observed_behavior: string;
    interaction: string;
    interpretation: string;
    alternative_explanation: string;
    conclusion: string;
  }>;

  trigger_profile: Array<{
    trigger: string;
    observed_response: string;
    interpretation: string;
    recommended_approach: string;
  }>;

  interaction_loop?: {
    summary: string;
    steps: string[];
    break_points: string[];
  };

  conflict_pattern: {
    summary: string;
    works_better: string[];
    likely_to_worsen: string[];
  };

  communication_guide: Array<{
    situation: string;
    do: string;
    dont: string;
    why: string;
  }>;

  conversation_rewrites: Array<{
    situation: string;
    original_pattern_summary: string;
    recommended_message: string;
    why: string;
  }>;

  recovery_signals: string[];

  risk_signals: string[];

  action_plan: {
    next_conflict: string[];
    next_7_days: string[];
    next_30_days: string[];
  };

  manual_summary: {
    effective_approach: string[];
    ineffective_approach: string[];
    conflict_reentry: string;
    distance_response: string;
    relationship_check: string;
    watch_for: string[];
    key_sentence: string;
  };

  methodology: {
    body: string;
  };
}

export interface DerivedReportContext {
  relationship_context: string;
  key_situations: Array<{
    situation: string;
    target_behavior: string;
    other_person_behavior: string;
    interaction_result: string;
  }>;
  key_patterns: Array<{
    signal_id: string;
    observation: string;
    counterpoint?: string;
  }>;
  trigger_candidates: string[];
  interaction_patterns: string[];
  counter_evidence: string[];
  healthy_patterns: string[];
}
