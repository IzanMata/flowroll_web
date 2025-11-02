export type Belt = {
  id: number;
  color: string;
  order: number;
};

export type TechniqueCategory = {
  id: number;
  name: string;
  description?: string;
};

export type Technique = {
  id: number;
  name: string;
  description?: string;
  difficulty?: number;
  min_belt?: Belt | null;
  categories?: TechniqueCategory[];
};
