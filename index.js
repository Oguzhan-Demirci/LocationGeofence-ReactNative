import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import HMSLocation from '@hmscore/react-native-hms-location';
import { HmsLocalNotification } from '@hmscore/react-native-hms-push'

const showNotification = (title, message) => {
  const notification = {
    [HmsLocalNotification.Attr.title]: title,
    [HmsLocalNotification.Attr.message]: message, // (required)

  };

  // LocalNotification
  HmsLocalNotification.localNotification(notification)
    .then((result) => {
      this.log("LocalNotification Default", result);
    })
    .catch((err) => {
      //alert("[LocalNotification Default] Error/Exception: " + JSON.stringify(err));
    });

};

HMSLocation.Geofence.Events.registerGeofenceHeadlessTask((data) => {
  showNotification('Geofence', 'Geofence triggered in background.')
});
AppRegistry.registerComponent(appName, () => App);
