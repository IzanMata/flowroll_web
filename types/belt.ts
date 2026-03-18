// Legacy belt types from the techniques API
export type ColorEnum = 'white' | 'blue' | 'purple' | 'brown' | 'black';

export interface Belt {
  readonly id: number;
  color: ColorEnum;
  order: number;
}

export interface BeltRequest {
  color: ColorEnum;
  order: number;
}

export interface PatchedBeltRequest {
  color?: ColorEnum;
  order?: number;
}
