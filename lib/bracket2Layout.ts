export const DESIGN_W = 1800;
export const DESIGN_H = 1900;

export const SIDE_MARGIN = 80;
export const TOP_SAFE = 140;
export const TOP_REGION_OFFSET = 40;
export const BOTTOM_MARGIN = 80;
export const REGION_GAP_Y = 240;

// Region size
export const REGION_W = 820;
export const REGION_H = 600;

export const CENTER_W = 420;
export const CENTER_H = 560;

// Anchor regions symmetrically
export const LEFT_X = SIDE_MARGIN;
export const RIGHT_X = DESIGN_W - REGION_W - SIDE_MARGIN;

export const TOP_Y = TOP_SAFE + TOP_REGION_OFFSET;
export const BOTTOM_Y = TOP_Y + REGION_H + REGION_GAP_Y;

export const CENTER_X = (DESIGN_W - CENTER_W) / 2;
export const CENTER_Y = Math.round((DESIGN_H - CENTER_H) / 2);
export const CENTER_GUTTER = 100;

export const TITLE_H = 30;
export const TITLE_GAP = 10;
export const CONTENT_H = REGION_H - TITLE_H - TITLE_GAP;
export const REGION_INNER_PAD_X = 12;

// Team sizing
export const TEAM_ROW_H = 46;
export const TEAM_GAP = 6;
export const SLOT_H = TEAM_ROW_H * 2 + TEAM_GAP;
export const MATCHUP_GAP = 24;

// Column widths
export const COL_GAP = 32;
export const R32_COL_W = 220;
export const R16_COL_W = 220;
export const R8_COL_W = 220;

export const FINALS_GAP = 32;
export const CHAMP_GAP = 56;