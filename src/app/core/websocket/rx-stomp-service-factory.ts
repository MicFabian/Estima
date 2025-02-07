import { RxStompService } from '@stomp/ng2-stompjs';
import { environment } from '../../../environments/environment';
import { RxStomp } from '@stomp/rx-stomp';

export function rxStompServiceFactory() {
  const rxStomp = new RxStomp();
  rxStomp.configure({
    brokerURL: `${environment.apiUrl.replace('http', 'ws')}/ws`,
    connectHeaders: {},
    heartbeatIncoming: 0,
    heartbeatOutgoing: 20000,
    reconnectDelay: 500,
    debug: (msg: string): void => {
      console.log(new Date(), msg);
    },
    beforeConnect: () => {
      console.log('Attempting to connect to WebSocket...');
    },
    connectionTimeout: 3000
  });
  
  rxStomp.activate();
  
  // Add connection status monitoring
  rxStomp.connected$.subscribe(() => {
    console.log('Successfully connected to WebSocket');
  });
  
  rxStomp.connectionState$.subscribe((state) => {
    console.log('WebSocket connection state:', state);
  });
  
  return rxStomp;
}
