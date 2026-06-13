import { initialUIState, panelIsoOf, uiReducer } from './uiReducer';

describe('uiReducer interaction transitions', () => {
  test('pin sets the pinned state', () => {
    const s = uiReducer(initialUIState, { t: 'pin', iso: 'NG-LA' });
    expect(s.pinned).toBe('NG-LA');
  });

  test('pinning the same state again releases it', () => {
    let s = uiReducer(initialUIState, { t: 'pin', iso: 'NG-LA' });
    s = uiReducer(s, { t: 'pin', iso: 'NG-LA' });
    expect(s.pinned).toBeNull();
  });

  test('hover never touches pinned', () => {
    let s = uiReducer(initialUIState, { t: 'pin', iso: 'NG-LA' });
    s = uiReducer(s, { t: 'hover', iso: 'NG-KN' });
    expect(s.pinned).toBe('NG-LA');
    expect(s.hovered).toBe('NG-KN');
  });

  test('panel shows the pin even while hovering another state', () => {
    let s = uiReducer(initialUIState, { t: 'pin', iso: 'NG-LA' });
    s = uiReducer(s, { t: 'hover', iso: 'NG-KN' });
    expect(panelIsoOf(s)).toBe('NG-LA');
  });

  test('mouseleave (hover:null) does not blank a pin', () => {
    let s = uiReducer(initialUIState, { t: 'pin', iso: 'NG-LA' });
    s = uiReducer(s, { t: 'hover', iso: null });
    expect(panelIsoOf(s)).toBe('NG-LA');
  });

  test('with no pin, the panel follows hover', () => {
    const s = uiReducer(initialUIState, { t: 'hover', iso: 'NG-RI' });
    expect(panelIsoOf(s)).toBe('NG-RI');
  });

  test('layer toggle preserves the pin', () => {
    let s = uiReducer(initialUIState, { t: 'pin', iso: 'NG-LA' });
    s = uiReducer(s, { t: 'layer', layer: 'timing' });
    expect(s.layer).toBe('timing');
    expect(s.pinned).toBe('NG-LA');
  });

  test('toggleWatch flips the flag', () => {
    const s = uiReducer(initialUIState, { t: 'toggleWatch' });
    expect(s.showWatch).toBe(true);
  });
});
