import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationData {
  title: string;
  body: string;
  visible: boolean;
}

interface NotificationContextType {
  notification: NotificationData;
  sendLocalNotification: (title: string, body: string) => Promise<void>;
  scheduleNotification: (title: string, body: string, seconds: number) => Promise<void>;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationData>({
    title: "",
    body: "",
    visible: false,
  });
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    setupNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification({
        title: notification.request.content.title || "",
        body: notification.request.content.body || "",
        visible: true,
      });
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      return;
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const setupNotifications = async () => {
    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Mottu Notifications",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF5722",
          sound: "default",
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    } catch (error) {
      return;
    }
  };

  const sendLocalNotification = async (title: string, body: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          badge: 1,
        },
        trigger: null,
      });

      setNotification({
        title,
        body,
        visible: true,
      });
    } catch (error) {
      return;
    }
  };

  const scheduleNotification = async (title: string, body: string, seconds: number) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          badge: 1,
        },
        trigger: {
          seconds,
        },
      });
    } catch (error) {
      return;
    }
  };

  const hideNotification = () => {
    setNotification((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <NotificationContext.Provider
      value={{
        notification,
        sendLocalNotification,
        scheduleNotification,
        hideNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
