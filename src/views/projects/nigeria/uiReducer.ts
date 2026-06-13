import { Layer } from './types';

export interface UIState {
  layer: Layer;
  showWatch: boolean;
  hovered: string | null;
  pinned: string | null;
}

export type Action =
  | { t: 'layer'; layer: Layer }
  | { t: 'toggleWatch' }
  | { t: 'hover'; iso: string | null }
  | { t: 'pin'; iso: string };

export const initialUIState: UIState = {
  layer: 'party',
  showWatch: false,
  hovered: null,
  pinned: null,
};

/**
 * Explicit interaction transitions (spec §3.1):
 * - hover only ever sets `hovered`; it never touches `pinned`
 * - mouseleave (hover:null) therefore can't blank a pinned panel
 * - pin toggles; clicking the pinned state again releases it
 */
export const uiReducer = (s: UIState, a: Action): UIState => {
  switch (a.t) {
    case 'layer':
      return { ...s, layer: a.layer };
    case 'toggleWatch':
      return { ...s, showWatch: !s.showWatch };
    case 'hover':
      return { ...s, hovered: a.iso };
    case 'pin':
      return { ...s, pinned: s.pinned === a.iso ? null : a.iso };
    default:
      return s;
  }
};

/** The state shown in the panel: a pin wins so hover never clobbers it. */
export const panelIsoOf = (s: UIState): string | null => s.pinned ?? s.hovered;
