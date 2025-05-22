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

export type MotoReserva = {
  id: string;
  nome: string;
  descricao: string;
  precoDiaria: number;
};

export type StackLista = {
  Login: undefined;
  Register: undefined;
  DrawerRoot: undefined;
  Reserva: undefined;
  Moto: undefined;
  Perfil: undefined;
};

export type DrawerLista = {
  Home: undefined;
  Patio: undefined;
  Reserva: undefined;
  Moto: undefined;
  Perfil: undefined;
  DetectarMoto: undefined;
  Suporte: undefined;
};
