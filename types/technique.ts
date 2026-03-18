// Legacy technique types from the techniques API
import type { Belt } from './belt';

export interface TechniqueCategory {
  readonly id: number;
  name: string;
  description?: string;
}

export interface TechniqueVariation {
  readonly id: number;
  name: string;
  description?: string;
}

export interface TechniqueFlow {
  readonly id: number;
  readonly to_technique: string;
  description?: string;
}

export interface Technique {
  readonly id: number;
  name: string;
  description?: string;
  difficulty?: number;
  readonly min_belt: Belt;
  readonly categories: TechniqueCategory[];
  readonly variations: TechniqueVariation[];
  readonly leads_to: TechniqueFlow[];
}

export interface TechniqueRequest {
  name: string;
  description?: string;
  difficulty?: number;
}

export interface PatchedTechniqueRequest {
  name?: string;
  description?: string;
  difficulty?: number;
}

export interface TechniqueCategoryRequest {
  name: string;
  description?: string;
}

export interface PatchedTechniqueCategoryRequest {
  name?: string;
  description?: string;
}

export interface TechniqueVariationRequest {
  name: string;
  description?: string;
}

export interface PatchedTechniqueVariationRequest {
  name?: string;
  description?: string;
}

export interface TechniqueFlowRequest {
  description?: string;
}
