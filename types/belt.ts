import { ColorEnum } from "./enums";

// --- Entity ---
export interface Belt {
    readonly id: number;
    color: ColorEnum;
    order: number; // 1=white, 5=black
}

// --- Requests ---
export interface BeltRequest {
    color: ColorEnum;
    order: number;
}

export interface PatchedBeltRequest {
    color?: ColorEnum;
    order?: number;
}