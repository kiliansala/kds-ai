export type PropType =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "array"
  | "object";

export interface PropDefinition {
  name: string;
  type: PropType;
  required?: boolean;
  default?: string | number | boolean | null;
  /** If type is enum */
  allowedValues?: (string | number)[];
  description?: string;
}

export interface EventDefinition {
  name: string;
  description?: string;
  payloadType?: string; // TypeScript type string e.g. "{ value: string }"
}

export interface SlotDefinition {
  name: string;
  description?: string;
}

export interface StateDefinition {
  name: string;
  description?: string;
}

export interface ComponentDefinition {
  tag: string;
  name: string;
  description: string;

  /** Public properties mapped to attributes */
  properties: PropDefinition[];

  /** Emitted events */
  events: EventDefinition[];

  /** Content slots */
  slots: SlotDefinition[];

  /** Visual/Interaction states */
  states: StateDefinition[];

  /** Design tokens used (opaque reference) */
  tokens?: string[];
}

/**
 * The entire system contract
 */
export interface SystemContract {
  version: string;
  components: ComponentDefinition[];
}
