/** 'demo' = not configured, filled with fictional sample data (demo mode only). */
export type ConnectorState = 'connected' | 'not_configured' | 'error' | 'demo';

export type ConnectorKind =
  | 'email'
  | 'calendar'
  | 'slack'
  | 'payments'
  | 'notion'
  | 'brain'
  | 'social'
  | 'crm'
  | 'ads'
  | 'creative'
  | 'knowledge'
  | 'local'
  | 'orchestration';

export type ConnectorStatus = {
  id: string;
  name: string;
  kind: ConnectorKind;
  state: ConnectorState;
  detail: string;
  meta?: Record<string, string | number>;
};
