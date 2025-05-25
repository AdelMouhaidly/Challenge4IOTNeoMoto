export type MotoStatus = 'parada' | 'em uso' | 'aguardando';

export type Moto = {
  id: string;
  name: string;
  x: number;
  y: number;
  status: MotoStatus; 
  marca: string;      
  configuracoes: string; 
};

export type StackLista = {
  Login: undefined;
  Register: undefined;
  DrawerRoot: undefined;
  Cadastro: undefined;
  Alertas: undefined;
  Perfil: undefined;
  Historico: undefined;
};

export type DrawerLista = {
  Home: undefined;
  Patio: undefined;
  Cadastro: undefined;
  Alertas: undefined;
  Perfil: undefined;
  DetectarMoto: undefined;
  Historico: undefined;
};
