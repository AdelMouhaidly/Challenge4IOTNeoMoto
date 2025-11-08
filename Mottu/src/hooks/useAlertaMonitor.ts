import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getPythonApiUrl } from '../config/api';
import notificationService from '../services/notificationService';

interface Alerta {
  id: string;
  tipo: string;
  moto_id: string;
  severidade: "baixa" | "media" | "alta";
  mensagem: string;
  timestamp: string;
}

export const useAlertaMonitor = () => {
  const alertasNotificados = useRef<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const permissaoNotificacao = useRef<boolean>(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const solicitarPermissoes = async () => {
      const granted = await notificationService.requestPermissions();
      permissaoNotificacao.current = granted;
    };

    solicitarPermissoes();

    const verificarAlertas = async () => {
      if (!permissaoNotificacao.current) {
        return;
      }

      try {
        const apiUrl = getPythonApiUrl();
        const response = await fetch(`${apiUrl}/alertas?criticos_apenas=true`);
        
        if (response.ok) {
          const alertas: Alerta[] = await response.json();
          
          for (const alerta of alertas) {
            if (!alertasNotificados.current.has(alerta.id)) {
              await notificationService.enviarNotificacaoAlerta({
                id: alerta.id,
                tipo: alerta.tipo,
                moto_id: alerta.moto_id,
                severidade: alerta.severidade,
                mensagem: alerta.mensagem,
              });
              alertasNotificados.current.add(alerta.id);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar alertas:', error);
      }
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        verificarAlertas();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    verificarAlertas();

    intervalRef.current = setInterval(() => {
      if (appState.current === 'active') {
        verificarAlertas();
      }
    }, 30000);

    return () => {
      subscription.remove();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};

