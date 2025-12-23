// src/types/technique.ts
import { Belt } from "./belt";

// --- Sub-Entities (Dependencies) ---
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

// --- Main Entity ---
export interface Technique {
    readonly id: number;
    name: string;
    description?: string;
    difficulty?: number;
    readonly min_belt: Belt; // Relación con Belt
    readonly categories: TechniqueCategory[];
    readonly variations: TechniqueVariation[];
    readonly leads_to: TechniqueFlow[];
}

// --- Requests (DTOs) ---
export interface TechniqueRequest {
    name: string;
    description?: string;
    difficulty?: number;
    // Aquí podrías añadir min_belt_id, category_ids, etc. si tu API lo requiere
}

export interface PatchedTechniqueRequest {
    name?: string;
    description?: string;
    difficulty?: number;
}

// También puedes poner aquí los Requests de Category/Variation si quieres mantener contexto
export interface TechniqueCategoryRequest {
    name: string;
    description?: string;
}