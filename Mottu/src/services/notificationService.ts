import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  id: string;
  tipo: string;
  moto_id: string;
  severidade: string;
  mensagem: string;
}

class NotificationService {
  private alertasNotificados: Set<string> = new Set();

  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permissão de notificação negada!');
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('alertas-criticos', {
          name: 'Alertas Críticos',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF0000',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      return false;
    }
  }

  async enviarNotificacaoAlerta(alerta: NotificationData) {
    try {
      if (this.alertasNotificados.has(alerta.id)) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: this.getTituloAlerta(alerta.tipo),
          body: `${alerta.moto_id}: ${alerta.mensagem}`,
          data: alerta,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          badge: 1,
        },
        trigger: null,
      });

      this.alertasNotificados.add(alerta.id);

      setTimeout(() => {
        this.alertasNotificados.delete(alerta.id);
      }, 3600000);

    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }

  async enviarNotificacaoSimples(title: string, body: string) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          badge: 1,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }

  async agendarNotificacao(title: string, body: string, seconds: number) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          badge: 1,
        },
        trigger: {
          seconds,
        },
      });
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
    }
  }

  private getTituloAlerta(tipo: string): string {
    switch (tipo) {
      case 'moto_desaparecida':
        return 'ALERTA: MOTO DESAPARECIDA!';
      case 'temperatura_alta':
        return 'ALERTA: Temperatura Crítica!';
      case 'gps_offline':
        return 'ALERTA: GPS Offline!';
      case 'manutencao':
        return 'ALERTA: Manutenção Urgente!';
      default:
        return 'ALERTA CRÍTICO!';
    }
  }

  limparNotificacoes() {
    this.alertasNotificados.clear();
  }

  async cancelarTodasNotificacoes() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async obterNotificacoesPendentes() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
}

export default new NotificationService();

